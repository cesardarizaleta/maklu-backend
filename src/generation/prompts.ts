export const PROMPTS = {
  role: `Eres un generador de texto académico en español. Produce contenido directo, neutro y formal conforme a APA 7. No uses saludos, cortesías, meta-comentarios ni segunda persona. No generes Markdown ni formato especial; solo texto plano. Redacta el contenido final directamente sin introducciones ni explicaciones. Evita inventar datos, cita APA 7 cuando uses fuentes.`,
  titleFromIdea: (idea: string, discipline?: string) =>
    `A partir de esta idea de investigación, propone un título de tesis claro, específico, extenso (mínimo 15 palabras), en estilo académico, alineado a normas UJAP y APA:\n` +
    `Idea: ${idea}\n` +
    (discipline ? `Disciplina (rama): ${discipline}\n` : '') +
    `Asegúrate de que el título pertenezca estrictamente a la disciplina indicada.\n` +
    `Devuelve solo el título de la tesis sin comillas ni comentario adicional.`,
  introduction: (topic: string, context: string, discipline?: string) =>
    `Redacta la Introducción completa (planteamiento del problema, pregunta, objetivo general y específicos, justificación, delimitaciones, alcance, limitaciones) para una tesis sobre: ${topic} en ${context}.
${discipline ? `Disciplina (rama): ${discipline}. ` : ''}Usa terminología, ejemplos y enfoques estrictamente propios de esta disciplina. Estilo académico UJAP, APA 7, 900-1500 palabras.`,
  theoretical: (topic: string, discipline?: string) =>
    `Construye el Marco Teórico y Antecedentes para la tesis sobre ${topic}.
${discipline ? `Enfócate estrictamente en el marco teórico y antecedentes de la disciplina: ${discipline}. ` : ''}Incluye antecedentes clave con síntesis crítica, bases teóricas, definiciones operacionales y relaciones entre variables. 1500-2500 palabras. Cita APA 7 en texto y agrega una lista de referencias al final.`,
  methodology: (topic: string, discipline?: string) =>
    `Desarrolla la Metodología completa: enfoque, tipo/diseño, población y muestra, muestreo, operacionalización (tabla), instrumentos, validez/confiabilidad, procedimiento, ética, plan de análisis y cronograma.
Contexto del tema: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Adecúa los métodos y técnicas metodológicas propios de esta disciplina. 1200-2000 palabras. No uses saludos, meta-comentarios ni segunda persona. Redacta directamente el contenido académico.`,
  results: (topic: string, discipline?: string) =>
    `Esboza Resultados esperados o estructura de presentación de resultados para ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Incluye ejemplos de tablas/figuras (títulos y notas) y texto interpretativo. 800-1200 palabras.`,
  discussion: (discipline?: string) =>
    `Redacta la Discusión contrastando hallazgos hipotéticos con el marco teórico, aportes teóricos/prácticos, explicaciones de resultados inesperados, limitaciones y futuras líneas. ${discipline ? `Limita el enfoque a la disciplina: ${discipline}. ` : ''}800-1200 palabras.`,
  conclusions: (goal: string, specifics: string[], discipline?: string) =>
    `Formula Conclusiones derivadas de los resultados para el objetivo general: ${goal} y objetivos específicos: ${specifics.join('; ')}. ${discipline ? `Que estén enmarcadas en la disciplina: ${discipline}. ` : ''}Evita introducir datos nuevos. Añade recomendaciones viables. 600-900 palabras.`,
  references: (discipline?: string) =>
    `Genera una lista de referencias en formato APA 7 a partir de las citas sugeridas o fuentes clave del dominio${discipline ? ` de la disciplina ${discipline}` : ''}. Si faltan datos, marca [FALTA]. Incluye al menos 10 entradas relevantes y actuales.`,
  appendices: (discipline?: string) =>
    `Prepara anexos: instrumentos (plantillas), consentimientos, tablas extendidas. ${discipline ? `Enfócalos a la disciplina ${discipline}. ` : ''}Describe qué incluiría cada anexo de forma detallada y ordenada.`,
  // Granulares de Introducción
  problemStatement: (topic: string, discipline?: string) =>
    `Redacta el Planteamiento del problema para la tesis sobre: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Incluye contexto, evidencia del problema, brecha de conocimiento o necesidad práctica, consecuencias de no abordarlo, y cierre que conduzca a la pregunta de investigación. 600-900 palabras.`,
  researchQuestions: (topic: string, discipline?: string) =>
    `Formula la(s) Pregunta(s) de investigación claras y delimitadas para: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Devuelve una lista con 1 principal y 2-4 derivadas. No incluyas texto adicional.`,
  generalObjective: (topic: string, discipline?: string) =>
    `Propón un Objetivo General, único y medible, coherente con: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Devuelve solo una oración iniciada en verbo en infinitivo.`,
  specificObjectives: (topic: string, discipline?: string) =>
    `Genera de 3 a 5 Objetivos Específicos para: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Devuelve una lista numerada; cada objetivo en infinitivo, medible y alcanzable. No agregues explicaciones.`,
  justification: (topic: string, discipline?: string) =>
    `Escribe la Justificación explicando relevancia teórica, práctica y social del estudio sobre: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}400-700 palabras.`,
  scope: (topic: string, discipline?: string) =>
    `Redacta el Alcance del estudio para: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Define alcance conceptual, temporal, geográfico y poblacional. 250-400 palabras.`,
  delimitations: (topic: string, discipline?: string) =>
    `Indica las Delimitaciones (qué está dentro/fuera) para: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Lista con viñetas, 6-10 ítems.`,
  limitations: (topic: string, discipline?: string) =>
    `Enumera posibles Limitaciones reales (acceso a datos, tiempo, sesgos, etc.) para: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Lista con viñetas, 5-8 ítems.`,
  // Granulares de Marco Teórico
  antecedentes: (topic: string, discipline?: string) =>
    `Redacta 'Antecedentes' con 8-12 estudios relevantes sobre ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Para cada estudio: breve síntesis crítica y hallazgos clave. Cita APA 7 en texto y al final lista referencias correspondientes. 800-1200 palabras.`,
  basesTeoricas: (topic: string, discipline?: string) =>
    `Desarrolla 'Bases Teóricas' identificando teorías/modelos fundamentales aplicables a ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Expón conceptos, relaciones y supuestos. 800-1200 palabras. Cita APA 7.`,
  definiciones: (topic: string, discipline?: string) =>
    `Construye 'Definiciones Operacionales' de los conceptos clave del estudio sobre ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Devuelve tabla o lista estructurada: término, definición, fuente APA 7.`,
  // Granulares de Metodología
  metodoDiseno: (topic: string, discipline?: string) =>
    `Define Enfoque, Tipo y Diseño metodológico adecuados a ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Justifica cada elección con fuentes si aplica (APA 7). 400-700 palabras.`,
  poblacionMuestra: (topic: string, discipline?: string) =>
    `Describe Población y Muestra para ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Incluye marco poblacional, criterios de inclusión/exclusión, tamaño muestral tentativo y sustento. 300-500 palabras.`,
  muestreo: (topic: string, discipline?: string) =>
    `Especifica el tipo de Muestreo para ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Explica el procedimiento paso a paso. 250-400 palabras.`,
  operacionalizacion: (topic: string, discipline?: string) =>
    `Elabora la Operacionalización de variables en formato de tabla: variable, dimensión, indicador, ítem/medición y escala. Tema: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}`,
  instrumentos: (topic: string, discipline?: string) =>
    `Describe los Instrumentos de recolección de datos (cuestionarios, guías, sensores, etc.) para ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Incluye estructura, constructos y ejemplos de ítems. 400-700 palabras. No uses saludos, meta-comentarios ni segunda persona. Redacta directamente el contenido académico.`,
  validezConfiabilidad: (topic: string, discipline?: string) =>
    `Propón estrategias de Validez y Confiabilidad/Homogeneidad para los instrumentos en ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Incluye validación de contenido y métricas (alfa de Cronbach o equivalentes). 300-600 palabras.`,
  procedimiento: (topic: string, discipline?: string) =>
    `Detalla el Procedimiento de la investigación para ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Pasos cronológicos desde permisos hasta análisis. 400-700 palabras.`,
  etica: (topic: string, discipline?: string) =>
    `Incluye Consideraciones Éticas aplicables a ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Consentimiento informado, confidencialidad, riesgos y mitigación. 250-400 palabras.`,
  planAnalisis: (topic: string, discipline?: string) =>
    `Describe el Plan de Análisis: técnicas estadísticas/analíticas o de modelado apropiadas para ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Indica software/herramientas a usar. 300-600 palabras.`,
  cronograma: (topic: string, discipline?: string) =>
    `Presenta un Cronograma tentativo por fases/meses para ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Devuelve tabla o lista por etapas.`,
  // Preliminares
  preliminariesCover: (topic: string, discipline?: string) =>
    `Genera el contenido de una Portada (solo texto, sin formato) para una tesis sobre ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Incluye: institución, facultad/escuela, título completo, autor, tutor(es), ciudad/país, fecha. No inventes datos personales; usa campos marcadores [NOMBRE], [FECHA], etc.`,
  preliminariesSignatures: () =>
    `Crea una página de Firmas con líneas y roles (Autor, Tutor, Jurados, Coordinador). Usa marcadores [NOMBRE], [CARGO]. Devuelve solo el bloque de texto con la estructura.`,
  preliminariesDedication: () =>
    `Redacta una Dedicatoria breve (130-220 palabras) en tono formal y respetuoso.`,
  preliminariesAcknowledgments: () =>
    `Redacta Agradecimientos (200-350 palabras) a personas e instituciones, en tono académico.`,
  preliminariesTOC: (topic: string) =>
    `Genera una Tabla de Contenidos tentativa para una tesis sobre ${topic}. Muestra capítulos y subapartados con sangría y numeración (1., 1.1., 1.2., etc.). No generes números de página reales.`,
  preliminariesListFigures: () =>
    `Genera una Lista de Figuras con títulos tentativos (al menos 8-12). Formato: "Figura X. Título".`,
  preliminariesListTables: () =>
    `Genera una Lista de Tablas con títulos tentativos (al menos 8-12). Formato: "Tabla X. Título".`,
  preliminariesListGraphs: () =>
    `Genera una Lista de Gráficos con títulos tentativos (al menos 6-10). Formato: "Gráfico X. Título".`,
  preliminariesAbstract: (topic: string, discipline?: string) =>
    `Redacta un Resumen/Abstract estructurado (250-350 palabras) para la tesis sobre ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Incluye propósito, método, resultados esperados y conclusiones, más 5-7 palabras clave.`,
  // Expansión de secciones
  expandSection: (
    key: string,
    topic: string,
    currentExcerpt: string,
    targetWords: number,
    discipline?: string,
  ) =>
    `Amplía la sección "${key}" de la tesis sobre ${topic} con aproximadamente ${targetWords} palabras adicionales.
No repitas el texto existente. Profundiza, agrega ejemplos, matices teóricos/metodológicos y contraargumentos.
${discipline ? `Enfoca el desarrollo estrictamente en la disciplina: ${discipline}. ` : ''}Devuelve solo el texto nuevo que debe añadirse al final.`,
};
