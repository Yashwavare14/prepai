/**
 * Flattens array of rich blocks (text, latex, etc.) into a plain text string.
 * @param {Array|Object|string} blocks
 * @returns {string}
 */
export function flattenBlocks(blocks) {
  if (!blocks) return "";
  if (typeof blocks === "string") return blocks.trim();
  if (!Array.isArray(blocks)) {
    if (typeof blocks === "object") {
      return (blocks.text_content || blocks.latex || blocks.text || "").trim();
    }
    return String(blocks).trim();
  }

  return blocks
    .map((b) => {
      if (!b) return "";
      if (typeof b === "string") return b.trim();
      if (typeof b === "object") {
        return (b.text_content || b.latex || b.text || "").trim();
      }
      return String(b).trim();
    })
    .filter((text) => text.length > 0)
    .join("\n")
    .trim();
}

/**
 * Normalizes option or answer key ('a'/'1' -> 'A', 'b'/'2' -> 'B', etc.)
 * @param {string|number} key
 * @returns {string}
 */
function normalizeKey(key) {
  if (key === null || key === undefined) return "";
  const cleaned = String(key).trim().toUpperCase();
  if (cleaned === "1" || cleaned === "A") return "A";
  if (cleaned === "2" || cleaned === "B") return "B";
  if (cleaned === "3" || cleaned === "C") return "C";
  if (cleaned === "4" || cleaned === "D") return "D";
  return cleaned;
}

/**
 * Extracts 4-digit year from text string.
 * @param {string} text
 * @returns {number|null}
 */
function extractYear(text) {
  if (!text) return null;
  const match = String(text).match(/\b(19\d\d|20\d\d)\b/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extracts exam shift, tier/stage, and held-on date from paper title.
 * @param {string} text
 * @returns {Object}
 */
function parseExamMetadata(text) {
  if (!text) return {};
  const str = String(text);

  const shiftMatch = str.match(/(?:Shift[-\s]?\d+)|(?:Morning|Afternoon|Evening)\s*Shift/i);
  const tierMatch = str.match(/(?:Tier[-\s]?(?:I{1,3}|IV|[1-4]))|(?:Prelims|Mains)/i);
  const dateMatch = str.match(/(?:Held\s*On:?\s*)([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i);

  return {
    shift: shiftMatch ? shiftMatch[0].trim() : null,
    tier: tierMatch ? tierMatch[0].trim().toUpperCase() : null,
    exam_date: dateMatch ? dateMatch[1].trim() : null,
  };
}

/**
 * Transforms external PDF parser response / question clusters into PrepAI DB format.
 *
 * @param {Object|Array} input - The external parser response or question_clusters array
 * @returns {Array<{ question: string, options: { A: string, B: string, C: string, D: string }, correct_answer: string, explanation: string|null, year: number|null, metadata: Object|null }>}
 */
export function transformQuestions(input) {
  let clusters = [];
  const paperTitle =
    input?.data?.paper_title ||
    input?.paper_title ||
    input?.title ||
    input?.metadata?.paper_title ||
    "";

  const extractedYear = extractYear(paperTitle);
  const paperMeta = parseExamMetadata(paperTitle);

  if (Array.isArray(input)) {
    clusters = input;
  } else if (Array.isArray(input?.data?.question_clusters)) {
    clusters = input.data.question_clusters;
  } else if (Array.isArray(input?.question_clusters)) {
    clusters = input.question_clusters;
  } else if (Array.isArray(input?.data)) {
    clusters = input.data;
  } else if (input?.data && typeof input.data === "object") {
    clusters = input.data.question_clusters || input.data.clusters || [];
  }

  const results = [];

  for (const cluster of clusters) {
    if (!cluster) continue;

    // Determine sub-questions
    let subQuestions = [];
    if (Array.isArray(cluster.sub_questions) && cluster.sub_questions.length > 0) {
      subQuestions = cluster.sub_questions;
    } else {
      subQuestions = [cluster];
    }

    // Shared context
    const hasSharedContext = Boolean(cluster.has_shared_context);
    const sharedContext = hasSharedContext && cluster.shared_context_blocks
      ? flattenBlocks(cluster.shared_context_blocks)
      : "";

    for (const subQ of subQuestions) {
      if (!subQ) continue;

      const qBodyText = flattenBlocks(subQ.question_body || subQ.question || subQ.body || subQ.text);
      if (!qBodyText) continue;

      const fullQuestion = sharedContext
        ? `[Context]\n${sharedContext}\n\n${qBodyText}`
        : qBodyText;

      // Extract options
      const optionsMap = { A: "", B: "", C: "", D: "" };

      if (Array.isArray(subQ.options)) {
        subQ.options.forEach((opt, index) => {
          if (!opt) return;
          let key = normalizeKey(opt.key || opt.label || opt.id);
          if (!key) {
            const fallbackKeys = ["A", "B", "C", "D"];
            key = fallbackKeys[index] || "";
          }
          const content = flattenBlocks(opt.content || opt.text || opt.value);
          if (key && content) {
            optionsMap[key] = content;
          }
        });
      } else if (subQ.options && typeof subQ.options === "object") {
        for (const [rawKey, rawVal] of Object.entries(subQ.options)) {
          const key = normalizeKey(rawKey);
          const content = typeof rawVal === "string" ? rawVal.trim() : flattenBlocks(rawVal);
          if (key && content) {
            optionsMap[key] = content;
          }
        }
      }

      // Ensure valid A, B, C, D options
      const validKeys = ["A", "B", "C", "D"];
      let hasMissing = validKeys.some((k) => !optionsMap[k] || optionsMap[k].trim() === "");

      if (hasMissing) {
        const nonEmpties = Object.values(optionsMap).filter((v) => v && v.trim());
        if (nonEmpties.length >= 4) {
          optionsMap.A = nonEmpties[0];
          optionsMap.B = nonEmpties[1];
          optionsMap.C = nonEmpties[2];
          optionsMap.D = nonEmpties[3];
          hasMissing = false;
        } else if (nonEmpties.length >= 2) {
          for (const k of validKeys) {
            if (!optionsMap[k]) {
              optionsMap[k] = "N/A";
            }
          }
          hasMissing = false;
        } else {
          continue; // Malformed question
        }
      }

      // Determine correct answer
      let rawAns = normalizeKey(subQ.answer_key || subQ.correct_answer || subQ.correctAnswer || subQ.answer);
      if (!validKeys.includes(rawAns)) {
        rawAns = "A";
      }

      // Explanation
      const explanation = flattenBlocks(subQ.explanation) || null;

      // Question-specific year fallback
      const qYear = extractedYear || extractYear(fullQuestion) || null;

      // Construct comprehensive metadata
      const questionMeta = {
        paper_title: paperTitle || null,
        year: qYear,
        shift: paperMeta.shift || null,
        tier: paperMeta.tier || null,
        exam_date: paperMeta.exam_date || null,
        question_number: subQ.question_number ? String(subQ.question_number) : null,
        question_type: subQ.question_type || "multiple_choice",
        section_name: subQ.section_name || cluster.section_name || null,
      };

      results.push({
        question: fullQuestion,
        options: {
          A: optionsMap.A,
          B: optionsMap.B,
          C: optionsMap.C,
          D: optionsMap.D,
        },
        correct_answer: rawAns,
        explanation,
        year: qYear,
        metadata: questionMeta,
      });
    }
  }

  return results;
}
