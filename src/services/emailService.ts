import { EmailService } from '@/types/auth';

// Mock email service - in a real app, you would integrate with services like SendGrid, AWS SES, etc.
export const emailService: EmailService = {
  sendTemporaryCredentials: async (email: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate temporary credentials
      const tempUsername = `temp_${Math.random().toString(36).substring(2, 8)}`;
      const tempPassword = Math.random().toString(36).substring(2, 12);
      
      // In a real app, you would send an actual email here
      console.log(`📧 Email sent to ${email}`);
      console.log(`Temporary Username: ${tempUsername}`);
      console.log(`Temporary Password: ${tempPassword}`);
      
      // Store temporary credentials (in a real app, this would be in a database)
      localStorage.setItem('tempCredentials', JSON.stringify({
        email,
        username: tempUsername,
        password: tempPassword,
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
      }));
      
      return {
        success: true,
        message: `Temporary credentials sent to ${email}. Check your email and use the provided credentials to login.`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send temporary credentials. Please try again.'
      };
    }
  },

  sendVerificationEmail: async (email: string, token: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send an actual verification email here
      console.log(`📧 Verification email sent to ${email}`);
      console.log(`Verification Token: ${token}`);
      
      return {
        success: true,
        message: `Verification email sent to ${email}. Please check your inbox and click the verification link.`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send verification email. Please try again.'
      };
    }
  }
};

// Helper function to get temporary credentials
export const getTemporaryCredentials = () => {
  const stored = localStorage.getItem('tempCredentials');
  if (!stored) return null;
  
  const credentials = JSON.parse(stored);
  if (Date.now() > credentials.expiresAt) {
    localStorage.removeItem('tempCredentials');
    return null;
  }
  
  return credentials;
};

// Helper function to clear temporary credentials
export const clearTemporaryCredentials = () => {
  localStorage.removeItem('tempCredentials');
};
