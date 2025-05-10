import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../page';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\? Register/i)).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<LoginPage />);
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('calls signIn when form is submitted with valid data', async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });
    
    render(<LoginPage />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));
    
    // Wait for signIn to be called
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('redirects to dashboard on successful login', async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
    
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });
    
    render(<LoginPage />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));
    
    // Wait for redirect
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error message on failed login', async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: false, error: 'Invalid credentials' });
    
    render(<LoginPage />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password. Please try again./i)).toBeInTheDocument();
    });
  });
});
