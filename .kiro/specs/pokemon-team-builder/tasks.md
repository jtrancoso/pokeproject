# Plan de Implementación: Pokémon Team Builder (HeartGold/SoulSilver)

## Resumen

Implementación incremental del Team Builder: primero el backend Go (tabla de tipos, endpoints de movimientos, búsqueda), luego el frontend React (componentes, hooks, cálculos de tipos), y finalmente la integración completa.

## Tareas

- [x] 1. Implementar tabla de efectividad de tipos Gen IV
  - [x] 1.1 Crear paquete `typeeffectiveness/chart.go` con la tabla de tipos hardcodeada
    - Definir struct `Chart` con `Types []string` y `Data map[string]map[string]float64`
    - Implementar función `NewChart()` que retorna la tabla completa de Gen IV (17 tipos)
    - Implementar función `GetEffectiveness(attackType, defenseType string) float64` que retorna el multiplicador (default 1.0)
    - Solo almacenar valores distintos de 1.0 en el mapa
    - Incluir todas las inmunidades: Normal→Ghost=0, Fighting→Ghost=0, Ghost→Normal=0, Electric→Ground=0, Ground→Flying=0, Psychic→Dark=0, Poison→Steel=0
    - _Requisitos: 9.1, 9.3_

  - [ ]\* 1.2 Escribir tests de propiedades para la tabla de tipos
    - **Propiedad 15: Efectividad de doble tipo es producto de factores individuales**
    - **Propiedad 16: Inmunidades producen factor cero**
    - Usar `pgregory.net/rapid` con mínimo 100 iteraciones
    - Crear `typeeffectiveness/chart_test.go`
    - **Valida: Requisitos 9.2, 9.3, 9.4**

  - [ ]\* 1.3 Escribir tests unitarios para la tabla de tipos
    - Verificar que la tabla contiene exactamente 17 tipos
    - Verificar caso Electric vs Water/Flying = 4.0x
    - Verificar caso Ground vs Flying = 0.0x
    - _Requisitos: 9.1, 9.2, 9.3_

- [x] 2. Implementar endpoint de tipos y endpoint de movimientos
  - [x] 2.1 Crear `api/types.go` con handler GET /api/types/effectiveness
    - Retornar la tabla de tipos como JSON con campos `types` y `chart`
    - Solo incluir entradas que difieren de 1.0
    - Registrar ruta en `main.go`
    - _Requisitos: 9.1_

  - [x] 2.2 Crear `api/moves.go` con handler GET /api/moves/{name}
    - Consultar colección `heartgold-moves` en Firestore por nombre
    - Retornar `MoveResponse` con nombre, tipo, poder, precisión, PP, clase de daño y efecto
    - Retornar 404 para movimientos inexistentes con mensaje descriptivo
    - _Requisitos: 8.1, 8.2_

  - [x] 2.3 Implementar GET /api/pokemon/{name}/moves en `api/moves.go`
    - Consultar Pokémon en Firestore, filtrar movimientos por `version_group_details` donde `version_group.name == "heartgold-soulsilver"`
    - Para cada movimiento filtrado, obtener datos completos de `heartgold-moves`
    - Retornar `PokemonMovesResponse` con nombre del Pokémon y lista de movimientos con `learn_method` y `level_learned_at`
    - _Requisitos: 3.1, 4.1, 4.2_

  - [ ]\* 2.4 Escribir test de propiedad para completitud de datos de movimientos
    - **Propiedad 14: Completitud de datos del endpoint de movimientos**
    - Verificar que respuestas válidas contienen nombre, tipo, PP, clase de daño y efecto
    - Verificar 404 para nombres inválidos
    - **Valida: Requisitos 8.1, 8.2**

  - [x] 2.5 Registrar nuevas rutas en `main.go`
    - Añadir handlers para `/api/types/effectiveness`, `/api/moves/`, `/api/pokemon/` (moves sub-ruta)
    - Configurar CORS para permitir peticiones del frontend
    - _Requisitos: 8.1, 9.1_

- [x] 3. Implementar endpoint de búsqueda unificada
  - [x] 3.1 Crear `api/search.go` con handler GET /api/search?q={query}
    - Validar que `q` tiene mínimo 2 caracteres, retornar 400 si no
    - Implementar búsqueda por nombre: Pokémon cuyo nombre contenga el query (case-insensitive)
    - Implementar búsqueda por tipo: si el query coincide con uno de los 17 tipos, retornar Pokémon de ese tipo
    - Implementar búsqueda por movimiento: buscar movimientos cuyo nombre contenga el query, luego retornar Pokémon que los aprenden en HG/SS
    - Retornar `SearchResponse` con resultados agrupados en `by_name`, `by_type`, `by_move`
    - _Requisitos: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]\* 3.2 Escribir tests de propiedades para búsqueda unificada
    - **Propiedad 1: Búsqueda por nombre retorna solo coincidencias**
    - **Propiedad 2: Búsqueda por tipo retorna solo Pokémon de ese tipo**
    - **Propiedad 3: Búsqueda por movimiento retorna Pokémon que aprenden ese movimiento**
    - Usar `pgregory.net/rapid` con mínimo 100 iteraciones
    - **Valida: Requisitos 1.2, 1.3, 1.4**

  - [x] 3.3 Registrar ruta `/api/search` en `main.go`
    - _Requisitos: 1.5_

- [x] 4. Checkpoint - Verificar backend completo
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Inicializar proyecto frontend React con TypeScript
  - [x] 5.1 Crear proyecto React con Vite y TypeScript en directorio `frontend/`
    - Configurar Vite con proxy al backend Go (puerto 8080)
    - Instalar dependencias: `fast-check` (dev)
    - _Requisitos: 1.1_

  - [x] 5.2 Definir tipos TypeScript en `frontend/src/types/pokemon.ts`
    - Interfaces: `PokemonListItem`, `PokemonDetail`, `MoveDetail`, `TeamSlot`, `TypeChart`, `SearchMatchItem`, `SearchResponse`, `CoverageResult`, `WeaknessResult`
    - _Requisitos: 7.1, 7.2, 7.3_

- [x] 6. Implementar utilidades de cálculo de tipos en el frontend
  - [x] 6.1 Crear `frontend/src/utils/typeCalculator.ts` con funciones puras
    - `getEffectiveness(attackType, defenderTypes, chart)`: multiplicador de un tipo atacante contra tipos defensores (producto de factores individuales)
    - `calculateCoverage(team, chart)`: para cada tipo defensor, cuántos movimientos del equipo son super efectivos (solo physical/special, excluir status)
    - `calculateWeaknesses(team, chart)`: para cada tipo atacante, cuántos Pokémon del equipo son débiles/resisten
    - _Requisitos: 5.1, 5.2, 5.5, 6.1, 6.2, 6.3, 9.2, 9.4_

  - [ ]\* 6.2 Escribir tests de propiedades para typeCalculator
    - **Propiedad 11: Cálculo de cobertura ofensiva**
    - **Propiedad 12: Cálculo de debilidades y resistencias del equipo**
    - **Propiedad 15: Efectividad de doble tipo es producto de factores individuales**
    - **Propiedad 16: Inmunidades producen factor cero**
    - Usar `fast-check` con mínimo 100 iteraciones
    - **Valida: Requisitos 5.1, 5.2, 5.5, 6.1, 6.2, 6.3, 9.2, 9.3, 9.4**

  - [ ]\* 6.3 Escribir tests unitarios para typeCalculator
    - Verificar Electric vs Water/Flying = 4.0x
    - Verificar Ground vs Flying = 0.0x
    - Verificar equipo vacío produce cobertura y debilidades vacías
    - Verificar movimientos "status" no cuentan en cobertura
    - _Requisitos: 5.5, 9.2, 9.3_

- [x] 7. Implementar hook useTeam para gestión del equipo
  - [x] 7.1 Crear `frontend/src/hooks/useTeam.ts`
    - Estado inicial: 6 slots vacíos (`pokemon: null, moves: []`)
    - `addPokemon`: asignar al primer slot vacío, retornar false si equipo lleno
    - `removePokemon`: liberar slot por índice
    - `addMove`: añadir movimiento a un slot (máximo 4, sin duplicados), retornar false si no se puede
    - `removeMove`: eliminar movimiento por índice de slot y de movimiento
    - `isFull`: computed que indica si los 6 slots están ocupados
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.5, 3.6_

  - [ ]\* 7.2 Escribir tests de propiedades para useTeam
    - **Propiedad 4: Invariante de tamaño del equipo**
    - **Propiedad 5: Eliminar Pokémon libera el slot**
    - **Propiedad 6: Asignación al primer slot disponible**
    - **Propiedad 8: Invariante de cantidad de movimientos y unicidad**
    - **Propiedad 9: Eliminar movimiento reduce la lista**
    - Usar `fast-check` con mínimo 100 iteraciones
    - **Valida: Requisitos 2.1, 2.2, 2.3, 2.4, 3.2, 3.5, 3.6**

- [x] 8. Implementar hooks de búsqueda y tabla de tipos
  - [x] 8.1 Crear `frontend/src/hooks/useSearch.ts`
    - Debounce de input (300ms)
    - Llamada a `GET /api/search?q={query}` cuando query >= 2 caracteres
    - Manejar estados de loading y error
    - _Requisitos: 1.2, 1.3, 1.4, 1.5_

  - [x] 8.2 Crear `frontend/src/hooks/useTypeChart.ts`
    - Cargar tabla de tipos una vez desde `GET /api/types/effectiveness`
    - Cachear en estado del hook
    - _Requisitos: 9.1_

- [x] 9. Implementar componentes de búsqueda y resultados
  - [x] 9.1 Crear componente `SearchBar.tsx`
    - Campo de búsqueda unificado con placeholder descriptivo
    - Integrar hook `useSearch`
    - _Requisitos: 1.5_

  - [x] 9.2 Crear componentes `SearchResults.tsx` y `PokemonCard.tsx`
    - `SearchResults`: mostrar resultados agrupados por categoría (by_name, by_type, by_move)
    - `PokemonCard`: tarjeta con nombre, número regional, tipos (usando TypeBadge) y sprite
    - Botón para añadir Pokémon al equipo
    - _Requisitos: 1.1, 1.6_

  - [x] 9.3 Crear componente `TypeBadge.tsx`
    - Badge visual con color según tipo de Pokémon
    - _Requisitos: 7.3_

- [x] 10. Implementar componentes del equipo
  - [x] 10.1 Crear componentes `TeamPanel.tsx` y `TeamSlot.tsx`
    - `TeamPanel`: panel con 6 slots, integrar hook `useTeam`
    - `TeamSlot`: mostrar Pokémon asignado o slot vacío, botón de eliminar
    - Mostrar mensaje cuando equipo está completo
    - _Requisitos: 2.1, 2.2, 2.3_

  - [x] 10.2 Crear componente `PokemonDetail.tsx`
    - Mostrar stats base (HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed)
    - Mostrar habilidades indicando cuál es oculta
    - Mostrar tipos y sprite
    - _Requisitos: 7.1, 7.2, 7.3_

- [x] 11. Implementar selector de movimientos
  - [x] 11.1 Crear componentes `MoveSelector.tsx` y `MoveCard.tsx`
    - `MoveSelector`: cargar movimientos del Pokémon desde `GET /api/pokemon/{name}/moves`, filtro por método de aprendizaje (level-up, machine, tutor, egg), mostrar todos por defecto
    - `MoveCard`: mostrar tipo, poder, precisión, PP y clase de daño del movimiento
    - Deshabilitar movimientos ya asignados, deshabilitar botón de añadir si ya tiene 4
    - Mostrar nivel de aprendizaje cuando filtro es "level-up"
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3_

  - [ ]\* 11.2 Escribir tests de propiedades para filtro de movimientos
    - **Propiedad 10: Filtro de movimientos por método de aprendizaje**
    - Usar `fast-check` con mínimo 100 iteraciones
    - **Valida: Requisitos 4.1, 4.2**

- [x] 12. Implementar gráficos de cobertura y debilidades
  - [x] 12.1 Crear componente `CoverageChart.tsx`
    - Mostrar para cada uno de los 17 tipos cuántos movimientos del equipo son super efectivos
    - Resaltar tipos no cubiertos por ningún movimiento
    - Recalcular al cambiar movimientos o Pokémon
    - Integrar `calculateCoverage` de typeCalculator
    - _Requisitos: 5.1, 5.2, 5.3, 5.4_

  - [x] 12.2 Crear componente `WeaknessChart.tsx`
    - Mostrar para cada uno de los 17 tipos cuántos Pokémon son débiles y cuántos resisten
    - Resaltar tipos contra los cuales 3+ Pokémon son débiles
    - Recalcular al cambiar Pokémon del equipo
    - Integrar `calculateWeaknesses` de typeCalculator
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Integrar App principal y conectar componentes
  - [x] 13.1 Crear `frontend/src/App.tsx` integrando todos los componentes
    - Layout: buscador arriba, resultados a la izquierda, equipo a la derecha, análisis abajo
    - Conectar SearchBar → SearchResults → TeamPanel
    - Conectar TeamSlot → PokemonDetail + MoveSelector
    - Conectar TeamPanel → CoverageChart + WeaknessChart
    - Manejar errores de red con mensajes y botón de reintentar
    - _Requisitos: 1.1, 2.1, 5.4, 6.5_

- [x] 14. Checkpoint final - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan propiedades universales de correctitud
- Los tests unitarios validan ejemplos específicos y casos borde
