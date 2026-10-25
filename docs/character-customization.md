# Tu personaje, tu estilo

En **Partida → Mi estilo y mi partida**, o tocando el retrato de la cabecera, puedes personalizar cada personaje. Los cambios se guardan al pulsar **Guardar mi estilo** y se conservan en otros dispositivos.

- **Mi personaje:** once paletas (Bosque, Arcano, Ascua, Marea, Luna, Rosa, Gris claro, Gris medio, Gris oscuro, Blanco y Negro), cuatro ambientes, tres marcos y 26 emblemas. Las paletas mantienen fondos oscuros y acentos legibles: Blanco usa acentos blancos y Negro un fondo negro con acentos claros. Puedes elegir una imagen JPG, PNG o WebP de tu galería, ajustar el acercamiento y el encuadre, y confirmar con **Usar recorte**. Quitar la foto recupera el emblema.
- **Mi partida:** ordena cuatro tarjetas con las flechas, oculta defensa o accesos y elige tamaño cómodo o compacto. Puntos de vida y acciones rápidas siempre permanecen disponibles.
- **Ficha en el mapa:** elige **Icono** o **Retrato** debajo de la carga del retrato. Usa la misma imagen y encuadre del personaje; cambiar a icono conserva la foto. La elección se guarda con **Guardar mi estilo** y también puede cambiarse al momento desde la mesa compartida. El DM y los jugadores ven la misma ficha, tanto en el mapa como en la leyenda. Si no hay imagen o falla al cargar, se usa el emblema. Los personajes anteriores siguen usando iconos hasta que su dueño elija el retrato.
- **Iconos de recursos:** abre un favorito en Partida y despliega **Icono de este recurso**; el símbolo elegido se guarda inmediatamente. También puedes elegirlo al crear o editar un recurso. La opción **Auto** recupera su símbolo por defecto. Para editar una habilidad existente, toca su bono en la tabla de habilidades. Los iconos personalizados aparecen también en los favoritos.

La vista previa no guarda cambios. Cerrar el panel los descarta. **Restablecer estilo y tarjetas** prepara los valores originales; todavía debes guardar para aplicarlos. Si falla el guardado, el panel mantiene los cambios para volver a intentarlo.

El **Dungeon Master** dispone de las mismas once paletas desde **Mi estilo**, tanto en Mis contiendas como dentro de una mesa. La selección se aplica también a sus paneles y se guarda por cuenta en este navegador, de forma independiente de los personajes y de los datos compartidos de la campaña. Cerrar sin guardar descarta la vista previa.

## Datos

`Character.appearance` guarda tema, ambiente, marco, emblema, retrato y `mapTokenStyle` (`icon` o `portrait`). `Character.playLayout` guarda orden, tarjetas ocultas y densidad. Los recursos guardan `visualIcon` por separado de la categoría de inventario `icon`; cambiar un símbolo no cambia su categoría ni sus favoritos.

Los personajes anteriores reciben valores por defecto sin migración. El endpoint de actualización conserva el filtro de propietario y valida los nuevos campos. El retrato se recorta a 384 × 384 píxeles y se convierte a JPEG antes de enviarse. El servidor admite únicamente datos de imágenes JPEG, PNG o WebP, con un máximo de 240.000 caracteres; no admite SVG ni URLs externas para retratos. No se añade ningún servicio de almacenamiento externo.

## Verificación

En `server`, ejecuta `npm test`. En `client`, ejecuta `npm test`, `npm run test:views`, `npm run lint` y `npm run build`. Las pruebas cubren compatibilidad con fichas anteriores, validación, persistencia simulada, identidad de recursos, recortes y renderizado de tarjetas. La revisión interactiva se realiza con personajes ficticios en memoria, sin conectar MongoDB.
