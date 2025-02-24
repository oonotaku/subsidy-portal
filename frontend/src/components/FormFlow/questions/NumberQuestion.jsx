import { useState } from 'react';
import { motion } from 'framer-motion';

const NumberQuestion = ({ question, onAnswer }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer) {
      onAnswer(Number(answer));
      setAnswer('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-semibold text-gray-800">
        {question.text}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="数値を入力..."
            required={question.required}
          />
          <span className="text-gray-600">円</span>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!answer}
          >
            次へ
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default NumberQuestion; 