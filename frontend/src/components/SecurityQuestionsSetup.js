import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const SecurityQuestionsSetup = ({ onComplete, token }) => {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  
  const [questions, setQuestions] = useState([
    { questionNumber: 1, question: '', answer: '' },
    { questionNumber: 2, question: '', answer: '' },
    { questionNumber: 3, question: '', answer: '' }
  ]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/security-questions/questions`);
      if (response.data.success) {
        setAvailableQuestions(response.data.data.questions);
      }
    } catch (err) {
      showError('Error loading security questions');
      console.error(err);
    }
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].answer = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all questions are selected
    for (let i = 0; i < 3; i++) {
      if (!questions[i].question) {
        showError(`Please select a question for slot ${i + 1}`);
        return;
      }
      if (!questions[i].answer || questions[i].answer.trim().length < 2) {
        showError(`Please provide a valid answer for question ${i + 1} (minimum 2 characters)`);
        return;
      }
    }

    // Check for duplicate questions
    const selectedQuestions = questions.map(q => q.question);
    if (new Set(selectedQuestions).size !== 3) {
      showError('Please select 3 different security questions');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/security-questions/set`,
        { questions },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        success('Security questions set successfully!');
        if (onComplete) {
          onComplete();
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error setting security questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Set Up Security Questions</h3>
        <p className="mt-1 text-sm text-gray-600">
          These questions will help you reset your password if you forget it.
        </p>
      </div>

      <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-xl">🔐</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Important Security Feature
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Choose questions you'll remember the answers to, but that others can't easily guess.</p>
              <p className="mt-1">Answers are not case-sensitive.</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, index) => (
          <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-md">
            <label className="block text-sm font-medium text-gray-700">
              Security Question {index + 1}
            </label>
            <select
              required
              value={q.question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">-- Select a question --</option>
              {availableQuestions.map((question, qIndex) => (
                <option 
                  key={qIndex} 
                  value={question}
                  disabled={questions.some((q2, i2) => i2 !== index && q2.question === question)}
                >
                  {question}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Your answer"
              value={q.answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        ))}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Security Questions'}
          </button>
          {onComplete && (
            <button
              type="button"
              onClick={handleSkip}
              className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Skip for Now
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SecurityQuestionsSetup;

