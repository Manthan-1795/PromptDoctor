/**
 * Prompt Doctor Diagnostic Engine
 * Analyzes raw prompts for structural integrity, clinical clarity, and hallucinations risks.
 */
export const diagnosePrompt = (promptText, modelTarget = 'General LLM') => {
  const text = (promptText || '').trim();
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  // 1. Role & Persona detection
  const hasRole = /(you are|act as|assume the role|as an expert|role:|persona:)/i.test(lower);
  const roleStrength = hasRole ? 85 : Math.max(10, Math.min(45, Math.floor(wordCount * 1.5)));

  // 2. Context & Background detection
  const hasContext = /(context|background|target audience|situation|for example|scenario|given that)/i.test(lower);
  const contextStrength = hasContext ? 90 : Math.max(15, Math.min(50, Math.floor(charCount / 8)));

  // 3. Instruction Precision
  const hasActionVerbs = /(create|analyze|generate|evaluate|summarize|rewrite|critique|extract|synthesize)/i.test(lower);
  const instructionStrength = hasActionVerbs ? Math.min(95, 50 + (wordCount > 15 ? 35 : 15)) : 30;

  // 4. Constraint Strength
  const hasConstraints = /(do not|avoid|never|must not|limit to|maximum|without|strictly|prohibited)/i.test(lower);
  const constraintStrength = hasConstraints ? 88 : 22;

  // 5. Output Structure Strength
  const hasFormat = /(json|markdown|table|bullet points|numbered list|xml|csv|format:|output:|template:)/i.test(lower);
  const outputStructureStrength = hasFormat ? 92 : 25;

  // 6. Specificity & Detail
  let specificityStrength = 20;
  if (wordCount > 80) specificityStrength = 90;
  else if (wordCount > 40) specificityStrength = 75;
  else if (wordCount > 15) specificityStrength = 55;
  else specificityStrength = 25;

  // Calculate Overall Weighted Health Score
  const rawScore = Math.round(
    roleStrength * 0.15 +
    contextStrength * 0.18 +
    instructionStrength * 0.22 +
    constraintStrength * 0.15 +
    outputStructureStrength * 0.18 +
    specificityStrength * 0.12
  );

  const overallScore = Math.min(98, Math.max(12, rawScore));

  let status = 'critical';
  if (overallScore >= 85) status = 'optimal';
  else if (overallScore >= 70) status = 'healthy';
  else if (overallScore >= 50) status = 'fair';
  else if (overallScore >= 30) status = 'sick';
  else status = 'critical';

  // Generate Symptoms
  const symptoms = [];
  if (!hasRole) {
    symptoms.push({
      title: 'Acute Role Anemia',
      severity: 'high',
      description: 'The prompt lacks a persona, authority frame, or domain specialization. The LLM will default to bland generic answers.',
      recommendation: 'Inject an authoritative persona with explicit domain credentials (e.g. "You are a Senior Systems Architect...").',
    });
  }

  if (!hasConstraints) {
    symptoms.push({
      title: 'Guardrail Deficiency Syndrome',
      severity: 'medium',
      description: 'No negative constraints or boundary limiters detected. The model is susceptible to rambling or unconstrained hallucinations.',
      recommendation: 'Add negative guardrails detailing what NOT to include (e.g. "Do not use conversational filler, avoid passive voice").',
    });
  }

  if (!hasFormat) {
    symptoms.push({
      title: 'Structural Ambiguity Disorder',
      severity: 'high',
      description: 'Expected output format (JSON, Markdown, Markdown Tables, or Bullet Points) is unspecified.',
      recommendation: 'Mandate exact output schema or hierarchical structure.',
    });
  }

  if (wordCount < 15) {
    symptoms.push({
      title: 'Severe Prompt Malnutrition',
      severity: 'critical',
      description: `Prompt is dangerously terse (${wordCount} words). High probability of vague, underspecified responses.`,
      recommendation: 'Expand contextual parameters, clarify intent, and define criteria for success.',
    });
  }

  if (!hasContext && wordCount >= 15) {
    symptoms.push({
      title: 'Contextual Hypoxia',
      severity: 'medium',
      description: 'The task is declared but the target audience, baseline knowledge, or business context is missing.',
      recommendation: 'Provide situational telemetry and clarify who the output is destined for.',
    });
  }

  // If prompt is already relatively good, add low severity optimization symptom
  if (symptoms.length === 0) {
    symptoms.push({
      title: 'Latent Chain-of-Thought Potential',
      severity: 'low',
      description: 'Prompt is sound, but step-by-step reasoning scaffolds could further enhance precision.',
      recommendation: 'Encourage deliberate multi-stage reasoning before concluding.',
    });
  }

  // Generate Dimensions
  const dimensions = [
    {
      dimensionName: 'Role Specification',
      score: roleStrength,
      status: roleStrength >= 70 ? 'healthy' : roleStrength >= 40 ? 'moderate' : 'critical',
      explanation: hasRole
        ? 'Well-defined role persona anchors domain tone and behavior.'
        : 'Missing expert persona assignment; LLM outputs will lack specialized rigor.',
      recommendation: 'Explicitly anchor the LLM as a domain authority.',
    },
    {
      dimensionName: 'Context & Intent',
      score: contextStrength,
      status: contextStrength >= 70 ? 'healthy' : contextStrength >= 40 ? 'moderate' : 'critical',
      explanation: hasContext
        ? 'Adequate background framing provided for contextual grounding.'
        : 'Target scenario or background information is absent.',
      recommendation: 'Detail the underlying use case, audience, and constraints.',
    },
    {
      dimensionName: 'Instruction Precision',
      score: instructionStrength,
      status: instructionStrength >= 70 ? 'healthy' : instructionStrength >= 40 ? 'moderate' : 'critical',
      explanation: hasActionVerbs
        ? 'Direct imperatives and active objectives detected.'
        : 'Action verbs are loose, open to wide model interpretation.',
      recommendation: 'Use precise operational verbs (extract, synthesize, compare).',
    },
    {
      dimensionName: 'Constraint Strength',
      score: constraintStrength,
      status: constraintStrength >= 70 ? 'healthy' : constraintStrength >= 40 ? 'moderate' : 'critical',
      explanation: hasConstraints
        ? 'Negative guardrails constrain model drift effectively.'
        : 'No negative constraints present to prevent common failure modes.',
      recommendation: 'State explicit boundaries and excluded elements.',
    },
    {
      dimensionName: 'Output Structure',
      score: outputStructureStrength,
      status: outputStructureStrength >= 70 ? 'healthy' : outputStructureStrength >= 40 ? 'moderate' : 'critical',
      explanation: hasFormat
        ? 'Clear output format specifications designated.'
        : 'Output format is unconstrained, risking unstructured prose.',
      recommendation: 'Specify exact schema, markdown tags, or table formats.',
    },
    {
      dimensionName: 'Specificity & Tone',
      score: specificityStrength,
      status: specificityStrength >= 70 ? 'healthy' : specificityStrength >= 40 ? 'moderate' : 'critical',
      explanation: `Length (${wordCount} words) reflects ${specificityStrength > 60 ? 'solid' : 'insufficient'} granularity.`,
      recommendation: 'Inject explicit criteria, length parameters, and tone directives.',
    },
  ];

  // Prescriptions
  const prescriptions = [
    {
      recommendation: 'Assign a definitive Persona with domain expertise and tone guidelines.',
      actionCategory: 'Persona Framing',
      priority: 'High',
    },
    {
      recommendation: 'Delineate input data from instructions using triple delimiters (e.g. ### or XML tags).',
      actionCategory: 'Delimiter Scaffolding',
      priority: 'High',
    },
    {
      recommendation: 'Impose negative constraints to suppress conversational fluff and boilerplate caveats.',
      actionCategory: 'Guardrail Enforcement',
      priority: 'Medium',
    },
    {
      recommendation: 'Mandate structured sections with Markdown headings or valid JSON format.',
      actionCategory: 'Output Specification',
      priority: 'Medium',
    },
  ];

  // Diagnosis Changes
  const changes = [
    {
      type: 'added',
      description: 'Injected specialized Role Persona block to establish domain authority and tone.',
    },
    {
      type: 'structural',
      description: 'Restructured prompt into standard modular clinical sections: [Role], [Context], [Task], [Constraints], [Output Format].',
    },
    {
      type: 'added',
      description: 'Appended strict negative constraints to prevent hallucinations and unhelpful model disclaimers.',
    },
    {
      type: 'modified',
      description: 'Replaced vague verbs with high-fidelity operational instructions and milestone checks.',
    },
  ];

  // Generate Improved Prompt
  const cleanSubject = text.replace(/^(please|can you|i want you to|write me|tell me about|make a)/i, '').trim();
  const title = `Prompt Rx #${Math.floor(1000 + Math.random() * 9000)}: ${cleanSubject.slice(0, 32) || 'Target Prompt'}`;

  const improvedPrompt = `### [ROLE & PERSONA]
You are a Principal AI Strategist and Elite Domain Specialist with decades of production experience. Your objective is to deliver authoritative, precise, and actionable solutions.

### [CONTEXT & OBJECTIVE]
The user requires high-fidelity execution regarding:
"${cleanSubject || text}"

### [TASK DIRECTIVES]
1. Thoroughly deconstruct the subject and identify high-impact leverage points.
2. Provide a structured, in-depth breakdown covering strategic implementation and key considerations.
3. Validate all arguments with concrete reasoning and industry-standard practices.

### [CONSTRAINTS & GUARDRAILS]
- Strictly avoid generic conversational boilerplate (e.g., "Certainly!", "Here is a...", "As an AI...").
- Do not make vague generalizations; ground statements in tangible examples.
- If assumptions must be made, state them explicitly in a dedicated "Assumptions" callout.

### [OUTPUT FORMAT]
Present your response in clean Markdown with the following hierarchical structure:
1. **Executive Summary** (2-3 sentences)
2. **Core Analysis & Strategy** (Categorized bullet points)
3. **Actionable Implementation Steps** (Numbered phase-by-phase breakdown)
4. **Pitfalls & Prevention Measures** (Table or concise checklist)`;

  return {
    title,
    overallScore,
    status,
    modelTarget,
    originalPrompt: text,
    improvedPrompt,
    dna: {
      roleStrength,
      contextStrength,
      instructionStrength,
      constraintStrength,
      outputStructureStrength,
      specificityStrength,
    },
    dimensions,
    symptoms,
    prescriptions,
    changes,
  };
};

export default {
  diagnosePrompt,
};
