# Actualizaciones de las apps ancladas

Cada compilación del frontend genera `version.json` y añade ese identificador
al JavaScript. La app consulta esa versión al iniciar, al recuperar el foco,
al volver del segundo plano, al recuperar la conexión y cada 15 segundos
mientras está visible. Las consultas evitan la caché.

Al detectar una versión diferente, muestra un aviso y recarga después de tres
segundos. Tocar continuamente la pantalla o dejar enfocado el selector de
zoom ya no reinicia esa espera. La actualización automática espera si hay
ediciones sin guardar, un editor abierto o peticiones de guardado en curso.

El botón **Actualizar app** está siempre disponible; si hay una versión nueva
se muestra **Forzar actualización**. Esta acción inicia la reparación incluso
si la versión parece ser la actual o hay un editor abierto. Espera únicamente
si hay una petición de escritura en curso; al terminar, continúa sola. Las
ediciones que aún no se hayan guardado pueden descartarse al forzar la recarga.

## Reparar una instalación que sigue mostrando la versión anterior

Después de publicar estos cambios, abre dentro de la app o navegador afectado:

<https://dnd.yeskira.com/actualizar.html>

La página funciona sin cargar React ni el JavaScript anterior. Nginx responde
con `Clear-Site-Data: "cache"` para limpiar la caché HTTP en navegadores que
admiten esa directiva. La página además elimina las cachés de archivos del
origen y desregistra service workers anteriores, si existen. No borra cookies,
localStorage, sessionStorage, IndexedDB, personajes ni datos del servidor.

Luego consulta la versión publicada y vuelve a la aplicación con esa versión
y un parámetro único en la URL para evitar reutilizar el HTML anterior. Si
falla la conexión, muestra **Volver a intentar**. El destino de regreso siempre
es del mismo origen y no puede apuntar a la propia página de reparación.

La actualización automática usa ese mismo flujo de limpieza. Se conserva la
sesión y se vuelve a cargar desde el servidor el personaje seleccionado. El
DM vuelve a la lista de contiendas. Se limita la recarga automática a un intento
por versión para evitar bucles si un proxy sigue sirviendo archivos anteriores;
la reparación manual sigue disponible.

## Publicar cambios

Después de subir y obtener el código nuevo en el servidor, usa los archivos
Compose de tu despliegue. Para la configuración de Cloudflare del repositorio:

```sh
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --build
```

`--build` reconstruye las imágenes que contienen el código nuevo; `restart`
no compila. Si el frontend no cambió, Docker puede reutilizar su compilación:
en ese caso los clientes ya tienen la versión correspondiente. La imagen
incluye la configuración de Nginx; el montaje de Cloudflare sigue compatible.

Nginx sirve HTML, la reparación y `version.json` con `Cache-Control: no-store`.
Los JS/CSS con nombre que incluye su hash conservan la caché de larga duración.
Las rutas de reparación y versión responden 404 si faltan sus archivos, sin
servir el HTML de la app por accidente. Las reglas personalizadas de Cloudflare
deben respetar estas cabeceras para `/`, `/index.html`, `/actualizar.html` y
`/version.json`.

Comprobación tras publicar:

```sh
curl -fsS -D - 'https://dnd.yeskira.com/version.json?t=verificar'
curl -fsS -I 'https://dnd.yeskira.com/actualizar.html'
```

La primera debe devolver JSON con `version`; la segunda, HTML con las cabeceras
`Cache-Control: no-store, ...` y `Clear-Site-Data: "cache"`.

## Límite de las instalaciones anteriores

Una página antigua que ya quedó abierta no puede incorporar retroactivamente
un comprobador nuevo. Necesita abrir el enlace de reparación o recargarse una
vez. Una app cerrada o sin conexión comprobará la versión al volver a abrirse
con conexión. No hace falta desinstalar ni borrar los datos de los jugadores.
