import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { generateFollowUpQuestions } from '../../services/openaiService';
import TypeFormQuestion from './TypeFormQuestion';
import TypeFormComplete from './TypeFormComplete';
import { toast } from 'react-toastify';

// 基本質問のマッピング
const QUESTION_ID_MAP = {
  'business_overview': 4,
  'current_issues': 5,
  'target_market': 6,
  'unique_point': 7,
  'implementation_plan': 8,
  'expected_outcome': 9
};

const TypeFormContainer = ({ questions: initialQuestions, onComplete }) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);
  const [answers, setAnswers] = useState({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const handleNext = async (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = QUESTION_ID_MAP[currentQuestion.id] || currentQuestion.id;
    
    const updatedAnswers = {
      ...answers,
      [questionId]: answer
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

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      onComplete(updatedAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (isCompleted) {
    return <TypeFormComplete answers={answers} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl p-8">
        {isGeneratingQuestions ? (
          <div className="text-center">
            <p className="text-lg text-gray-600">追加の質問を生成中...</p>
          </div>
        ) : (
          <TypeFormQuestion
            question={questions[currentQuestionIndex]}
            answer={answers[QUESTION_ID_MAP[questions[currentQuestionIndex].id] || questions[currentQuestionIndex].id]}
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