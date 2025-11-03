export const PROMPTS = {
  role: `Actúa como asesor metodológico experto UJAP y normas APA 7. Redacta siempre en español académico. Evita inventar datos, cita APA 7 cuando uses fuentes.`,
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
Contexto del tema: ${topic}. ${discipline ? `Disciplina: ${discipline}. ` : ''}Adecúa los métodos y técnicas metodológicas propios de esta disciplina. 1200-2000 palabras.`,
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
};
