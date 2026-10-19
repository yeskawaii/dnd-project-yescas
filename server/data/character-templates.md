# Plantillas de creación rápida

El catálogo vive en `characterTemplates.js`. El servidor publica una vista previa autenticada en `GET /api/character/templates`; `POST /api/character` recibe `templateId` y un nombre opcional. Sin `templateId` conserva la creación en blanco anterior. Una plantilla desconocida devuelve 400. Las plantillas se aplican exclusivamente al crear personajes nuevos.

Son cuatro propuestas editables de humano de nivel 1 para D&D 3.5, no paquetes oficiales ni un generador para cualquier nivel. Distribuyen la serie de élite (15, 14, 13, 12, 10, 8). Vida: dado máximo inicial más Constitución. Rangos: `(puntos de clase + modificador de Inteligencia + 1 por humano) × 4`, con un máximo de 4 en habilidades de clase. Las dotes incluyen la inicial, la humana y las adicionales de clase cuando corresponda. Las salvaciones guardadas son totales, incluidos atributos y dotes, según la interfaz existente.

El equipo se elige para cada propuesta, con fondos iniciales de 150 po para guerrero, 125 para pícaro y clérigo, y 75 para mago. Son presupuestos de estas plantillas, ajustables por el DM. El libro inicial del mago es gratuito. Se resta el coste del equipo y se registra el resto en monedas; el peso registrado suma el inventario. La carga inicial de equipo queda en el tramo ligero. La ficha actual no calcula peso de monedas, sinergias situacionales, competencias, componentes costosos, inmunidades, efectos temporales ni consumo de conjuros automáticamente. Las descripciones de conjuros son ayudas breves para nivel 1, no sustituyen sus reglas completas.

Los penalizadores iniciales de armadura y escudo se incorporan a `skills.miscModifier`, duplicados en Nadar. Alerta suma +2 a Avistar y Escuchar; Soltura con espada larga añade +1 a `attackBonus`. Iniciativa mejorada usa `initiativeMisc`. Si el jugador cambia equipo o dotes, debe ajustar esos campos: la guía guardada en Diario lo explica. En D&D 3.5 las habilidades de clase no reciben el +3 de Pathfinder; `calculateSkillTotal` usa atributo + rangos + otros bonos.

El mago generalista conoce cinco conjuros de nivel 1 y todos los trucos del SRD; la interfaz precarga tres de estos últimos y prepara tres trucos y dos conjuros de nivel 1. El familiar aún no está convocado. El clérigo neutral bueno sigue un ideal, con dominios Bien y Curación; prepara tres conjuros de nivel 0 y tres de nivel 1 contando Sabiduría y el espacio de dominio. Curar heridas leves usa nivel de lanzador 2 por Curación. Los usos diarios y efectos se gestionan con la mesa y Diario.

Los favoritos se enlazan a los IDs reales de subdocumentos antes del único guardado del personaje. Cada creación obtiene objetos e IDs independientes. Los atributos, equipo, nivel y dueño enviados por el cliente no sustituyen los datos del catálogo.

## Referencias consultadas

- [Clases del SRD 3.5](https://www.d20srd.org/indexes/classes.htm): [guerrero](https://www.d20srd.org/srd/classes/fighter.htm), [pícaro](https://www.d20srd.org/srd/classes/rogue.htm), [mago](https://www.d20srd.org/srd/classes/sorcererWizard.htm#wizard), [clérigo](https://www.d20srd.org/srd/classes/cleric.htm).
- [Serie de élite](https://www.d20srd.org/srd/improvingMonsters.htm#eliteArray), [habilidades](https://www.d20srd.org/srd/skills/skillsSummary.htm), [dotes](https://www.d20srd.org/srd/feats.htm).
- [Armas](https://www.d20srd.org/srd/equipment/weapons.htm), [armaduras](https://www.d20srd.org/srd/equipment/armor.htm), [carga](https://www.d20srd.org/srd/carryingCapacity.htm), [equipo de aventura](https://www.d20srd.org/srd/equipment/goodsAndServices.htm).
- [Dominios](https://www.d20srd.org/srd/spellLists/clericDomains.htm) y [conjuros](https://www.d20srd.org/indexes/spells.htm); especialmente [Curar heridas leves](https://www.d20srd.org/srd/spells/cureLightWounds.htm), [Armadura de mago](https://www.d20srd.org/srd/spells/mageArmor.htm) y [Proyectil mágico](https://www.d20srd.org/srd/spells/magicMissile.htm).

Verificación: `npm test` en `server`; `npm test`, `npm run lint` y `npm run build` en `client`. Las pruebas de creación usan el modelo real con persistencia simulada, sin conectar a MongoDB.
