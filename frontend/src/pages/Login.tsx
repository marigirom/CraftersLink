import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  TextInput,
  Button,
  InlineNotification,
  PasswordInput,
  Stack,
} from '@carbon/react';
import authService, { LoginData } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.login(formData);
      
      if (response.success) {
        // Login successful - redirect to dashboard
        navigate('/dashboard', { 
          state: { message: 'Login successful! Welcome back.' } 
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-gray-600 mb-6">
            Welcome back to CraftersLink
          </p>

          {error && (
            <InlineNotification
              kind="error"
              title="Login Failed"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
              className="mb-6"
            />
          )}

          <Form onSubmit={handleSubmit}>
            <Stack gap={6}>
              {/* Email */}
              <TextInput
                id="email"
                name="email"
                type="email"
                labelText="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              {/* Password */}
              <PasswordInput
                id="password"
                name="password"
                labelText="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {/* Submit Button */}
              <Button
                type="submit"
                kind="primary"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Create one
                </Link>
              </p>
            </Stack>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;

// Made with Bob
