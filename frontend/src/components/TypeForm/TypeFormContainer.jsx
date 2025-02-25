import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { generateFollowUpQuestions } from '../../services/openaiService';
import TypeFormQuestion from './TypeFormQuestion';
import TypeFormComplete from './TypeFormComplete';
import { toast } from 'react-toastify';

const TypeFormContainer = ({ questions: initialQuestions, onComplete }) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);
  const [answers, setAnswers] = useState(
    initialQuestions.reduce((acc, q) => ({ ...acc, [q.id]: '' }), {})
  );
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  console.log('Current state:', { currentQuestionIndex, answers, isCompleted }); // デバッグ用

  const handleNext = async (answer) => {
    console.log('Handling next:', { currentQuestionIndex, answer }); // デバッグ用
    const currentQuestion = questions[currentQuestionIndex];
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: answer
    };
    setAnswers(updatedAnswers);

    // 基本質問が終わったら追加質問を生成
    if (currentQuestionIndex === initialQuestions.length - 1) {
      setIsGeneratingQuestions(true);
      try {
        const followUpQuestions = await generateFollowUpQuestions(updatedAnswers, user.token);
        setQuestions([...initialQuestions, ...followUpQuestions]);
        toast.success('追加の質問が生成されました');
      } catch (error) {
        toast.error('追加質問の生成に失敗しました');
        setIsCompleted(true);
        onComplete(updatedAnswers);
        return;
      } finally {
        setIsGeneratingQuestions(false);
      }
    }

    // 全ての質問が終わったら完了
    if (currentQuestionIndex === questions.length - 1) {
      console.log('Completing form:', updatedAnswers); // デバッグ用
      setIsCompleted(true);
      onComplete(updatedAnswers);
      return;
    }

    // 次の質問へ
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    console.log('Going back from:', currentQuestionIndex); // デバッグ用
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 完了画面の表示
  if (isCompleted) {
    console.log('Showing completion screen with:', answers); // デバッグ用
    return <TypeFormComplete answers={answers} />;
  }

  // メイン画面の表示
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl p-8">
        {isGeneratingQuestions ? (
          <div className="text-center">
            <p className="text-lg text-gray-600">追加の質問を生成中...</p>
          </div>
        ) : (
          <TypeFormQuestion
            key={currentQuestionIndex} // 質問が変わるたびにコンポーネントを再マウント
            question={questions[currentQuestionIndex]}
            answer={answers[questions[currentQuestionIndex].id]}
            onNext={handleNext}
            onPrevious={currentQuestionIndex > 0 ? handlePrevious : null}
            progress={(currentQuestionIndex / questions.length) * 100}
            currentPage={currentQuestionIndex + 1}
            totalPages={questions.length}
          />
        )}
      </div>
    </div>
  );
};

export default TypeFormContainer; 