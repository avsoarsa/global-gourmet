/**
 * Email utility functions for sending transactional emails
 * 
 * Note: In a production environment, you would use a service like SendGrid, Mailgun, etc.
 * For this implementation, we'll simulate email sending.
 */

import { Order, OrderItem, Product } from '@/types/database.types';

// Simulate email sending (in a real app, this would use a proper email service)
export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> => {
  // In a real implementation, this would call an email service API
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${htmlContent}`);
  
  // Simulate a successful email send after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Email sent successfully');
      resolve(true);
    }, 1000);
  });
};

// Generate order confirmation email
export const sendOrderConfirmationEmail = async (
  email: string,
  order: Order,
  orderItems: OrderItem[],
  products: Record<string, Product>,
  customerName: string
): Promise<boolean> => {
  const subject = `Order Confirmation #${order.id.substring(0, 8).toUpperCase()}`;
  
  // Generate HTML content for the email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { color: #f59e0b; font-size: 24px; font-weight: bold; }
        .order-info { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .order-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .order-items th, .order-items td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .order-items th { background-color: #f9fafb; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .totals { margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .grand-total { font-weight: bold; font-size: 18px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Global Gourmet</div>
          <h1>Order Confirmation</h1>
        </div>
        
        <p>Dear ${customerName},</p>
        
        <p>Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
        
        <div class="order-info">
          <p><strong>Order Number:</strong> ${order.id.substring(0, 8).toUpperCase()}</p>
          <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        </div>
        
        <h2>Order Summary</h2>
        
        <table class="order-items">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems.map(item => {
              const product = products[item.product_id];
              return `
                <tr>
                  <td>${product?.name || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          
          ${order.discount_amount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-$${order.discount_amount.toFixed(2)}</span>
            </div>
          ` : ''}
          
          <div class="total-row">
            <span>Shipping:</span>
            <span>$${order.shipping_amount.toFixed(2)}</span>
          </div>
          
          <div class="total-row">
            <span>Tax:</span>
            <span>$${order.tax_amount.toFixed(2)}</span>
          </div>
          
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>$${order.total_amount.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/orders" class="button">View Order Details</a>
        </div>
        
        <p>Your order will be shipped to:</p>
        <p>
          ${order.shipping_address}<br>
          ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}<br>
          ${order.shipping_country}
        </p>
        
        <p>If you have any questions about your order, please contact our customer service team.</p>
        
        <p>Thank you for shopping with Global Gourmet!</p>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Global Gourmet. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, subject, htmlContent);
};
