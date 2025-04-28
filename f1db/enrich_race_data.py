import pandas as pd
import fastf1 as ff1
import os
import logging
from fastf1.req import Cache
import concurrent.futures
from tqdm import tqdm

F1DB_DIR = "."
RACES_FILE = os.path.join(F1DB_DIR, "races.csv")
DRIVERS_FILE = os.path.join(F1DB_DIR, "drivers.csv")
OUTPUT_WEATHER_FILE = os.path.join(F1DB_DIR, "weather.csv")
OUTPUT_TIRES_FILE = os.path.join(F1DB_DIR, "tyre_stints.csv")
CACHE_DIR = "ff1_cache"
START_YEAR = 2018
MAX_WORKERS = 10

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logging.disable(logging.WARNING)

os.makedirs(CACHE_DIR, exist_ok=True)
Cache.enable_cache(CACHE_DIR)

try:
    races_df = pd.read_csv(RACES_FILE)
    drivers_df = pd.read_csv(DRIVERS_FILE)
except FileNotFoundError as e:
    exit()

races_filtered_df = races_df[races_df["year"] >= START_YEAR].copy()
driver_ref_to_id = drivers_df.set_index("driverRef")["driverId"].to_dict()
driver_code_to_ref = drivers_df.set_index("code")["driverRef"].to_dict()


def process_race(race_row):
    year = int(race_row["year"])
    race_round = int(race_row["round"])
    race_id = int(race_row["raceId"])

    weather_result = {
        "raceId": race_id,
        "avg_airtemp": None,
        "avg_tracktemp": None,
        "avg_humidity": None,
        "avg_pressure": None,
        "avg_windspeed": None,
        "rainfall": None,
    }
    stint_results = []

    try:
        session = ff1.get_session(year, race_round, "R")
        try:
            session.load(weather=True, laps=False, telemetry=False, messages=False)
            weather_df = session.weather_data
            if weather_df is not None and not weather_df.empty:
                for col in [
                    "AirTemp",
                    "TrackTemp",
                    "Humidity",
                    "Pressure",
                    "WindSpeed",
                ]:
                    if col in weather_df.columns:
                        mean_val = weather_df[col].mean()
                        weather_result[f"avg_{col.lower()}"] = (
                            round(mean_val, 2) if pd.notna(mean_val) else None
                        )
                if "Rainfall" in weather_df.columns:
                    weather_result["rainfall"] = bool(weather_df["Rainfall"].max() > 0)
        except Exception:
            pass

        try:
            session.load(laps=True, telemetry=False, weather=False, messages=False)
            laps_df = session.laps
            results_df = session.results
            if (
                laps_df is not None
                and not laps_df.empty
                and results_df is not None
                and not results_df.empty
            ):
                driver_num_to_code = results_df.set_index("DriverNumber")[
                    "Abbreviation"
                ].to_dict()
                driver_num_to_team = results_df.set_index("DriverNumber")[
                    "TeamName"
                ].to_dict()
                stints = laps_df.groupby(["DriverNumber", "Stint"])
                for (driver_number, stint_num), stint_laps in stints:
                    compound = stint_laps["Compound"].iloc[0]
                    start_lap = stint_laps["LapNumber"].min()
                    lap_count = len(stint_laps)
                    tyre_age_at_start = stint_laps.loc[
                        stint_laps["LapNumber"] == start_lap, "TyreLife"
                    ].iloc[0]
                    driver_code = driver_num_to_code.get(driver_number)
                    driver_ref = driver_code_to_ref.get(driver_code)
                    driver_id = driver_ref_to_id.get(driver_ref)
                    team_name = driver_num_to_team.get(driver_number)
                    if driver_id:
                        stint_results.append(
                            {
                                "raceId": race_id,
                                "driverId": driver_id,
                                "stintNumber": int(stint_num),
                                "compound": compound,
                                "startLap": int(start_lap),
                                "lapCount": int(lap_count),
                                "tyreAgeAtStart": (
                                    int(tyre_age_at_start)
                                    if pd.notna(tyre_age_at_start)
                                    else None
                                ),
                                "teamName": team_name,
                            }
                        )
        except Exception:
            pass
    except Exception:
        pass

    return weather_result, stint_results


weather_data_list = []
tire_data_list = []
total_races = len(races_filtered_df)

with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
    futures = [
        executor.submit(process_race, race_row)
        for _, race_row in races_filtered_df.iterrows()
    ]
    for future in tqdm(
        concurrent.futures.as_completed(futures),
        total=total_races,
        desc="Processing Races",
    ):
        try:
            weather_result, stint_results_for_race = future.result()
            if weather_result:
                weather_data_list.append(weather_result)
            if stint_results_for_race:
                tire_data_list.extend(stint_results_for_race)
        except Exception:
            pass

if weather_data_list:
    pd.DataFrame(weather_data_list).sort_values(by="raceId").reset_index(
        drop=True
    ).to_csv(OUTPUT_WEATHER_FILE, index=False)
if tire_data_list:
    pd.DataFrame(tire_data_list).sort_values(
        by=["raceId", "driverId", "stintNumber"]
    ).reset_index(drop=True).to_csv(OUTPUT_TIRES_FILE, index=False)
