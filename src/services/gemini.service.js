import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function askGemini(question, context) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
Bạn là một học giả chuyên sâu về TRIẾT HỌC
(bao gồm triết học phương Tây, phương Đông, hiện đại, đạo đức học, siêu hình học, nhận thức luận).

Nhiệm vụ:
- Trả lời mọi câu hỏi LIÊN QUAN ĐẾN TRIẾT HỌC.
- Được phép sử dụng kiến thức nền của bạn.
- Kiến thức bên dưới chỉ là TÀI LIỆU BỔ SUNG, dùng nếu liên quan.

Kiến thức bổ sung:
---
${context}
---

Câu hỏi:
"${question}"

YÊU CẦU BẮT BUỘC:
- Chỉ trả về JSON hợp lệ
- KHÔNG markdown ngoài JSON
- Trường "answer_markdown" PHẢI là Markdown
- Viết bằng tiếng Việt

JSON FORMAT:
{
  "success": true,
  "domain": "philosophy",
  "answer_markdown": "markdown string",
  "sources": ["string"],
  "confidence": number (0 đến 1)
}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
