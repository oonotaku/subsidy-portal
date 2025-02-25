const TypeFormComplete = ({ answers }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">
        ありがとうございました！
      </h2>
      <p className="text-gray-600">
        回答が保存されました。
      </p>
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">回答内容</h3>
        {Object.entries(answers).map(([questionId, answer]) => (
          <div key={questionId} className="mb-4">
            <div className="font-medium text-gray-700">{questionId}</div>
            <div className="mt-1 text-gray-600">{answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypeFormComplete; 