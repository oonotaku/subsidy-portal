export const saveProjectAnswers = async (projectId, answers, token) => {
  try {
    const response = await fetch('http://localhost:8000/api/projects/answers/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        project_id: projectId,
        answers
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save answers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving answers:', error);
    throw error;
  }
};

export const createProject = async (token) => {
  try {
    const response = await fetch('http://localhost:8000/api/projects/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const saveAIAnswers = async (projectId, answers, token) => {
  const response = await fetch(`http://localhost:8000/api/projects/${projectId}/ai-answers/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    throw new Error('Failed to save AI answers');
  }

  return await response.json();
}; 