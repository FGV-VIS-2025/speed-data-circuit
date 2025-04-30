import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
import urllib.request
from PIL import Image

constructor_data = pd.read_csv("../f1db/constructors.csv")
constructor_standings_data = pd.read_csv("../f1db/constructor_standings.csv")
races_data = pd.read_csv("../f1db/races.csv")

races_data = races_data[
    (races_data["year"] >= 2018) & (races_data["year"] <= 2024)
].copy()
races_ids = races_data["raceId"].unique().tolist()
constructor_standings_data = constructor_standings_data[
    constructor_standings_data["raceId"].isin(races_ids)
].copy()
valid_constructors = constructor_standings_data["constructorId"].unique().tolist()
constructor_data = constructor_data[
    constructor_data["constructorId"].isin(valid_constructors)
].copy()

# Pasta onde as logos serão salvas
output_dir = "constructor_logos"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for index, constructor in constructor_data.iterrows():
    constructor_name = constructor["constructorRef"]
    wiki_url = constructor["url"]

    # Verifica se a logo já foi baixada
    logo_filename = os.path.join(output_dir, f"{constructor_name}.png")
    if os.path.exists(logo_filename):
        print(f"Logo {constructor_name} já baixada.")
        continue

    response = requests.get(wiki_url)
    soup = BeautifulSoup(response.content, "html.parser")
    infobox_image = soup.find(class_="infobox-image")
    if infobox_image:
        img_tag = infobox_image.find("img")
        if img_tag and img_tag.get("src"):
            img_url = img_tag["src"]
            if img_url.startswith("//"):
                img_url = "https:" + img_url
            elif img_url.startswith("/"):
                img_url = "https://en.wikipedia.org" + img_url
            try:
                urllib.request.urlretrieve(img_url, logo_filename)
                # Redimensiona a imagem mantendo proporção (máx 200x200)
                with Image.open(logo_filename) as img:
                    img.thumbnail((500, 500))
                    img.save(logo_filename)
            except Exception as e:
                print(f"Erro ao baixar imagem para {constructor_name}: {e}")
        else:
            print(f"Nenhuma imagem encontrada para {constructor_name}.")
    else:
        print(f"Nenhum td com classe infobox-image encontrado para {constructor_name}.")

print("Concluído.")
