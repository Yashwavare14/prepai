import { env } from "@/lib/config/env";

/**
 * Returns external parser configuration with fallbacks
 */
export function getParserConfig() {
  const baseUrl = (env.PDF_PARSER_API_URL || "http://localhost:3001").replace(/\/+$/, "");
  const defaultProvider = env.PDF_PARSER_PROVIDER || "gemini";
  const defaultModel = env.PDF_PARSER_MODEL || "gemini-2.5-flash";

  return { baseUrl, defaultProvider, defaultModel };
}

/**
 * Builds FormData payload for the external PDF parser service.
 * Appends both 'pdf' and 'file' field keys to ensure maximum compatibility.
 *
 * @param {Buffer|ArrayBuffer|Uint8Array} fileBuffer
 * @param {string} filename
 * @param {Object} options
 * @returns {FormData}
 */
function buildFormData(fileBuffer, filename, options = {}) {
  const { defaultProvider, defaultModel } = getParserConfig();
  const provider = options.provider || defaultProvider;
  const model = options.model || defaultModel;

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: "application/pdf" });

  // The external service uses multer with upload.single('pdfFile')
  formData.append("pdfFile", blob, filename || "document.pdf");
  formData.append("provider", provider);
  formData.append("model", model);

  if (options.section) {
    formData.append("section", options.section);
  }

  return formData;
}

/**
 * Extracts sections from a PDF file using the external service.
 * Calls POST /api/extract-sections
 *
 * @param {Buffer|ArrayBuffer|Uint8Array} fileBuffer
 * @param {string} filename
 * @param {Object} [options]
 * @param {string} [options.provider]
 * @param {string} [options.model]
 * @returns {Promise<Array<{ name: string, description: string }>>}
 */
export async function extractSections(fileBuffer, filename, options = {}) {
  const { baseUrl } = getParserConfig();
  const formData = buildFormData(fileBuffer, filename, options);

  let response;
  try {
    response = await fetch(`${baseUrl}/api/extract-sections`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new Error(
      `Failed to connect to PDF Parser service at ${baseUrl}: ${err.message}. Ensure the external service is running.`
    );
  }

  const rawText = await response.text();
  let result = null;
  try {
    result = JSON.parse(rawText);
  } catch {
    // Response was not JSON (e.g. HTML or plain text error)
  }

  if (!response.ok || !result?.success) {
    const errorDetail =
      result?.error ||
      result?.message ||
      result?.detail ||
      rawText ||
      `HTTP ${response.status}`;
    console.error(`[PDF Parser] /api/extract-sections error (HTTP ${response.status}):`, errorDetail);
    throw new Error(
      `External PDF parser failed (HTTP ${response.status}): ${typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail)}`
    );
  }

  return result.sections || [];
}

/**
 * Extracts question clusters / blocks from a PDF file using the external service.
 * Calls POST /api/extract-blocks
 *
 * @param {Buffer|ArrayBuffer|Uint8Array} fileBuffer
 * @param {string} filename
 * @param {Object} [options]
 * @param {string} [options.section]
 * @param {string} [options.provider]
 * @param {string} [options.model]
 * @returns {Promise<Object>}
 */
export async function extractBlocks(fileBuffer, filename, options = {}) {
  const { baseUrl } = getParserConfig();
  const formData = buildFormData(fileBuffer, filename, options);

  let response;
  try {
    response = await fetch(`${baseUrl}/api/extract-blocks`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new Error(
      `Failed to connect to PDF Parser service at ${baseUrl}: ${err.message}. Ensure the external service is running.`
    );
  }

  const rawText = await response.text();
  let result = null;
  try {
    result = JSON.parse(rawText);
  } catch {
    // Response was not JSON
  }

  if (!response.ok || !result?.success) {
    const errorDetail =
      result?.error ||
      result?.message ||
      result?.detail ||
      rawText ||
      `HTTP ${response.status}`;
    console.error(`[PDF Parser] /api/extract-blocks error (HTTP ${response.status}):`, errorDetail);
    throw new Error(
      `External PDF parser failed (HTTP ${response.status}): ${typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail)}`
    );
  }

  return result;
}
