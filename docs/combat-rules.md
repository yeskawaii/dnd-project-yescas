# Cálculos de combate D&D 3.5

`shared/characterRules.mjs` contiene las reglas utilizadas por ficha, favoritos, panel del DM, orden público de turnos y vistas previas de plantillas. El cliente reexporta estas funciones desde `conversions.js`; ningún campo de metadatos se suma genéricamente a la CA.

## Valores y fuentes

- CA normal: 10 + armadura + escudo + Destreza limitada + tamaño + natural + desvío + esquiva + otros bonos.
- CA de toque: excluye armadura, escudo y armadura natural. CA desprevenido: retira el bono positivo de Destreza y esquiva; conserva una penalización de Destreza. Los rasgos que permiten conservar bonos se aplican con el DM.
- `armorClass.maxDex` es un límite manual opcional (`null`: sin límite). El equipo equipado añade sus propios límites; se usa el más restrictivo. No limita iniciativa, ataques a distancia ni Reflejos.
- `armorClass.checkPenalty` añade una penalización manual; armaduras y escudos equipados aportan las suyas. Solo se aplica a las habilidades indicadas por el SRD y se duplica para Nadar.
- Iniciativa = Destreza + `initiativeMisc` + efectos activos. BAB es un valor independiente y manual según clase/nivel.
- `saves.mode: calculated` interpreta Fortaleza, Reflejos y Voluntad guardadas como base y ajustes manuales, y añade Constitución, Destreza o Sabiduría y efectos. Sin ese modo, los números anteriores siguen siendo totales manuales sin efectos vinculados. Cambiar de modo convierte los números y conserva los totales actuales.
- Habilidades: atributo + rangos completos + ajustes + penalización de equipo + efectos. Los medios rangos invertidos se conservan. Las habilidades que requieren entrenamiento necesitan al menos un rango; el editor permite excepciones explícitas. Saber sin rangos solo permite conocimientos comunes de CD 10 o menor, decisión que resuelve el DM.

Inventario: `equipped`, `equipmentSlot` (`none`, `armor`, `shield`), `defenseBonus` (bono total incluida mejora mágica), `maxDex`, `armorCheckPenalty` y `modifiers`. La interfaz equipa una protección por ranura. Los bonos de armadura y escudo se comparan con las otras fuentes del mismo tipo; no se suman entre sí.

Dotes y efectos: `active` y `modifiers`. Cada modificador registra `target`, `value`, `bonusType` y, opcionalmente, `skillName` o `attackName`. El origen es el recurso y su ID. Renombrar ataques o habilidades desde sus editores actualiza las referencias. Los bonos tipados usan el mayor; los bonos sin tipo, de esquiva y de circunstancia de fuentes distintas se acumulan. Las penalizaciones de fuentes distintas se suman y una misma fuente no se aplica dos veces. Para protección se registra el bono completo de la fuente, sin añadir su mejora por segunda vez.

El texto de descripciones no se interpreta como reglas. Los efectos condicionales deben activarse únicamente cuando correspondan; la duración y los recursos diarios no se consumen automáticamente. Los ajustes manuales no se pueden atribuir a una fuente sin revisarlos.

## Armas y turnos

Los ataques añaden BAB, Fuerza o Destreza, tamaño, ajuste manual y efectos. `Thrown` usa Destreza al ataque y Fuerza al daño. Sutileza, activada explícitamente para armas y personajes que cumplen sus requisitos, usa Destreza al ataque y conserva Fuerza al daño; aplica la penalización de escudo.

`hands` admite una mano, dos manos y mano secundaria. Un bono positivo de Fuerza se multiplica por 1.5 a dos manos (excepto armas ligeras) o 0.5 en la secundaria, redondeando hacia abajo. Los penalizadores de Fuerza se mantienen completos. Los penalizadores por combatir con dos armas y por circunstancias se registran en el ajuste extra.

En ataques `Ranged`, `rangedDamage` distingue ballesta sin Fuerza (`none`), arco que solo aplica penalizadores (`bow`), arco compuesto hasta `strengthRating` (`composite`) y honda con Fuerza completa (`strength`). Un arco compuesto demasiado fuerte aplica −2 al ataque. El daño de un impacto tiene mínimo 1 antes de reducción de daño y resistencias; el lanzador genérico de dados no impone este mínimo.

La iniciativa se ordena por resultado total, luego modificador total y finalmente `tieBreaker` persistido (mayor primero). Los empates restantes aparecen en el panel del DM y pueden resolverse con un sorteo uniforme o registrando el orden acordado con la mesa. No se sortean durante renderizado ni al consultar la mesa pública; esta recibe únicamente el orden y los campos públicos habituales.

## Fichas anteriores

No se ejecuta una migración automática en la base de datos. Las fichas anteriores siguen usando sus totales y ajustes manuales. Desde Estadísticas se puede revisar una propuesta para vincular una antigua plantilla inicial compatible; el endpoint comprueba dueño y no escribe. La aplicación conserva los IDs de recursos y favoritos. La propuesta se invalida en la interfaz si la ficha cambia antes de aplicarla.

Para fichas personalizadas, configura los modificadores en los editores y retira de los ajustes manuales lo que ya esté incluido. En particular, un bono manual de armadura que se conserve seguirá aplicándose aunque se quite el objeto vinculado. La interfaz explica este comportamiento.

Los encuentros guardan instantáneas independientes de las fichas: un cambio posterior en la ficha no modifica automáticamente un combatiente ya añadido. Esta separación sigue siendo deliberada; vida, estados y ajustes del encuentro se gestionan con el DM.

## Verificación y despliegue

- Cliente: `npm test`, `npm run test:views`, `npm run lint`, `npm run build`.
- Servidor: `npm test`; las pruebas de persistencia usan el modelo real con acceso a base de datos simulado.
- Docker: ejecutar Compose desde la raíz. Ambos Dockerfiles usan la raíz como contexto para incluir `shared/`; para builds directos usar `docker build -f client/Dockerfile .` o `docker build -f server/Dockerfile .`. `.dockerignore` excluye dependencias locales, secretos y archivos de herramientas.

Referencias: [estadísticas de combate](https://www.d20srd.org/srd/combat/combatStatistics.htm), [armaduras](https://www.d20srd.org/srd/equipment/armor.htm), [armas](https://www.d20srd.org/srd/equipment/weapons.htm), [habilidades](https://www.d20srd.org/srd/skills/skillsSummary.htm), [iniciativa](https://www.d20srd.org/srd/combat/initiative.htm), [Sutileza](https://www.d20srd.org/srd/feats.htm#weaponFinesse).
