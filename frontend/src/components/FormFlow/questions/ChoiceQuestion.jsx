import { useState } from 'react';
import { motion } from 'framer-motion';

const ChoiceQuestion = ({ question, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption) {
      onAnswer(selectedOption);
      setSelectedOption('');
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
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option}
              className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="choice"
                value={option}
                checked={selectedOption === option}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-3">{option}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!selectedOption}
          >
            次へ
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChoiceQuestion; 