export const generateFollowUpQuestions = async (answers, token) => {
  try {
    const response = await fetch('http://localhost:8000/api/generate-questions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}; 