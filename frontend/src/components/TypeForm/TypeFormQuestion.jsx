import { useState, useEffect, useRef } from 'react';

const TypeFormQuestion = ({ 
  question, 
  answer: savedAnswer,  // props名を明確に
  onNext, 
  onPrevious, 
  progress,
  currentPage,
  totalPages 
}) => {
  // 初期状態をsavedAnswerに設定
  const [answer, setAnswer] = useState(savedAnswer || '');
  const inputRef = useRef(null);

  // 質問が変わったときに保存された回答を設定
  useEffect(() => {
    console.log('Question or saved answer changed:', {
      questionId: question.id,
      savedAnswer,
      currentAnswer: answer
    });
    if (savedAnswer !== answer) {
      setAnswer(savedAnswer || '');
    }
  }, [question.id, savedAnswer]);

  // デバッグ用：状態変更を監視
  useEffect(() => {
    console.log('Current state:', {
      questionId: question.id,
      answer,
      savedAnswer,
      currentPage,
      totalPages
    });
  }, [question.id, answer, savedAnswer, currentPage, totalPages]);

  // 自動フォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [question]);

  // Enterキーで次へ
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = () => {
    console.log('Handling next:', {
      questionId: question.id,
      answer,
      currentPage,
      totalPages
    });
    if (answer.trim()) {
      onNext(answer);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ページ番号 */}
      <div className="text-sm text-gray-500 mb-2">
        {currentPage} / {totalPages}
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-200 h-1 rounded-full">
        <div 
          className="bg-blue-600 h-1 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 質問 */}
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        {question.text}
      </h2>

      {/* 回答入力エリア */}
      <div className="space-y-4">
        <textarea
          ref={inputRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={question.placeholder}
          className="w-full p-4 text-lg border-b-2 border-gray-300 focus:border-blue-600 outline-none resize-none bg-transparent"
          rows={3}
        />
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between items-center pt-4">
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 戻る
          </button>
        )}
        <div className="text-sm text-gray-500">
          Enterキーで次へ進めます
        </div>
        <button
          onClick={handleNext}
          disabled={!answer.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          次へ →
        </button>
      </div>
    </div>
  );
};

export default TypeFormQuestion; 