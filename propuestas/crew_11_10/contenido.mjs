// Textos de las propuestas de crew para Somos Uno × Melt · domingo 11/10.
// Cada rol tiene: lo que le pido, lo que se lleva, un recuadro destacado y su agenda de la semana.
// {nombre} y {marca} se reemplazan con los datos de amigos.json.

export const evento = {
  titulo: 'Somos Uno × Melt Underground',
  fecha: 'Domingo 11 de octubre',
  fechaCorta: 'Domingo 11·10',
  horario: '18:00 a 03:00',
  vispera: 'Víspera de feriado',
  lugar: 'Melt Underground',
  direccion: 'Laprida 1423, Recoleta',
  capacidad: '160 personas',
  generos: 'Minimal · house · techno',
  lineup: 'EVO · ODA · Sandman',
  contacto: 'evo.evomusic@gmail.com',
  instagram: '@evo.evo.evo._ · @somos.uno._',
};

// Lo que vale para toda la crew, sea cual sea el rol.
export const paraTodos = [
  ['Crédito en todo', 'Tu nombre y tu @ en el post de cierre, en el aftermovie y en las stories de Somos Uno y de EVO.'],
  ['Primera fila para lo que viene', 'Estamos proponiendo a Melt una fecha por mes. Quiero que la crew de esta noche sea la crew fija, y desde la segunda fecha tu rol entra en los números de la fiesta.'],
  ['Un favor de vuelta, a elección', 'Una clase 1 a 1 de producción en Ableton conmigo, música original para un video tuyo o un set mío para tu próximo evento.'],
];

export const roles = {
  embajador: {
    rol: 'Embajador/a',
    comoRol: 'como embajador/a',
    porque: 'Conocés a mucha gente y tu gente confía en tus planes. Una fiesta de 160 personas no se llena con publicidad: se llena con diez personas como vos que dicen “vamos”.',
    pedido: [
      ['Tu link personal', 'Te paso un link de la página de entradas a tu nombre. Todo el que compra o se anota en la lista con ese link queda registrado como tuyo.'],
      ['Moverlo esta semana', 'Compartilo en tus stories y en tus grupos. El momento clave es antes del viernes 9 a las 23:59, cuando termina la early bird a $5.000.'],
      ['Llegar con tu grupo', 'Las invitaciones y el beneficio de la lista valen hasta las 00:00. Si tu gente llega junta, la pista arranca temprano.'],
    ],
    valor: [
      ['Tu entrada', 'Entrás con invitación nominal, sin pagar.'],
      ['$1.000 por cada entrada', 'Por cada entrada paga con tu link. Te lo transfiero el martes 13 con el número del panel.'],
      ['Ves tus números en vivo', 'El sistema de entradas arma un ranking de embajadores. Te paso cómo vas cuando quieras.'],
    ],
    destacadoTitulo: 'Niveles',
    niveles: [
      ['5 personas', '+1 invitación para alguien tuyo esa noche.'],
      ['10 personas', 'Sos host de la próxima fecha: tu nombre en el flyer y 4 invitaciones.'],
      ['El que más trae', 'Elegís un tema y lo toco en mi set. Te lo dedico desde la cabina.'],
    ],
    agenda: [
      ['Lun 5', 'Me confirmás y te paso tu link y el flyer en formato story.'],
      ['Mar 6 a vie 9', 'Difusión fuerte: la early bird a $5.000 termina el viernes a las 23:59.'],
      ['Sáb 10', 'Último empujón: lista con beneficio, $7.000 en puerta hasta las 00:00.'],
      ['Dom 11', 'Llegás con tu grupo antes de las 00:00.'],
      ['Mar 13', 'Te paso tus números y te transfiero lo tuyo.'],
    ],
    invitaciones: 1,
  },

  productora: {
    rol: 'Producción audiovisual',
    comoRol: 'como productora audiovisual oficial',
    porque: 'Una fiesta dura una noche; el video es lo que queda. Quiero que lo que pase el domingo se vea con la calidad de una productora y no de un celular, y que ese material trabaje para los dos.',
    pedido: [
      ['Cobertura de la noche', 'Una o dos cámaras en los momentos fuertes (22:00 a 02:00 alcanza), con acceso libre a cabina, armado y backstage.'],
      ['Tres reels verticales', 'Para Instagram y TikTok, en las 72 horas siguientes. Son lo que más difunde la próxima fecha.'],
      ['Un aftermovie', 'De 60 a 90 segundos, antes del domingo 18. Si les da el tiempo, un fragmento del set grabado con el audio de la consola.'],
    ],
    valor: [
      ['Crédito de productora', '“Producción audiovisual: {marca}” en cada pieza, con tag, y posteo collab: el video aparece en su perfil y en el nuestro.'],
      ['Material libre para su reel', 'Pueden usar todo lo que graben en su portfolio y para mostrar a clientes, sin pedir permiso.'],
      ['Música sin problemas de derechos', 'Hago un edit original mío para el aftermovie, así Instagram no lo silencia.'],
      ['El equipo entra como crew', 'Hasta 3 personas del equipo, más {inv} invitaciones para alguien de ustedes.'],
    ],
    destacadoTitulo: 'Lo que viene',
    destacado: 'Si Melt confirma una fecha por mes, quiero que sean la productora fija de Somos Uno. Desde la segunda fecha armamos un presupuesto por fecha o un porcentaje de la puerta, lo que les sirva más.',
    agenda: [
      ['Lun 5 a mar 6', 'Llamada de 15 minutos: definimos piezas, cámaras y horarios.'],
      ['Mié 7', 'Visita técnica a Melt (la coordino yo) para ver luz y espacio.'],
      ['Jue 8 (opcional)', 'Un teaser corto para empujar la early bird antes del viernes.'],
      ['Dom 11', 'Cobertura. Puertas a las 18:00, cierre a las 03:00.'],
      ['Mié 14 / dom 18', 'Reels el miércoles 14 y aftermovie el domingo 18.'],
    ],
    invitaciones: 1,
  },

  fotografia: {
    rol: 'Fotografía',
    comoRol: 'como fotógrafo/a oficial',
    porque: 'El lunes es feriado y todo el mundo va a buscar sus fotos. Si las fotos son buenas, la gente las comparte y la próxima fecha se vende sola. Tu mirada es la que quiero para eso.',
    pedido: [
      ['Cobertura del pico', 'De 22:00 a 02:00 aproximadamente, con acceso libre a la cabina y al backstage.'],
      ['Diez fotos rápidas', 'Una selección para stories el lunes 12 al mediodía, mientras la noche está fresca.'],
      ['La galería completa', 'Entre 40 y 60 fotos editadas para el jueves 15.'],
    ],
    valor: [
      ['Crédito en cada foto', 'Tu @ en cada foto que se publique, en Somos Uno, en mis redes y en lo que comparta Melt.'],
      ['Portada del próximo flyer', 'Una de tus fotos es la portada de la siguiente fecha, con tu crédito.'],
      ['Las fotos son tuyas', 'Las usás en tu portfolio y en tus redes como quieras.'],
      ['Entrada', 'Entrás como crew, más {inv} invitaciones para alguien tuyo.'],
    ],
    destacadoTitulo: 'Los momentos que no pueden faltar',
    destacado: 'El armado con la sala vacía · la puerta a las 18:00 · la cabina desde atrás, mirando la pista · la pista llena · las manos arriba · la foto de toda la crew a las 02:30.',
    agenda: [
      ['Lun 5', 'Me confirmás y te paso la lista de momentos y el estilo de color.'],
      ['Mié 7', 'Si querés, venís a la visita técnica a Melt para ver la luz.'],
      ['Dom 11', 'Cobertura. Te espero desde las 21:30.'],
      ['Lun 12', 'Diez fotos para stories al mediodía.'],
      ['Jue 15', 'Galería completa.'],
    ],
    invitaciones: 1,
  },

  redes: {
    rol: 'Redes y contenido',
    comoRol: 'como creador/a de contenido de la fiesta',
    porque: 'Tenés una comunidad que te sigue y sabés contar una noche en stories mejor que nadie. Quiero que la fiesta se vea desde adentro, contada por alguien real.',
    pedido: [
      ['Un reel collab antes', 'Un reel en conjunto entre tu cuenta y @somos.uno._ entre el miércoles y el viernes, antes de que termine la early bird.'],
      ['Takeover de la noche', 'Manejás las stories de @somos.uno._ (o las tuyas, con tag) de 18:00 a 00:00: la llegada, el armado, la pista y la cabina.'],
      ['Un recap después', 'Un carrusel o un reel con lo mejor de la noche, el lunes 12 o el martes 13.'],
    ],
    valor: [
      ['Alcance doble', 'Los posteos collab aparecen en tu perfil y en el nuestro: te ven públicos que todavía no te siguen.'],
      ['Contenido exclusivo', 'Acceso a la cabina, al armado y a la previa del set: el contenido que nadie más tiene.'],
      ['Tu link con comisión', '$1.000 por cada entrada que se compre con tu link personal.'],
      ['Entrada', 'Entrás como crew, más {inv} invitaciones para alguien tuyo.'],
    ],
    destacadoTitulo: 'Una idea para tu canal',
    destacado: 'Un video corto conmigo antes de la fiesta: cómo preparo un set de cuatro horas, qué llevo en el pendrive o “un día con un DJ”. Es contenido para tu cuenta y difusión para la fiesta.',
    agenda: [
      ['Lun 5', 'Me confirmás y definimos el reel collab.'],
      ['Mié 7 a jue 8', 'Grabamos el reel y, si te copa, el video para tu canal.'],
      ['Vie 9', 'Se publica antes del cierre de la early bird a las 23:59.'],
      ['Dom 11', 'Takeover de 18:00 a 00:00.'],
      ['Lun 12 a mar 13', 'Recap.'],
    ],
    invitaciones: 1,
  },

  escenografia: {
    rol: 'Dirección de arte y escenografía',
    comoRol: 'como director/a de arte y escenografía',
    porque: 'Melt es un sótano con mucha identidad, y una buena intervención lo convierte en el lugar de Somos Uno. Sabés de espacio, de producción artística y de cómo armar algo que impacte con poco. Quiero que la fiesta tenga tu firma.',
    pedido: [
      ['Una intervención simple', 'Una o dos piezas que transformen el sótano y que se armen en pocas horas. Libertad creativa total sobre el concepto Somos Uno.'],
      ['Una superficie para las visuales', 'Si se puede, que la pieza sirva también como pantalla para el VJ: telas, planos o volúmenes para proyectar.'],
      ['Armado y desarme', 'El domingo desde las 14:00, con la crew de Somos Uno ayudando, y el desarme al cierre.'],
    ],
    valor: [
      ['Crédito de autor/a', '“Dirección de arte: {nombre}” en el post de cierre, en el aftermovie y en el flyer de la próxima fecha.'],
      ['Tu obra registrada', 'La productora y el fotógrafo documentan la instalación vacía y llena de gente: material de portfolio de obra construida.'],
      ['Materiales a mi cargo', 'Con un tope que definimos juntos, y pensando en piezas reutilizables para las próximas fechas.'],
      ['Entrada', 'Entrás como crew, más {inv} invitaciones para tu gente.'],
    ],
    destacadoTitulo: 'Tres ideas para arrancar (o para descartar)',
    ideas: [
      ['Un hilo que nos une', 'Cuerdas o hilos tensados que salen de la cabina y cruzan la pista. La unidad hecha objeto.'],
      ['Bajo tierra', 'Capas, raíces, luz baja y cálida: el sótano como algo que crece desde abajo.'],
      ['La cabina en el centro', 'Un marco o un arco que borre la distancia entre la cabina y la pista.'],
    ],
    agenda: [
      ['Lun 5', 'Me confirmás y te paso planos y fotos de Melt.'],
      ['Mar 6', 'Boceto rápido y tope de materiales.'],
      ['Mié 7', 'Visita técnica a Melt (la coordino yo) con el VJ y la productora.'],
      ['Jue 8 a sáb 10', 'Compra de materiales y preparación.'],
      ['Dom 11', 'Armado desde las 14:00. Puertas a las 18:00.'],
    ],
    invitaciones: 2,
  },

  vj: {
    rol: 'Visuales en vivo',
    comoRol: 'como VJ',
    porque: 'El minimal y el house son música de viaje largo, y las visuales son la mitad de ese viaje. Quiero que la pista de Melt tenga una capa visual en vivo, hecha por alguien que entiende el groove.',
    pedido: [
      ['Visuales en vivo', 'En el proyector de Melt. Si son varios VJs, un turno por set (EVO, ODA y Sandman) o un back to back visual.'],
      ['Identidad Somos Uno', 'Te paso el logo, la paleta y la huella animada de la marca para que los integres a tu manera.'],
      ['Probar el equipo antes', 'Una prueba técnica en la visita del miércoles, o el domingo antes de abrir las puertas.'],
    ],
    valor: [
      ['Estás en el line up', 'En el flyer final y en las stories del día como artista, “visuales: {nombre}”, no como staff.'],
      ['Tu set registrado', 'La productora graba tus visuales con la pista: material para tu reel de VJ.'],
      ['El mapa de cada set', 'Antes de la fiesta te paso el orden, los BPM y los picos de energía de mi set para que sincronices.'],
      ['Entrada', 'Entrás como crew, más {inv} invitaciones para alguien tuyo.'],
    ],
    destacadoTitulo: 'Una capa que nadie más tiene',
    destacado: 'El sistema de entradas de Somos Uno tiene una pantalla en vivo: muestra el contador “somos X” con la gente que va entrando y los mensajes que el público manda desde la web. Podés usarla como una capa más de tu mezcla: la pista viéndose a sí misma.',
    agenda: [
      ['Lun 5', 'Me confirmás y te paso el material de marca y el link de la pantalla en vivo.'],
      ['Mié 7', 'Visita técnica a Melt: proyector, conexiones y superficies.'],
      ['Sáb 10', 'Te paso el mapa de los sets.'],
      ['Dom 11', 'Prueba a las 17:00. Puertas a las 18:00, cierre a las 03:00.'],
    ],
    invitaciones: 1,
  },
};
