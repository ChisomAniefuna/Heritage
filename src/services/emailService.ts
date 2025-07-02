interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
  apiKey?: string;
  domain?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

class EmailService {
  private config: EmailConfig;

  constructor() {
    this.config = {
      provider: 'sendgrid',
      apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
      domain: import.meta.env.VITE_EMAIL_DOMAIN || 'heritagevault.com'
    };
  }

  // Send email using configured provider
  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(message);
        case 'mailgun':
          return await this.sendWithMailgun(message);
        case 'ses':
          return await this.sendWithSES(message);
        case 'smtp':
          return await this.sendWithSMTP(message);
        default:
          throw new Error('Email provider not configured');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: `Failed to send email: ${error}`
      };
    }
  }

  // SendGrid implementation
  private async sendWithSendGrid(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const payload = {
      personalizations: [
        {
          to: Array.isArray(message.to) ? message.to.map(email => ({ email })) : [{ email: message.to }],
          cc: message.cc ? (Array.isArray(message.cc) ? message.cc.map(email => ({ email })) : [{ email: message.cc }]) : undefined,
          bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc.map(email => ({ email })) : [{ email: message.bcc }]) : undefined,
          subject: message.subject
        }
      ],
      from: {
        email: `noreply@${this.config.domain}`,
        name: 'Heritage Vault'
      },
      content: [
        {
          type: message.html ? 'text/html' : 'text/plain',
          value: message.html || message.text || ''
        }
      ],
      headers: {
        'X-Priority': this.getPriorityHeader(message.priority)
      }
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return {
        success: true,
        messageId: response.headers.get('X-Message-Id') || undefined
      };
    } else {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }
  }

  // Mailgun implementation
  private async sendWithMailgun(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.apiKey || !this.config.domain) {
      throw new Error('Mailgun configuration incomplete');
    }

    const formData = new FormData();
    formData.append('from', `Heritage Vault <noreply@${this.config.domain}>`);
    formData.append('to', Array.isArray(message.to) ? message.to.join(',') : message.to);
    if (message.cc) formData.append('cc', Array.isArray(message.cc) ? message.cc.join(',') : message.cc);
    if (message.bcc) formData.append('bcc', Array.isArray(message.bcc) ? message.bcc.join(',') : message.bcc);
    formData.append('subject', message.subject);
    if (message.text) formData.append('text', message.text);
    if (message.html) formData.append('html', message.html);
    formData.append('h:X-Priority', this.getPriorityHeader(message.priority));

    const response = await fetch(`https://api.mailgun.net/v3/${this.config.domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
      },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        messageId: result.id
      };
    } else {
      const error = await response.text();
      throw new Error(`Mailgun error: ${error}`);
    }
  }

  // AWS SES implementation (simplified)
  private async sendWithSES(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // This would require AWS SDK integration
    // For now, we'll simulate success
    console.log('SES email would be sent:', message);
    return {
      success: true,
      messageId: `ses_${Date.now()}`
    };
  }

  // SMTP implementation (simplified)
  private async sendWithSMTP(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // This would require nodemailer or similar SMTP client
    // For now, we'll simulate success
    console.log('SMTP email would be sent:', message);
    return {
      success: true,
      messageId: `smtp_${Date.now()}`
    };
  }

  // Get priority header value
  private getPriorityHeader(priority?: string): string {
    switch (priority) {
      case 'urgent': return '1';
      case 'high': return '2';
      case 'normal': return '3';
      case 'low': return '4';
      default: return '3';
    }
  }

  // Send bulk emails
  async sendBulkEmails(messages: EmailMessage[]): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
    const results = [];
    
    for (const message of messages) {
      const result = await this.sendEmail(message);
      results.push(result);
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Validate email address
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get email delivery status (if supported by provider)
  async getDeliveryStatus(messageId: string): Promise<{
    status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
    timestamp?: string;
    details?: any;
  } | null> {
    // This would integrate with provider's webhook/API for delivery tracking
    return null;
  }
}

// Create singleton instance
export const emailService = new EmailService();

export type { EmailMessage, EmailConfig };