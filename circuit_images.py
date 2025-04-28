import requests
from bs4 import BeautifulSoup
import os
import pandas as pd

def baixar_imagem_wikipedia(url, nome_do_arquivo, pasta_destino='assets/circuits'):
    # Faz a requisição HTTP
    response = requests.get(url)
    response.raise_for_status()

    # Faz o parsing do HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # Acha a tag <td> com classe infobox-image
    td_imagem = soup.find('td', class_='infobox-image')
    if td_imagem is None:
        print(f"Nenhuma imagem encontrada para {url}")
        return

    # Dentro dela, pega a primeira <img>
    img_tag = td_imagem.find('img')
    if img_tag is None:
        print(f"Nenhuma tag <img> encontrada para {url}")
        return

    # O atributo 'src' tem o link da imagem
    src = img_tag['src']
    if src.startswith('//'):
        src = 'https:' + src  # Corrige links que começam com //

    # Pega o nome do arquivo da imagem
    nome_arquivo = nome_do_arquivo + ".png"

    # Cria a pasta se não existir
    os.makedirs(pasta_destino, exist_ok=True)

    # Faz o download da imagem
    img_response = requests.get(src)
    img_response.raise_for_status()

    caminho_arquivo = os.path.join(pasta_destino, nome_arquivo)
    with open(caminho_arquivo, 'wb') as f:
        f.write(img_response.content)

    print(f"Imagem salva em {caminho_arquivo}")

data = pd.read_csv("f1db/circuits.csv")
for each_id, each_link in zip(data["circuitId"], data["url"]):
    if pd.notna(each_link):
        try:
            baixar_imagem_wikipedia(each_link, str(each_id))
        
        except:
            print("Erro: ", each_id)
        