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

**Mapa → Ficha para colocar o mover** muestra los personajes del grupo y sus
acompañantes presentes, aunque el combate esté vacío. Selecciona una ficha y
toca una casilla para colocarla; **Colocar grupo** distribuye los personajes
que faltan en casillas libres, sin muros ni niebla y sin mover los ya colocados.
**Actualizar fichas del grupo** consulta los personajes y acompañantes actuales.

Las fichas colocadas sin combate se guardan con el mapa, sin añadir turnos ni
participantes al encuentro. Al añadir después ese personaje o acompañante al
combate, se reutiliza su ficha y se conserva su posición. Cerrar el encuentro
retira solo sus fichas y conserva las que pertenecen únicamente al mapa.
El nombre de la escena ocupa una fila propia y aparece completo en el encabezado,
con saltos de línea cuando la pantalla es estrecha.

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

### Movimiento de los jugadores

Con la mesa y el mapa compartidos, cada jugador puede mover la ficha de su
personaje desde **Partida → Mesa compartida**, incluso sin un combate. El DM
primero debe colocar su ficha fuera de la niebla desde **Mapa**. La ficha propia
queda seleccionada: basta tocar una casilla libre, o usar flechas y Enter.
Al abrir el mapa o cuando el DM coloca tu ficha, la vista se centra en ella,
también en celular. **Centrar mi ficha** permite recuperarla después de explorar
el escenario. Puedes deslizar el mapa en ambas direcciones; al actualizarse
las posiciones se conserva el área que estabas mirando.
El movimiento se guarda al momento; el resto del grupo y el DM reciben las
posiciones automáticamente cada cuatro segundos.

El servidor comprueba la cuenta dueña del personaje y su pertenencia actual a
la campaña en cada movimiento. El jugador solo controla su ficha de personaje;
las fichas ajenas, enemigos y acompañantes siguen bajo control del DM. No puede
colocar ni retirar fichas, editar terreno ni entrar en casillas ocupadas, muros
o niebla. Si su ficha queda bajo niebla, el DM debe volver a revelarla o moverla.
El movimiento es libre según lo acordado con el DM: no valida rutas, velocidad
ni turno activo.

El DM conserva el movimiento de todas las fichas. Los movimientos entrantes se
combinan con sus cambios pendientes sin borrar notas ni otros ajustes. Si el
DM también mueve esa misma ficha, su cambio pendiente tiene prioridad al
guardar. Los destinos que coincidan y otros cambios simultáneos de la mesa
mantienen la protección de conflictos; no se sobrescriben automáticamente.

### Iconos de las fichas

Cada personaje usa su emblema en la ficha del mapa y en la leyenda, en lugar de
un número. Desde **Mesa → Elegir mi icono** puedes elegir espada, arco, luna,
magia y los demás emblemas disponibles. Se guarda en el personaje, igual que
**Personalizar → Tu emblema**, y el grupo y el DM reciben el cambio sin retirar
ni volver a colocar la ficha. Los acompañantes usan una huella, los monstruos
una calavera y los NPC un escudo.

La lista pública del mapa se combina con la del encuentro para soportar
respuestas con participantes del mapa vacíos o parciales. Al volver a la app
o recuperar el foco se consulta de nuevo la mesa. Si no se reciben fichas
visibles, el mapa lo indica y ofrece **Actualizar fichas**; el DM debe guardar
la mesa y comprobar la niebla. El servidor conserva el filtrado de fichas
ocultas en todos los dispositivos.
