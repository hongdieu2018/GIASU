import React, { useState } from 'react';
import { Question } from '../types';
import { Sparkles, X, Lightbulb, MessageCircle, Send, Bot, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AIAssistantModalProps {
  question: Question;
  lessonTitle: string;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  question,
  lessonTitle,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');

  const generatePedagogicalExplanation = async (userPrompt?: string) => {
    setLoading(true);
    try {
      const apiKey =
        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
        (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        const promptText = `
Bạn là "Cô Hồng Diệu" - giáo viên Tin học lớp 3 dạy học sinh tiểu học tại Việt Nam, rất ấm áp, ân cần, giải thích sinh động cho các bé.
Bài học: "${lessonTitle}".
Câu hỏi của học sinh:
- Đề bài: "${question.prompt}"
- Ngữ cảnh / SGK: "${question.contextSnippet || 'Không có'}"
- Các đáp án: ${JSON.stringify(question.options || [])}
- Lời giải bài học: "${question.explanation}"
- Yêu cầu của học sinh: ${userPrompt || 'Giải thích dễ hiểu hơn và cho 1 mẹo ghi nhớ vui nhộn.'}

Hãy trả lời ngắn gọn (khoảng 3-4 câu), ngôn ngữ thân thiện, vui tươi, dùng ví dụ đời thường gần gũi với trẻ em.
`;
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
        });

        if (res.text) {
          setResponse(res.text);
          setLoading(false);
          return;
        }
      }

      // Default high-quality pedagogical fallback when API key is not yet set
      await new Promise((resolve) => setTimeout(resolve, 600)); // slight pleasant feeling of processing
      let simulated = '';
      if (question.difficulty === 'easy') {
        simulated = `Chào em! Cô Hồng Diệu đây nhé. Với câu hỏi này, em hãy chú ý vào các giác quan của mình (mắt nhìn, tai nghe). ${question.explanation} Nhớ kỹ mẹo của cô: ${question.tutorTip || 'Đọc kỹ đề bài để tìm từ khóa quan trọng!'} Em làm rất tốt, tự tin lên nhé!`;
      } else if (question.difficulty === 'medium') {
        simulated = `Cô Hồng Diệu hướng dẫn em nè: Hãy tưởng tượng tình huống này như một câu chuyện mỗi ngày: Điều em biết hoặc nhìn thấy trước chính là THÔNG TIN. Sau đó, việc em làm chính là QUYẾT ĐỊNH. ${question.explanation} ${question.tutorTip ? `\n\n💡 Lời dặn của cô: ${question.tutorTip}` : ''}`;
      } else {
        simulated = `Đây là câu hỏi thử thách tư duy rất thú vị! Cô Hồng Diệu gợi ý 2 bước: 1) Xác định thông tin đến từ đâu (chữ, hình hay âm thanh)? 2) Nhờ thông tin đó mà ta đưa ra hành động gì? ${question.explanation} Chúc em chinh phục trọn vẹn điểm số nhé!`;
      }
      setResponse(simulated);
    } catch (err) {
      console.error(err);
      setResponse(`Gợi ý ôn tập: ${question.explanation}\n${question.tutorTip ? `Mẹo của thầy cô: ${question.tutorTip}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial trigger
  React.useEffect(() => {
    generatePedagogicalExplanation();
  }, [question.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl ring-2 ring-amber-300 overflow-hidden shadow-xs shrink-0 bg-white/20">
              <img
                src="/src/assets/images/avatar_chao_nam_hoc_moi_1791386750428.jpg"
                alt="Cô Hồng Diệu"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm sm:text-base leading-tight">
                Gia Sư Tin Học · Cô Hồng Diệu
              </h3>
              <p className="text-[11px] text-indigo-100 font-medium">
                Giải đáp tận tình · Dễ hiểu cho học sinh lớp 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question context */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block mb-0.5">Câu hỏi đang học:</span>
          <p className="line-clamp-2 italic text-slate-600">{question.prompt}</p>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-4 max-h-[380px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-slate-500 space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
              <p className="text-xs font-medium">Gia sư đang phân tích và chuẩn bị gợi ý cho em...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {response}
              </div>

              {question.tutorTip && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 font-medium flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Bí kíp học nhanh:</span>
                    {question.tutorTip}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prompt input if student wants to ask something else */}
          <div className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customQuery.trim()) {
                    generatePedagogicalExplanation(customQuery);
                    setCustomQuery('');
                  }
                }}
                placeholder="Em muốn thầy/cô giải thích thêm điều gì?..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                disabled={loading || !customQuery.trim()}
                onClick={() => {
                  generatePedagogicalExplanation(customQuery);
                  setCustomQuery('');
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Sẵn sàng mở rộng AI Gemini cho phiên bản tới</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-pointer"
          >
            Đã hiểu, quay lại làm bài
          </button>
        </div>
      </div>
    </div>
  );
};
