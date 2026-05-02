import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  TextInput,
  Button,
  Select,
  SelectItem,
  InlineNotification,
  PasswordInput,
  Stack,
} from '@carbon/react';
import authService, { RegisterData } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'DESIGNER',
    phone_number: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.password_confirm) {
      errors.password_confirm = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (formData.phone_number && !/^(\+254[17]\d{8}|07\d{8})$/.test(formData.phone_number)) {
      errors.phone_number = 'Phone number must be in Kenyan format (+254XXXXXXXXX or 07XXXXXXXX)';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.register(formData);
      
      if (response.success) {
        // Registration successful - redirect to dashboard
        navigate('/dashboard', { 
          state: { message: 'Registration successful! Welcome to CraftersLink.' } 
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-600 mb-6">
            Join CraftersLink to connect with artisans or showcase your crafts
          </p>

          {error && (
            <InlineNotification
              kind="error"
              title="Registration Failed"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
              className="mb-6"
            />
          )}

          <Form onSubmit={handleSubmit}>
            <Stack gap={6}>
              {/* Role Selection */}
              <Select
                id="role"
                name="role"
                labelText="I am a"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <SelectItem value="DESIGNER" text="Interior Designer" />
                <SelectItem value="ARTISAN" text="Artisan" />
              </Select>

              {/* Username */}
              <TextInput
                id="username"
                name="username"
                labelText="Username"
                placeholder="Enter username (3-150 characters)"
                value={formData.username}
                onChange={handleChange}
                invalid={!!fieldErrors.username}
                invalidText={fieldErrors.username}
                required
              />

              {/* Email */}
              <TextInput
                id="email"
                name="email"
                type="email"
                labelText="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                invalid={!!fieldErrors.email}
                invalidText={fieldErrors.email}
                required
              />

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  id="first_name"
                  name="first_name"
                  labelText="First Name"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  invalid={!!fieldErrors.first_name}
                  invalidText={fieldErrors.first_name}
                  required
                />
                
                <TextInput
                  id="last_name"
                  name="last_name"
                  labelText="Last Name"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  invalid={!!fieldErrors.last_name}
                  invalidText={fieldErrors.last_name}
                  required
                />
              </div>

              {/* Phone Number (Optional) */}
              <TextInput
                id="phone_number"
                name="phone_number"
                labelText="Phone Number (Optional)"
                placeholder="+254XXXXXXXXX or 07XXXXXXXX"
                value={formData.phone_number}
                onChange={handleChange}
                invalid={!!fieldErrors.phone_number}
                invalidText={fieldErrors.phone_number}
              />

              {/* Password */}
              <PasswordInput
                id="password"
                name="password"
                labelText="Password"
                placeholder="Enter password (min. 8 characters)"
                value={formData.password}
                onChange={handleChange}
                invalid={!!fieldErrors.password}
                invalidText={fieldErrors.password}
                required
              />

              {/* Confirm Password */}
              <PasswordInput
                id="password_confirm"
                name="password_confirm"
                labelText="Confirm Password"
                placeholder="Re-enter password"
                value={formData.password_confirm}
                onChange={handleChange}
                invalid={!!fieldErrors.password_confirm}
                invalidText={fieldErrors.password_confirm}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </Stack>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;

// Made with Bob
