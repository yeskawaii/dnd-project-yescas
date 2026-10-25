# Mesa compartida, escenas y secretos

## Uso del DM

Abre una contienda y entra en **Compartir**. **Compartir con el grupo** habilita el orden de turnos de la pestaña **Mesa** de los personajes inscritos. El mapa se activa con **Compartir el mapa táctico**. Las criaturas del encuentro empiezan ocultas: selecciónalas en **Combate** y activa **Revelar esta criatura**. Los personajes de los jugadores son visibles. La vida de criaturas reveladas permanece oculta salvo que el DM active su publicación. Los estados de texto, CA, acciones y descripciones privadas no se publican.

Mientras el combate esté compartido, la mesa se guarda tras un segundo sin cambios. Los jugadores consultan actualizaciones cada cuatro segundos mientras su pestaña del navegador está visible; al volver o recuperar la conexión se consulta inmediatamente. No usa WebSockets. Los errores de guardado detienen el guardado automático para evitar repetir conflictos; el DM conserva los cambios en pantalla y puede usar **Guardar mesa**. La revisión existente evita que una pestaña sobrescriba cambios de otra.

La niebla del mapa oculta las fichas que estén en esas casillas, incluso si la criatura ya fue revelada en el orden de turnos. Desde un solo personaje abierto, cada jugador puede seleccionar y mover las fichas visibles de todos sus personajes inscritos en esa campaña. El DM conserva el control de todas las fichas. La vida del encuentro conserva su significado anterior: es el registro del DM y no modifica la vida de la ficha del jugador.

## Escenas

En **Compartir → Nueva escena**, prepara título, descripción, ambiente y una imagen HTTPS opcional. Hay cuatro ambientes sin dependencias externas: bosque, ruinas, taberna y tormenta. Si falla una imagen, se conserva el fondo de ambiente. El enlace debe ser accesible para el navegador del jugador; no se suben ni alojan imágenes en el servidor.

**Guardar borrador** añade la escena a la biblioteca privada. **Presentar** guarda una copia separada como escena actual y publica inmediatamente. Editar o eliminar el borrador no modifica esa copia. **Retirar escena** deja de mostrarla en la siguiente actualización. Los jugadores ven la escena en **Mesa**, con una opción de ampliarla; desde **Partida** tienen un acceso que muestra el título de la escena actual.

## Secretos

Prepara un secreto, selecciona un personaje de la contienda y guarda el borrador. **Enviar al personaje** lo publica inmediatamente solo para ese personaje. El servidor vuelve a comprobar que el destinatario pertenece a la contienda. Los mensajes enviados pueden retirarse; retirar un mensaje no puede hacer que el destinatario olvide lo que ya leyó. Tras retirarlo se puede editar el borrador y enviarlo otra vez.

El jugador ve sobres en **Mesa → Tus secretos** y abre cada mensaje cuando pueda leerlo en privado. El estado leído se guarda localmente por contienda y personaje; solo se almacenan IDs, no el texto. No es un acuse de lectura para el DM ni se sincroniza entre dispositivos. Los secretos y la escena actual funcionan aunque no se comparta el mapa y combate.

## Datos y permisos

`dmWorkspace.presentation` contiene controles, biblioteca, copia de escena actual y mensajes. Las contiendas anteriores reciben valores privados por defecto al cargar el modelo, sin migración obligatoria. Se limita el tamaño de listas y textos, los IDs deben ser únicos y las imágenes solo aceptan HTTPS sin credenciales.

`GET /api/campaign/:id/table?characterId=...` exige JWT y comprueba en cada petición que el personaje pertenece al usuario y a esa contienda. Responde con `Cache-Control: private, no-store`. `server/utils/sharedTable.js` construye una respuesta mediante campos permitidos; no serializa la mesa privada. El endpoint del DM sigue exigiendo que el usuario sea dueño de la contienda. La edición de personajes no permite cambiar dueño ni contienda; esa asociación pasa por el flujo de invitación.

Los usuarios con acceso al navegador o a la cuenta del destinatario pueden leer sus secretos. La función separa destinatarios en el servidor; no es un sistema de cifrado de extremo a extremo.

## Verificación

- En `server`: `npm test`, incluyendo el flujo completo de publicación, JWT, lecturas por destinatario, retirada y pérdida de membresía con Express y persistencia simulada, sin puerto TCP ni MongoDB.
- En `client`: `npm test`, `npm run test:views`, `npm run lint`, `npm run build`. Las pruebas de vistas renderizan los componentes con React; no sustituyen una revisión visual en navegador.
