export interface BuildingRuleSection {
  title: string;
  items: string[];
}

export const BUILDING_RULES_SECTIONS: BuildingRuleSection[] = [
  {
    title: 'Reglamento interno',
    items: [
      'Artículo 1 — Convivencia: los residentes deben mantener un trato respetuoso con vecinos, personal de mantenimiento y visitantes en todo momento y espacio del edificio.',
      'Artículo 2 — Horario de silencio: de 22:00 a 07:00 horas no se permiten ruidos, música o actividades que afecten el descanso de otros residentes.',
      'Artículo 3 — Mascotas: deben transitar con correa en áreas comunes y su propietario es responsable de limpiar los desechos.',
      'Artículo 4 — Áreas comunes: su uso está sujeto a reserva previa en la aplicación, respetando horarios y aforo máximo.',
      'Artículo 5 — Visitas: toda visita debe ser registrada por el residente anfitrión y el estacionamiento tiene una permanencia máxima de 12 horas.',
      'Artículo 6 — Basura y reciclaje: los residuos deben depositarse en los contenedores designados y no se permite dejar basura en pasillos o áreas comunes.',
      'Artículo 7 — Sanciones: el incumplimiento puede derivar en amonestación, multa o restricción temporal de acceso a áreas comunes.',
      'Artículo 8 — Emergencias y daños: cualquier daño o emergencia debe reportarse de inmediato a la administración.',
      'Artículo 9 — Seguridad: el ingreso de personas ajenas debe estar autorizado y no se entregarán llaves, tarjetas o códigos a terceros sin conocimiento de la administración.',
      'Artículo 10 — Estacionamiento: cada unidad cuenta con un espacio asignado de uso exclusivo y no se permite subarrendarlo ni usarlo como bodega.',
      'Artículo 11 — Ascensores: el uso en mudanzas o transporte de materiales debe coordinarse previamente y no se debe sobrepasar la carga máxima.',
      'Artículo 12 — Remodelaciones y obras: toda obra que genere ruido o afecte áreas comunes debe contar con autorización previa y realizase en horario permitido.',
      'Artículo 13 — Mudanzas: deben coordinarse con al menos 48 horas de anticipación y realizarse en horario autorizado.',
      'Artículo 14 — Alquiler y subarriendo: el propietario es responsable de informar al inquilino y de garantizar el cumplimiento del reglamento.',
      'Artículo 15 — Juntas de propietarios: las reuniones se convocan con anticipación y se realizan con el quórum mínimo establecido.',
      'Artículo 16 — Daños a terceros: quien ocasione daños a otras unidades o áreas comunes será responsable de cubrir los costos de reparación.'
    ]
  },
  {
    title: 'Normas del foro vecinal',
    items: [
      'Las publicaciones deben mantener un trato respetuoso hacia otros residentes y la administración.',
      'No se permite contenido ofensivo, discriminatorio, difamatorio o de carácter comercial no autorizado.',
      'El foro no debe usarse para resolver disputas personales entre vecinos; para ello existen los canales de administración.',
      'La administración se reserva el derecho de eliminar publicaciones que incumplan estas normas y de restringir el acceso del foro a residentes reincidentes.'
    ]
  },
  {
    title: 'Políticas por área común',
    items: [
      'Piscina: horario de 08:00 a 20:00, aforo máximo de 15 personas, sin vidrio ni bebidas alcohólicas, y menores de 12 años deben ir acompañados.',
      'Gimnasio: horario de 06:00 a 22:00, aforo máximo de 8 personas, uso obligatorio de toalla propia y calzado deportivo, tiempo máximo de uso de 1 hora por reserva.',
      'Terraza: horario de 08:00 a 23:00, aforo máximo de 20 personas y no se permite sonido alto después de las 22:00.',
      'Parrilla / zona de asados: horario de 12:00 a 22:00, aforo máximo de 12 personas y el residente debe dejar el área limpia al finalizar.',
      'Sala de reuniones: horario de 08:00 a 21:00, aforo máximo de 10 personas y uso exclusivo para reuniones formales o actividades de la comunidad.'
    ]
  },
  {
    title: 'Políticas de pagos y morosidad',
    items: [
      'La fecha límite de pago del mantenimiento es el día 5 de cada mes.',
      'Los pagos posteriores generan un recargo del 5% sobre el monto adeudado.',
      'Una deuda se considera vencida a partir de los 30 días posteriores a la fecha límite.',
      'Los residentes con deudas vencidas no podrán realizar reservas de áreas comunes hasta regularizar su situación.'
    ]
  },
  {
    title: 'Seguridad y acceso',
    items: [
      'El ingreso de personas ajenas al edificio debe registrarse en portería o mediante la aplicación.',
      'El residente es responsable de las visitas que autoriza.',
      'Las cámaras de seguridad son de uso exclusivo de la administración y las grabaciones pueden utilizarse como respaldo ante incidentes o reclamos.'
    ]
  },
  {
    title: 'Estacionamiento, ascensores y obras',
    items: [
      'Cada plaza de estacionamiento es de uso exclusivo del propietario o residente asignado.',
      'No se permite subarrendar o ceder el uso de la plaza sin autorización de la administración.',
      'El uso de ascensores para mudanzas o transporte de materiales debe coordinarse previamente.',
      'Toda remodelación o obra que genere ruido debe contar con autorización previa y realizarse en horario permitido.'
    ]
  },
  {
    title: 'Mudanzas, alquiler y junta de propietarios',
    items: [
      'Las mudanzas deben coordinarse con anticipación y realizarse en el horario autorizado.',
      'El propietario que alquile su unidad es responsable de informar al inquilino sobre este reglamento y de garantizar su cumplimiento.',
      'Toda reunión de Junta de Propietarios debe constar en acta y quedar registrada para la comunidad.'
    ]
  },
  {
    title: 'Daños a terceros y seguros',
    items: [
      'El residente es responsable de los daños que ocasione a otras unidades o a las áreas comunes.',
      'El edificio cuenta con seguro para áreas comunes conforme a lo acordado en Junta de Propietarios, mientras que los daños a unidades privadas no están cubiertos salvo acuerdo distinto.'
    ]
  }
];
