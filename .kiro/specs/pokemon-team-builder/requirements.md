# Documento de Requisitos: Pokémon Team Builder (HeartGold/SoulSilver)

## Introducción

Aplicación web que permite a los jugadores de Pokémon HeartGold/SoulSilver configurar equipos de hasta 6 Pokémon, asignar movimientos a cada uno y obtener un análisis de cobertura de tipos y debilidades del equipo. La aplicación consume datos de Pokémon y movimientos almacenados en Firestore (previamente poblados desde PokeAPI) a través de un backend en Go.

## Glosario

- **Sistema**: La aplicación Pokémon Team Builder en su conjunto (backend + frontend)
- **API**: El servidor backend en Go que expone endpoints REST y se comunica con Firestore
- **Frontend**: La interfaz web que el usuario utiliza para interactuar con la aplicación
- **Equipo**: Un conjunto de 1 a 6 Pokémon seleccionados por el usuario
- **Slot**: Una posición dentro del equipo donde se asigna un Pokémon (máximo 6 slots)
- **Movimiento**: Un ataque o técnica que un Pokémon puede aprender y usar en combate
- **Cobertura_de_Tipos**: Análisis que muestra qué tipos de Pokémon enemigos son vulnerables a los movimientos del equipo
- **Análisis_de_Debilidades**: Análisis que muestra qué tipos de ataques enemigos son super efectivos contra los Pokémon del equipo
- **Tabla_de_Tipos**: La matriz de efectividad de tipos de la Generación IV (HeartGold/SoulSilver)
- **Pokédex_Johto**: El listado de Pokémon disponibles en la región de Johto, almacenados en la colección `heartgold-pokemon` de Firestore
- **Catálogo_de_Movimientos**: El listado de movimientos de las Generaciones I-IV, almacenados en la colección `heartgold-moves` de Firestore

## Requisitos

### Requisito 1: Buscar y listar Pokémon disponibles

**User Story:** Como jugador, quiero buscar Pokémon por nombre, tipo o movimiento desde un buscador unificado, para poder encontrar rápidamente los Pokémon que necesito para mi equipo.

#### Criterios de Aceptación

1. WHEN el usuario accede a la pantalla de selección de Pokémon, THE Frontend SHALL mostrar la lista completa de Pokémon de la Pokédex_Johto con nombre, número regional, tipos y sprite.
2. WHEN el usuario escribe un nombre de Pokémon en el buscador unificado, THE Frontend SHALL filtrar la lista mostrando solo los Pokémon cuyo nombre contenga el texto ingresado (case-insensitive).
3. WHEN el usuario escribe un nombre de tipo en el buscador unificado (por ejemplo "fire", "water"), THE Frontend SHALL mostrar todos los Pokémon que tengan ese tipo como tipo primario o secundario.
4. WHEN el usuario escribe un nombre de movimiento en el buscador unificado (por ejemplo "thunderbolt", "earthquake"), THE Sistema SHALL mostrar todos los Pokémon que pueden aprender ese movimiento en HeartGold/SoulSilver.
5. THE Frontend SHALL utilizar un único campo de búsqueda que detecte automáticamente si el texto corresponde a un nombre de Pokémon, un tipo o un movimiento, y retorne los resultados apropiados.
6. WHEN el buscador detecta coincidencias en múltiples categorías (nombre, tipo, movimiento), THE Frontend SHALL mostrar los resultados agrupados por categoría indicando claramente el origen de cada grupo.

### Requisito 2: Gestionar equipo de Pokémon

**User Story:** Como jugador, quiero configurar un equipo de hasta 6 Pokémon, para poder planificar mi equipo antes de jugar.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir al usuario añadir entre 1 y 6 Pokémon al Equipo.
2. WHEN el usuario intenta añadir un Pokémon y el Equipo ya contiene 6 Pokémon, THE Frontend SHALL mostrar un mensaje indicando que el equipo está completo y no añadir el Pokémon.
3. WHEN el usuario elimina un Pokémon del Equipo, THE Sistema SHALL remover el Pokémon del Slot correspondiente y liberar la posición.
4. WHEN el usuario añade un Pokémon al Equipo, THE Sistema SHALL asignar el Pokémon al primer Slot disponible.
5. THE Sistema SHALL permitir al usuario añadir el mismo Pokémon en múltiples Slots del Equipo.

### Requisito 3: Asignar movimientos a un Pokémon del equipo

**User Story:** Como jugador, quiero asignar hasta 4 movimientos a cada Pokémon de mi equipo, para simular la configuración real del juego.

#### Criterios de Aceptación

1. WHEN el usuario selecciona un Pokémon del Equipo para editar movimientos, THE Frontend SHALL mostrar la lista de movimientos que ese Pokémon puede aprender en HeartGold/SoulSilver según los datos de la Pokédex_Johto.
2. THE Sistema SHALL permitir asignar entre 0 y 4 Movimientos a cada Pokémon del Equipo.
3. WHEN el usuario intenta asignar un quinto Movimiento a un Pokémon, THE Frontend SHALL mostrar un mensaje indicando que el Pokémon ya tiene 4 movimientos asignados y no añadir el movimiento.
4. WHEN el usuario asigna un Movimiento, THE Frontend SHALL mostrar el tipo, poder, precisión, PP y clase de daño del Movimiento seleccionado.
5. THE Sistema SHALL impedir que el usuario asigne el mismo Movimiento dos veces al mismo Pokémon.
6. WHEN el usuario elimina un Movimiento de un Pokémon, THE Sistema SHALL remover el Movimiento de la lista de movimientos asignados a ese Pokémon.

### Requisito 4: Filtrar movimientos por método de aprendizaje

**User Story:** Como jugador, quiero filtrar los movimientos disponibles por método de aprendizaje (nivel, MT/MO, tutor, huevo), para encontrar más fácilmente el movimiento que busco.

#### Criterios de Aceptación

1. WHEN el usuario selecciona un filtro de método de aprendizaje, THE Frontend SHALL mostrar solo los Movimientos que el Pokémon puede aprender por ese método en el version group "heartgold-soulsilver".
2. WHEN el usuario filtra por "nivel", THE Frontend SHALL mostrar el nivel al que el Pokémon aprende cada Movimiento.
3. THE Frontend SHALL mostrar por defecto todos los movimientos disponibles sin filtro de método de aprendizaje.

### Requisito 5: Análisis de cobertura de tipos

**User Story:** Como jugador, quiero ver qué tipos de Pokémon enemigos son vulnerables a los movimientos de mi equipo, para saber si tengo buena cobertura ofensiva.

#### Criterios de Aceptación

1. WHEN el Equipo tiene al menos un Pokémon con al menos un Movimiento asignado, THE Sistema SHALL calcular la Cobertura_de_Tipos basándose en los tipos de los Movimientos asignados y la Tabla_de_Tipos de Generación IV.
2. THE Frontend SHALL mostrar la Cobertura_de_Tipos indicando para cada uno de los 17 tipos cuántos movimientos del equipo son super efectivos contra ese tipo.
3. THE Frontend SHALL resaltar visualmente los tipos que no están cubiertos por ningún movimiento super efectivo del equipo.
4. WHEN el usuario modifica los Movimientos o Pokémon del Equipo, THE Sistema SHALL recalcular la Cobertura_de_Tipos de forma inmediata.
5. THE Sistema SHALL considerar solo movimientos con clase de daño "physical" o "special" para el cálculo de Cobertura_de_Tipos, excluyendo movimientos de clase "status".

### Requisito 6: Análisis de debilidades del equipo

**User Story:** Como jugador, quiero ver contra qué tipos de ataques mi equipo es más vulnerable, para identificar debilidades y ajustar mi equipo.

#### Criterios de Aceptación

1. WHEN el Equipo tiene al menos un Pokémon, THE Sistema SHALL calcular el Análisis_de_Debilidades basándose en los tipos de cada Pokémon del Equipo y la Tabla_de_Tipos de Generación IV.
2. THE Frontend SHALL mostrar el Análisis_de_Debilidades indicando para cada uno de los 17 tipos cuántos Pokémon del equipo son débiles (reciben daño super efectivo) contra ese tipo.
3. THE Frontend SHALL mostrar para cada uno de los 17 tipos cuántos Pokémon del equipo resisten (reciben daño no muy efectivo o son inmunes) ataques de ese tipo.
4. THE Frontend SHALL resaltar visualmente los tipos contra los cuales 3 o más Pokémon del equipo son débiles.
5. WHEN el usuario modifica los Pokémon del Equipo, THE Sistema SHALL recalcular el Análisis_de_Debilidades de forma inmediata.

### Requisito 7: Ver detalle de un Pokémon

**User Story:** Como jugador, quiero ver los detalles de un Pokémon (stats base, habilidades, tipos), para tomar decisiones informadas al construir mi equipo.

#### Criterios de Aceptación

1. WHEN el usuario selecciona un Pokémon de la lista o del Equipo, THE Frontend SHALL mostrar los stats base del Pokémon (HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed).
2. WHEN el usuario selecciona un Pokémon, THE Frontend SHALL mostrar las habilidades del Pokémon indicando cuál es la habilidad oculta.
3. WHEN el usuario selecciona un Pokémon, THE Frontend SHALL mostrar los tipos del Pokémon y el sprite del Pokémon.

### Requisito 8: Endpoints de la API para movimientos

**User Story:** Como desarrollador del frontend, quiero endpoints para consultar movimientos, para poder mostrar la información de movimientos en la interfaz.

#### Criterios de Aceptación

1. WHEN la API recibe una petición GET a /moves/{name}, THE API SHALL responder con los datos completos del Movimiento desde el Catálogo_de_Movimientos incluyendo nombre, tipo, poder, precisión, PP, clase de daño y descripción del efecto.
2. IF la API recibe una petición GET a /moves/{name} con un nombre que no existe en el Catálogo_de_Movimientos, THEN THE API SHALL responder con código HTTP 404 y un mensaje de error descriptivo.

### Requisito 9: Cálculo de efectividad de tipos

**User Story:** Como jugador, quiero que los cálculos de efectividad sean precisos según la Generación IV, para que el análisis refleje correctamente el juego.

#### Criterios de Aceptación

1. THE Sistema SHALL implementar la Tabla_de_Tipos completa de Generación IV con los 17 tipos (Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel).
2. THE Sistema SHALL calcular la efectividad contra Pokémon con doble tipo multiplicando los factores de efectividad de cada tipo individual.
3. THE Sistema SHALL reconocer las inmunidades de tipo (factor 0x) como: Normal y Fighting contra Ghost, Ground contra Flying, Ghost contra Normal, Psychic contra Dark, Poison contra Steel, Electric contra Ground, Dragon contra Fairy.
4. IF un Movimiento tiene tipo que es inmune contra uno de los tipos del Pokémon defensor, THEN THE Sistema SHALL asignar un factor de efectividad de 0x independientemente del segundo tipo del Pokémon defensor.
