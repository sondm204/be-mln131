export function extractJson(text) {
  // Loại bỏ markdown code fence (```json ... ```)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  
  // Nếu không có code fence, trả về text gốc
  return text.trim();
}