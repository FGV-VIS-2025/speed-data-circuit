# Link da página

https://fgv-vis-2025.github.io/speed-data-circuit/

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/oHw8ptbv)

---
> ### **Equipe:**  
> - Alessandra Belló Soares – Alessandrabellosoares@gmail.com – @AlessandraBello  
> - Matheus Fillype Ferreira de Carvalho – matheuscarvalho210404@outlook.com – @MatCarvalho21  
> - Sillas Rocha da Costa – sillasrocha29@gmail.com – @scrocha  

---

# Visualização Interativa de Corridas de Fórmula 1

## Entregas

Este projeto apresenta uma visualização interativa baseada em D3.js para explorar dados de corridas de Fórmula 1. O objetivo é permitir ao usuário investigar, comparar e entender o desempenho dos pilotos ao longo das voltas de uma corrida, além de analisar outros aspectos relevantes (idade, pneus, clima etc.) e aspectos da competição como um todo para pilotos selecionados. A visualização está disponível em:  
https://fgv-vis-2025.github.io/speed-data-circuit/

## Justificativa de Design

- **Codificações Visuais:**  
  Utilizamos gráficos de barras animados para mostrar a evolução das posições dos pilotos volta a volta, pois esse formato facilita a comparação direta entre competidores. A ideia principal é tentar visualizar a corrida em si, com as ultrapassagens acontecendo a todo o momento. As cores das equipes seguem o padrão oficial da F1 para fácil identificação. Ícones e sprites dos pilotos e equipes enriquecem a experiência visual. Além disso, também exibimos gráficos auxiliares, mostrando fatores relevantes da competição, como o ranking dos pilotos na temporada selecionada até o momento da corrida, além da evolução completa da corrida, plotando a mudança das posições dos pilotos como um gráfico de linhas.
- **Interações:**  
  O usuário pode selecionar o ano e a corrida, navegar entre voltas com slider, pausar/continuar a animação e obter detalhes sob demanda via tooltip ao passar o mouse sobre cada piloto. Também é possível filtrar por pilotos para ver o desempenho individual.  
  Filtros e destaques foram escolhidos para facilitar a exploração e o storytelling, permitindo que o usuário foque em pilotos ou equipes de interesse.
- **Técnicas de Animação:**  
  As transições animadas entre voltas ajudam a perceber mudanças de posição e desempenho ao longo do tempo, tornando a visualização mais envolvente e compreensível.
- **Alternativas Consideradas:**  
  Consideramos gráficos de linha e scatterplots, mas o gráfico de barras animado se mostrou mais intuitivo para o público-alvo e para o tipo de comparação desejada.

## Processo de Desenvolvimento

- **Divisão de Trabalho:**  
  - Levantamento e limpeza dos dados: Sillas
  - Implementação do gráfico principal e animações: Matheus
  - Interações, tooltips e filtros: Todos
  - Gráficos auxiliares: Alessandra
  - Documentação e deploy: Todos
- **Tempo Gasto:**
  O tempo total estimado para o projeto foi de aproximadamente 50 horas, distribuídas entre os membros da equipe.

  - Sillas: Levantamento e limpeza dos dados (10 horas)
  - Matheus: Implementação do gráfico principal e animações (10 horas)
  - Matheus: Desenho dos sprites dos carros (5 horas)
  - Alessandra: Gráficos auxiliares (10 horas)
  - Todos: Integrações do projeto, tooltips e filtros (15 horas)

## Fontes e Inspirações

- **Dados:**  
  - [Ergast Developer API](./src/download-data.js) ([ergast.com/mrd](https://ergast.com/mrd/))
  - [Dados auxiliares](./f1db/enrich_race_data.py) da biblioteca Python FastF1 ([github.com/theOehrly/Fast-F1](https://github.com/theOehrly/Fast-F1))
  - Imagens: assets oficiais da F1 e Wikimedia Commons
  - Sprites: Desenvolvidos pelo Matheus, com base em imagens oficiais da F1
- **Inspiração Visual:**  
  - Gráficos de exemplo da Fast F1 ([docs.fastf1.dev](https://docs.fastf1.dev/gen_modules/examples_gallery/index.html))
  - Visualizações do site oficial da F1
- **Ferramentas:**  
  - D3.js para visualização
  - Python para enriquecimento dos dados
  - Github Pages para deploy
  - Ferramentas de IA (ver abaixo)

## Uso de GPT/IA

Utilizamos ferramentas de IA (como o ChatGPT) para:
- Entender conceitos de D3.js
- Revisar e sugerir melhorias em trechos de código
- Gerar explicações e documentação inicial

Todo o código foi revisado manualmente e adaptado para o contexto do projeto. Não houve uso de código gerado por IA sem revisão.

---
