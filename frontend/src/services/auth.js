export const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    return { data: { ...data, token: data.token } };
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}; 