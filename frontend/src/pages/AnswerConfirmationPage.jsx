import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const AnswerConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, projectId } = location.state || {};

  const handleContinue = () => {
    navigate('/ai-questions', { state: { answers, projectId } });
  };

  const handleSave = () => {
    navigate('/applications');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">回答内容の確認</h1>
      <div className="space-y-4 mb-8">
        {Object.entries(answers || {}).map(([key, value]) => (
          <div key={key} className="border p-4 rounded">
            <p className="font-semibold">質問 {key}</p>
            <p className="mt-2">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleContinue}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          AI質問に進む
        </button>
        <button
          onClick={handleSave}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          一旦保存する
        </button>
      </div>
    </div>
  );
};

export default AnswerConfirmationPage; 