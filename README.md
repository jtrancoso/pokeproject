# MochiPC — Pokémon Team Builder

[mochipc.com](https://mochipc.com)

Herramienta web para planificar equipos Pokémon de HeartGold y SoulSilver.

## ¿Qué hace?

- Busca Pokémon por nombre, tipo o movimiento (en español e inglés)
- Monta un equipo de hasta 6 Pokémon
- Asigna hasta 4 movimientos a cada Pokémon (solo los que puede aprender en HG/SS)
- Analiza la cobertura ofensiva de tu equipo: qué tipos cubres con tus ataques
- Analiza las debilidades defensivas: contra qué tipos es vulnerable tu equipo
- Guarda tu equipo en el navegador para no perderlo

## Stack

- Backend: Go
- Frontend: React + TypeScript (Vite)
- Datos: PokeAPI → Firestore → JSON estáticos
- Deploy: Google Cloud Run

## Desarrollo local

```bash
# Backend
go run main.go

# Frontend (en otra terminal)
cd frontend && npm run dev
```

El frontend hace proxy al backend en `localhost:8080`.

## Datos

Los datos de Pokémon y movimientos se obtienen de [PokeAPI](https://pokeapi.co/) y se almacenan como JSON estáticos en la carpeta `data/`. Para regenerarlos desde Firestore:

```bash
go run main.go -export
```
