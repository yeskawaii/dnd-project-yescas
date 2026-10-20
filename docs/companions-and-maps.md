# Acompañantes y mapa táctico

## Personajes

En **Personaje → Acompañantes** se pueden crear familiares, invocaciones,
homúnculos, compañeros animales, monturas y otros acompañantes. También hay
un acceso en **Partida** con el número de criaturas presentes.

Cada criatura conserva nombre, vínculo, presencia, PV actuales y máximos, CA,
bono de iniciativa, velocidad, duración, acciones y notas. Se pueden editar sus
PV desde la tarjeta y todos sus datos desde **Editar ficha**. Marcarla ausente
o desinvocarla conserva la ficha; eliminarla requiere confirmación.

Las estadísticas, capacidades y duraciones se registran manualmente según lo
acordado con el DM. No se calculan a partir del nivel del dueño ni expiran
al avanzar las rondas. Cada personaje admite hasta 50 acompañantes. Varias
criaturas invocadas pueden registrarse como fichas independientes.

## Encuentros del DM

**Grupo → personaje → Acompañantes** permite consultar las criaturas y añadir
las presentes al encuentro. **Combate → Añadir acompañantes** abre el grupo;
también aparecen al consultar un jugador dentro del combate. Si el jugador
ha cambiado sus criaturas, se deben actualizar las fichas del grupo.

Cada acompañante tiene turno, PV, estados y ficha de mapa propios. Su origen
combina el identificador del dueño y de la criatura para evitar duplicados.
El encuentro conserva una copia: sus PV son independientes de la ficha del
jugador. Desinvocar, editar o eliminar el original no retira esa copia; el DM
puede retirarla desde el combate. Los acompañantes se añaden como aliados
visibles y el DM puede volver a ocultarlos.

## Mapas

Las campañas nuevas empiezan con hexágonos. Los mapas existentes conservan la
cuadrícula. **Mapa → Formato del mapa** cambia la geometría conservando terreno
y coordenadas de las fichas. Los hexágonos tienen vértice superior y filas
impares desplazadas a la derecha. La proyección cambia la forma visual del
escenario; conviene revisar el resultado antes de compartirlo.

El mapa ofrece zoom, centrado de ficha, selección del turno activo, pintura
continua con ratón, edición con flechas y Enter, y medición entre dos celdas.
La escala se guarda por mapa. La medición hexagonal cuenta pasos entre vecinos;
en cuadrícula, las diagonales alternan uno y dos pasos. No calcula rutas,
obstáculos, terreno difícil ni consumo de movimiento.

DM y jugadores usan el mismo renderizador. El zoom y las mediciones son locales;
el formato, la escala, el terreno y las posiciones se guardan con la mesa.
La respuesta pública conserva el filtrado de criaturas ocultas y fichas bajo
niebla. Los clientes antiguos que omitan formato o escala al guardar conservan
los valores existentes.
