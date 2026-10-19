import { defaultSkills } from "../models/Character.js";
import { armorClass } from "../../shared/characterRules.mjs";

// Curated level-one builds, rather than a rules engine. See character-templates.md.
const srd = "https://www.d20srd.org/srd/";
const mod = (score) => Math.floor((score - 10) / 2);
const item = (name, weight, desc, extras = {}) => ({ name, weight, desc, ...extras });
const feat = (name, desc, type = "General", modifiers = []) => ({ name, desc, type, modifiers });
const modifier = (target, value, extras = {}) => ({ target, value, ...extras });
const equipment = (equipmentSlot, defenseBonus, armorCheckPenalty, maxDex = null) => ({ equipmentSlot, defenseBonus, armorCheckPenalty, maxDex, equipped: true });
const spell = (name, level, school, desc, prepared = true) => ({ name, level, school, desc, prepared });
const weapon = (name, damageDice, damageType, extras = {}) => ({
  name, damageDice, damageType, type: "Melee", critRange: "20", critMultiplier: "x2", ...extras,
});
const kit = [
  item("Mochila", 2, "Para llevar tu equipo."),
  item("Odre lleno", 4, "Agua para el camino."),
  item("Raciones (1 día)", 1, "Provisiones de viaje."),
  item("Antorcha", 1, "Iluminación durante una hora; necesitas una mano libre."),
  item("Pedernal y acero", 0, "Para encender fuego."),
];
const initiative = feat("Iniciativa mejorada", "+4 a iniciativa mientras la dote esté activa.", "General", [modifier("initiative", 4)]);
const alertness = feat("Alerta", "+2 a Avistar y Escuchar mientras la dote esté activa.", "General", [modifier("skill", 2, { skillName: "Avistar" }), modifier("skill", 2, { skillName: "Escuchar" })]);

const templates = [
  {
    id: "fighter", name: "Guerrero", role: "Proteger y atacar", icon: "sword", difficulty: "Fácil para empezar",
    description: "Espada y escudo para estar al frente y proteger al grupo.",
    source: `${srd}classes/fighter.htm`, hitDie: 10, skillPoints: 2, armorPenalty: -4, heavyLoad: 200,
    classSkills: ["Artesanía", "Trato con Animales", "Intimidar", "Trepar", "Saltar", "Montar", "Nadar"],
    ranks: { Trepar: 4, Intimidar: 4, Montar: 4 },
    skillBonuses: { Avistar: 2, Escuchar: 2 },
    favorites: [["attacks", "Espada larga"], ["skills", "Intimidar"], ["skills", "Avistar"]],
    guide: "Acércate a los enemigos y usa Espada larga desde Partida para tirar ataque y daño. Mantén el escudo equipado. Tus tres dotes ya están aplicadas. La CA y las penalizaciones de habilidades cambian al equipar o quitar tu armadura y escudo.",
    sheet: {
      stats: { Fuerza: 15, Destreza: 13, Constitución: 14, Inteligencia: 10, Sabiduría: 12, Carisma: 8 },
      baseAttack: 1, initiativeMisc: 0, saves: { mode: "calculated", fort: 2, ref: 0, will: 0 },
      armorClass: { armor: 0, shield: 0 }, money: { gp: 23, sp: 3, cp: 9 },
      attacks: [weapon("Espada larga", "1d8", "Cortante", { critRange: "19-20" })],
      inventory: [
        item("Espada larga", 4, "Arma a una mano. Su ataque ya incluye Soltura con un arma."),
        item("Camisote de mallas", 25, "+4 CA; máximo +4 de Destreza; penalización −2.", equipment("armor", 4, -2, 4)),
        item("Escudo pesado de madera", 10, "+2 CA; penalización −2.", equipment("shield", 2, -2)),
        item("Saco de dormir", 5, "Para descansar en el camino."), ...kit,
      ],
      feats: [initiative, alertness, feat("Soltura con un arma: espada larga", "+1 a ataques con espada larga mientras la dote esté activa.", "Combate", [modifier("attack", 1, { attackName: "Espada larga" })])],
      spells: [],
    },
  },
  {
    id: "rogue", name: "Pícaro", role: "Explorar y sorprender", icon: "skill", difficulty: "Versátil",
    description: "Sigilo, cerraduras y un arco para resolver los problemas a tu manera.",
    source: `${srd}classes/rogue.htm`, hitDie: 6, skillPoints: 8, armorPenalty: 0, heavyLoad: 100,
    classSkills: defaultSkills.map(({ name }) => name).filter((name) => ![
      "Concentración", "Conocimiento de Conjuros", "Montar", "Saber (Arcano)",
      "Saber (Naturaleza)", "Saber (Religión)", "Sanar", "Supervivencia", "Trato con Animales",
    ].includes(name)),
    ranks: {
      "Abrir Cerraduras": 4, Acrobacias: 4, Avistar: 4, Buscar: 4, Engañar: 4,
      Escuchar: 4, Esconderse: 4, "Inutilizar Mecanismo": 4,
      "Moverse Sigilosamente": 4, "Juego de Manos": 4, "Usar Objeto Mágico": 4,
    },
    skillBonuses: { Avistar: 2, Escuchar: 2 },
    favorites: [["attacks", "Arco corto"], ["attacks", "Espada corta"], ["skills", "Esconderse"], ["skills", "Abrir Cerraduras"], ["skills", "Buscar"]],
    guide: "Explora con Buscar, Esconderse y Abrir Cerraduras. Tu arco usa Destreza para atacar. Tu espada corta usa Fuerza: aún no tienes Sutileza con las armas. Cuando puedas aplicar Ataque furtivo, tira 1d6 adicional con tu mesa; no está sumado al daño normal. Las herramientas de ladrón incluidas evitan la penalización por improvisar.",
    sheet: {
      stats: { Fuerza: 10, Destreza: 15, Constitución: 13, Inteligencia: 14, Sabiduría: 12, Carisma: 8 },
      baseAttack: 0, initiativeMisc: 0, saves: { mode: "calculated", fort: 0, ref: 2, will: 0 },
      armorClass: { armor: 0, shield: 0 }, money: { gp: 39, sp: 4, cp: 9 },
      attacks: [
        weapon("Espada corta", "1d6", "Perforante", { critRange: "19-20" }),
        weapon("Arco corto", "1d6", "Perforante", { type: "Ranged", rangedDamage: "bow", critMultiplier: "x3" }),
      ],
      inventory: [
        item("Espada corta", 2, "Arma cuerpo a cuerpo."), item("Arco corto", 2, "Incremento de alcance: 60 pies."),
        item("Flechas (20)", 3, "Lleva la cuenta de la munición con tu mesa."),
        item("Armadura de cuero", 15, "+2 CA; máximo +6 de Destreza; sin penalización.", equipment("armor", 2, 0, 6)),
        item("Herramientas de ladrón", 1, "Para Abrir Cerraduras e Inutilizar Mecanismo."), ...kit,
      ],
      feats: [initiative, alertness], spells: [],
      traits: [
        { name: "Ataque furtivo +1d6", description: "Daño adicional si el objetivo pierde Destreza a CA o lo flanqueas. A distancia, solo hasta 30 pies. No se multiplica con un crítico; hay criaturas inmunes. Confirma las condiciones con el DM.", source: "Pícaro 1" },
        { name: "Encontrar trampas", description: "Puedes buscar trampas con CD superior a 20 e intentar desactivar trampas mágicas.", source: "Pícaro 1" },
      ],
    },
  },
  {
    id: "wizard", name: "Mago", role: "Magia y control", icon: "magic", difficulty: "Requiere preparar conjuros",
    description: "Conjuros para atacar, protegerte y abrir nuevas posibilidades.",
    source: `${srd}classes/sorcererWizard.htm#wizard`, hitDie: 4, skillPoints: 2, armorPenalty: 0, heavyLoad: 80,
    classSkills: ["Concentración", "Artesanía", "Descifrar Escritura", "Conocimiento de Conjuros", "Saber (Arcano)", "Saber (Naturaleza)", "Saber (Religión)"],
    ranks: { Concentración: 4, "Descifrar Escritura": 4, "Conocimiento de Conjuros": 4, "Saber (Arcano)": 4, "Saber (Naturaleza)": 4 },
    favorites: [["spells", "Proyectil mágico"], ["spells", "Armadura de mago"], ["attacks", "Ballesta ligera"], ["skills", "Conocimiento de Conjuros"]],
    guide: "Permanece detrás de tus aliados. Tienes preparados 3 trucos y 2 conjuros de nivel 1 al día (incluido el extra por Inteligencia). Anota los usos en Diario: Preparado no descuenta lanzamientos. Armadura de mago te da +4 de armadura durante 1 hora; aplícalo en la ficha mientras dure. La lista muestra una selección de trucos; el libro también contiene los demás trucos del SRD. Puedes convocar un familiar más adelante (24 horas y 100 po); no está convocado de inicio.",
    sheet: {
      stats: { Fuerza: 8, Destreza: 14, Constitución: 13, Inteligencia: 15, Sabiduría: 12, Carisma: 10 },
      baseAttack: 0, initiativeMisc: 0, saves: { mode: "calculated", fort: 0, ref: 0, will: 2 },
      armorClass: { armor: 0, shield: 0 }, money: { gp: 27, sp: 4, cp: 9 },
      attacks: [
        weapon("Ballesta ligera", "1d8", "Perforante", { type: "Ranged", critRange: "19-20" }),
        weapon("Daga", "1d4", "Perforante o cortante", { critRange: "19-20" }),
      ],
      inventory: [
        item("Ballesta ligera", 4, "Incremento de alcance: 80 pies. Recargar requiere una acción de movimiento."),
        item("Virotes (10)", 1, "Munición de la ballesta."), item("Daga", 1, "Arma cuerpo a cuerpo."),
        item("Libro de conjuros", 3, "Libro inicial gratuito: trucos y cinco conjuros de nivel 1 incluidos en Hechizos."),
        item("Bolsa de componentes", 2, "Componentes sin coste específico; no sustituye los componentes costosos."), ...kit,
      ],
      feats: [initiative, feat("Gran fortaleza", "+2 a Fortaleza mientras la dote esté activa.", "General", [modifier("fort", 2)]), feat("Inscribir rollo de pergamino", "Puedes crear pergaminos cumpliendo los requisitos de tiempo, oro y experiencia. Consulta los costes con tu DM.", "Magia")],
      spells: [
        spell("Detectar magia", 0, "Adivinación", "Concentración, hasta 1 minuto/nivel. Examina auras mágicas en un cono de 60 pies; requiere varios asaltos para obtener detalles."),
        spell("Leer magia", 0, "Adivinación", "Durante 10 minutos/nivel puedes interpretar escritura mágica."),
        spell("Luz", 0, "Evocación", "Un objeto tocado ilumina como una antorcha durante 10 minutos/nivel."),
        spell("Proyectil mágico", 1, "Evocación", "A nivel 1, un proyectil de fuerza causa 1d4+1 de daño sin tirada de ataque ni salvación. Alcance: 110 pies. Se aplica resistencia a conjuros."),
        spell("Armadura de mago", 1, "Conjuración", "+4 de armadura a CA durante 1 hora/nivel sobre una criatura tocada; no se acumula con otra armadura. Aplica y retira el bono manualmente."),
        spell("Dormir", 1, "Encantamiento", "Lanzamiento: 1 asalto. Afecta hasta 4 DG en una explosión de 10 pies; Voluntad CD 13 niega. Duración: 1 minuto a nivel 1. Consulta inmunidades.", false),
        spell("Grasa", 1, "Conjuración", "Área de 10 pies de lado u objeto. A nivel 1 dura 1 asalto; Reflejos CD 13 en los supuestos del conjuro. Consulta las reglas de movimiento con el DM.", false),
        spell("Escudo", 1, "Abjuración", "+4 de escudo a CA e inmunidad a Proyectil mágico durante 1 minuto/nivel. Aplica el bono manualmente mientras dure.", false),
      ],
    },
  },
  {
    id: "cleric", name: "Clérigo", role: "Curar y apoyar", icon: "heart", difficulty: "Apoyo con conjuros",
    description: "Curación, protección y una maza cuando toca defender al grupo.",
    source: `${srd}classes/cleric.htm`, hitDie: 8, skillPoints: 2, armorPenalty: -3, heavyLoad: 150,
    classSkills: ["Concentración", "Artesanía", "Diplomacia", "Sanar", "Saber (Arcano)", "Saber (Religión)", "Conocimiento de Conjuros"],
    ranks: { Concentración: 4, Sanar: 4, "Saber (Religión)": 4 },
    favorites: [["spells", "Curar heridas leves (dominio)"], ["spells", "Bendecir"], ["attacks", "Maza ligera"], ["skills", "Sanar"]],
    guide: "Tienes 3 conjuros de nivel 0 y 3 de nivel 1 al día: uno base, uno por Sabiduría y uno reservado al dominio. Curar heridas leves ocupa el espacio de dominio. Puedes sustituir un conjuro ordinario preparado por curación espontánea. Lleva los usos en Diario. Los dominios elegidos son Bien y Curación, sin deidad concreta; puedes cambiarlos con tu DM. Los bonos temporales y la curación se aplican manualmente. La CA y las penalizaciones de habilidades dependen del equipo equipado.",
    sheet: {
      stats: { Fuerza: 13, Destreza: 8, Constitución: 14, Inteligencia: 10, Sabiduría: 15, Carisma: 12 },
      alignment: "Neutral bueno", deity: "Ideal del bien y la sanación",
      baseAttack: 0, initiativeMisc: 0, saves: { mode: "calculated", fort: 2, ref: 0, will: 2 },
      armorClass: { armor: 0, shield: 0 }, money: { gp: 11, sp: 4, cp: 9 },
      attacks: [weapon("Maza ligera", "1d6", "Contundente")],
      inventory: [
        item("Maza ligera", 4, "Arma cuerpo a cuerpo."),
        item("Camisote de mallas", 25, "+4 CA; máximo +4 de Destreza; penalización −2.", equipment("armor", 4, -2, 4)),
        item("Escudo ligero de madera", 5, "+1 CA; penalización −1. Puedes sostener un objeto con esta mano, pero no usar un arma con ella.", equipment("shield", 1, -1)),
        item("Símbolo sagrado de madera", 1, "Foco divino y símbolo de tus ideales."), ...kit,
      ],
      feats: [initiative, feat("Expulsión adicional", "+4 usos de expulsión al día, incluidos en el rasgo Expulsar muertos vivientes.")],
      traits: [
        { name: "Dominios: Bien y Curación", description: "+1 al nivel de lanzador de conjuros del bien y de curación. No aumenta los espacios diarios ni el nivel de otros conjuros.", source: "Clérigo 1" },
        { name: "Expulsar muertos vivientes", description: "8 intentos al día: 3 + 1 por Carisma + 4 de Expulsión adicional. Consulta con el DM la prueba de Carisma y el daño de expulsión.", source: "Clérigo 1" },
      ],
      spells: [
        spell("Crear agua", 0, "Conjuración", "Crea 2 galones de agua por nivel de lanzador."),
        spell("Detectar magia", 0, "Adivinación", "Concentración, hasta 1 minuto/nivel; detecta auras mágicas en un cono de 60 pies."),
        spell("Guía", 0, "Adivinación", "+1 de competencia a una prueba de ataque, salvación o habilidad. Dura 1 minuto o hasta utilizarse; aplica el bono al tirar."),
        spell("Curar heridas leves (dominio)", 1, "Conjuración", "Conjuro de dominio preparado. Por el dominio Curación, cura 1d8+2 PG al tocar a una criatura viva. Puede dañar muertos vivientes; consulta su salvación y resistencia con el DM."),
        spell("Bendecir", 1, "Encantamiento", "Durante 1 minuto a nivel 1, aliados en una explosión de 50 pies reciben +1 de moral a ataques y salvaciones contra miedo. Aplicad el bono manualmente."),
        spell("Escudo de la fe", 1, "Abjuración", "+2 de desvío a CA de una criatura tocada durante 1 minuto a nivel 1. Aplica el bono temporal manualmente."),
      ],
    },
  },
];

export function getCharacterTemplate(id) {
  const template = templates.find((entry) => entry.id === id);
  return template ? structuredClone(template) : null;
}

export function buildTemplateData(template) {
  const sheet = structuredClone(template.sheet);
  const hp = template.hitDie + mod(sheet.stats.Constitución);
  const skills = defaultSkills.map((skill) => ({
    ...skill,
    isClassSkill: template.classSkills.includes(skill.name),
    ranks: template.ranks[skill.name] || 0,
    miscModifier: 0,
  }));
  return {
    ...sheet, class: template.name, level: 1, race: "Humano", size: "Mediano", speed: "30 ft",
    hp: { current: hp, max: hp }, skills,
    traits: [{ name: "Humano", description: "La dote adicional y los 4 puntos de habilidad adicionales de nivel 1 ya están incluidos en esta plantilla.", source: "Raza" }, ...(sheet.traits || [])],
    weight: { current: sheet.inventory.reduce((total, entry) => total + entry.weight, 0), max: template.heavyLoad },
    notes: [{
      title: `Primeros pasos · ${template.name}`, color: "cyan",
      content: `${template.guide}\n\nEl equipo equipado y las dotes activas aplican sus modificadores automáticamente. Las salvaciones suman base, atributo y efectos. Los ajustes manuales son adicionales; no copies en ellos los efectos vinculados.\n\nBase: humano de nivel 1, valores 15, 14, 13, 12, 10 y 8 distribuidos por clase. Equipo inicial elegido para esta plantilla; puedes editar toda la ficha con tu DM.\n\nReferencia D&D 3.5 SRD: ${template.source}`,
    }],
  };
}

export function listCharacterTemplates() {
  return templates.map((template) => {
    const data = buildTemplateData(template);
    return {
      id: template.id, name: template.name, role: template.role, icon: template.icon,
      difficulty: template.difficulty, description: template.description, source: template.source,
      stats: data.stats, hp: data.hp.max,
      armorClass: armorClass(data),
      equipment: data.inventory.slice(0, -kit.length).map((entry) => entry.name),
      trainedSkills: Object.keys(template.ranks),
      spells: data.spells.filter((entry) => entry.prepared).map((entry) => entry.name),
      feats: data.feats.map((entry) => entry.name),
    };
  });
}

export function applyTemplateFavorites(character, template) {
  const kinds = { attacks: "attack", spells: "spell", skills: "skill" };
  character.quickActions = template.favorites.map(([collection, name]) => {
    const resource = character[collection].find((entry) => entry.name === name);
    if (!resource) throw new Error(`Recurso inicial no encontrado: ${name}`);
    return { kind: kinds[collection], itemId: String(resource._id) };
  });
}
