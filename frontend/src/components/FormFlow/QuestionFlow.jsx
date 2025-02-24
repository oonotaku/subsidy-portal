import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextQuestion from './questions/TextQuestion';
import NumberQuestion from './questions/NumberQuestion';
import ChoiceQuestion from './questions/ChoiceQuestion';

const QuestionFlow = ({ projectId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [projectId]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/questions/`);
      const data = await response.json();
      setQuestions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswer = async (answer) => {
    setAiThinking(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/answer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: questions[currentQuestionIndex].id,
          answer,
        }),
      });
      
      const data = await response.json();
      
      // 回答を保存
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: answer
      }));

      // AIからの追加質問があれば追加
      if (data.additionalQuestions) {
        setQuestions(prev => [...prev, ...data.additionalQuestions]);
      }

      // 次の質問へ
      setCurrentQuestionIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setAiThinking(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl mx-auto p-6"
        >
          {currentQuestion && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              {aiThinking && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white">AIが考え中...</div>
                </div>
              )}
              
              {currentQuestion.type === 'text' && (
                <TextQuestion
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                />
              )}
              {/* 他の質問タイプのコンポーネント */}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuestionFlow; 