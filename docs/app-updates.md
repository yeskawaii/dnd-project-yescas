# Actualizaciones de las apps ancladas

La app anclada abre la web de la misma instalación. Cada compilación del
frontend genera `version.json` y añade ese identificador al JavaScript. La
app consulta esa versión al iniciar, al recuperar el foco, al volver del
segundo plano, al recuperar la conexión y cada 60 segundos mientras está
visible. Las consultas evitan la caché.

Si cambia la versión, la app se recarga automáticamente tras cinco segundos
sin interacción. Espera mientras se escribe, hay un editor abierto, hay
peticiones de guardado o quedan cambios pendientes en la mesa del DM o en la
ficha. En ese caso muestra **Hay una nueva versión**. El botón **Actualizar**
permite omitir la espera por inactividad, conservando las protecciones para
editores y cambios pendientes. Tras guardar/cerrar el editor, se aplica sola.

Se conserva la sesión y se vuelve a cargar desde el servidor el personaje
que estaba seleccionado. El DM regresa a la lista de contiendas. Los fallos
de red o un archivo de versión ausente no recargan la app. Una recarga ya
intentada hacia esa versión no se repite automáticamente para evitar bucles
si un proxy sigue sirviendo archivos anteriores.

## Publicar cambios

Después de subir y obtener el código nuevo en el servidor, usa los archivos
Compose de tu despliegue. Para la configuración de Cloudflare del repositorio:

```sh
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --build
```

`--build` reconstruye las imágenes que contienen el código nuevo; un simple
`restart` no hace esa compilación. La caché de Docker puede reutilizar una
compilación si el frontend no cambió: en ese caso no hace falta actualizar
los clientes. La imagen del frontend incluye su configuración Nginx y el
montaje de la configuración de Cloudflare sigue siendo compatible.

Nginx sirve `version.json` con `Cache-Control: no-store` y sin redirección al
HTML si el archivo falta. El HTML exige revalidación; los JS/CSS con nombre
que incluye su hash usan caché de larga duración. Los clientes descargan los
archivos con nombres nuevos en cada versión. Si se usan reglas personalizadas
de caché en Cloudflare, deben respetar estas cabeceras para `/`, `/index.html`
y `/version.json`.

Para comprobar una publicación:

```sh
curl -fsS -D - 'https://dnd.yeskira.com/version.json?t=verificar'
```

Debe devolver JSON con `version` y la cabecera `Cache-Control: no-store, ...`.
Un 404 o HTML indica que todavía no está sirviéndose la compilación nueva.

## Primera actualización de instalaciones anteriores

Las versiones antiguas aún no tienen el comprobador. Después de publicar este
cambio, cada jugador debe cerrar completamente su app anclada y abrirla de
nuevo una vez. Si sigue mostrando la página anterior, debe recargarla desde
el menú del navegador. No es necesario desinstalar ni borrar los datos.

Una app cerrada o sin conexión comprobará la versión cuando vuelva a abrirse
con conexión. A partir de esa primera actualización, los siguientes despliegues
se detectan sin compartir una URL distinta con cada jugador.
