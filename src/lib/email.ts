/**
 * Email utility functions for sending transactional emails
 *
 * Note: In a production environment, you would use a service like SendGrid, Mailgun, etc.
 * For this implementation, we'll simulate email sending.
 */

import { Order, OrderItem, Product, UserProfile, Address } from '@/types/database.types';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

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

// Load email template
const loadEmailTemplate = (templateName: string): string => {
  try {
    const templatePath = path.join(process.cwd(), 'src/emails', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    // Return a basic template as fallback
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>{{subject}}</h1>
          <p>{{message}}</p>
        </div>
      </body>
      </html>
    `;
  }
};

// Generate order confirmation email
export const sendOrderConfirmationEmail = async (
  email: string,
  order: Order,
  orderItems: OrderItem[],
  products: Record<string, Product>,
  customerName: string,
  shippingAddress?: Address,
  shippingMethod?: any
): Promise<boolean> => {
  const subject = `Order Confirmation #${order.order_number || order.id.substring(0, 8).toUpperCase()}`;

  try {
    // Try to use the template-based email if available
    let htmlContent;

    try {
      // Load and compile template
      const templateSource = loadEmailTemplate('order-confirmation');
      const template = Handlebars.compile(templateSource);

      // Format order items for the template
      const formattedItems = orderItems.map(item => {
        const product = products[item.product_id];
        return {
          name: product?.name || 'Product',
          quantity: item.quantity,
          price: (item.price * item.quantity).toFixed(2),
        };
      });

      // Calculate estimated delivery date
      let estimatedDelivery = '5-7 business days';

      if (shippingMethod) {
        const deliveryDays = shippingMethod.days.split('-');
        const minDays = parseInt(deliveryDays[0]);
        const maxDays = deliveryDays.length > 1 ? parseInt(deliveryDays[1]) : minDays;

        const minDate = new Date();
        minDate.setDate(minDate.getDate() + minDays);

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + maxDays);

        const formatDate = (date: Date) => {
          return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          });
        };

        estimatedDelivery = deliveryDays.length > 1
          ? `${formatDate(minDate)} - ${formatDate(maxDate)}`
          : formatDate(minDate);
      }

      // Prepare template data
      const templateData = {
        customerName,
        orderNumber: order.order_number || order.id.substring(0, 8).toUpperCase(),
        orderDate: new Date(order.created_at).toLocaleDateString(),
        paymentMethod: order.payment_method,
        items: formattedItems,
        subtotal: order.subtotal.toFixed(2),
        shipping: order.shipping_amount.toFixed(2),
        tax: order.tax_amount.toFixed(2),
        discount: order.discount_amount > 0 ? order.discount_amount.toFixed(2) : null,
        total: order.total.toFixed(2),
        shippingName: shippingAddress?.full_name || '',
        shippingAddress1: shippingAddress?.address_line1 || order.shipping_address || '',
        shippingAddress2: shippingAddress?.address_line2 || '',
        shippingCity: shippingAddress?.city || order.shipping_city || '',
        shippingState: shippingAddress?.state || order.shipping_state || '',
        shippingZip: shippingAddress?.postal_code || order.shipping_postal_code || '',
        shippingCountry: shippingAddress?.country || order.shipping_country || '',
        shippingMethod: shippingMethod?.name || 'Standard Shipping',
        estimatedDelivery,
        orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/orders/${order.id}`,
        contactUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/contact`,
        privacyUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/privacy`,
        termsUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/terms`,
        currentYear: new Date().getFullYear(),
      };

      // Render email HTML
      htmlContent = template(templateData);
    } catch (templateError) {
      console.error('Error using template for order confirmation email:', templateError);

      // Fall back to the inline template if there's an error with the template file
      htmlContent = `
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
              <p><strong>Order Number:</strong> ${order.order_number || order.id.substring(0, 8).toUpperCase()}</p>
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
                <span>$${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/orders/${order.id}" class="button">View Order Details</a>
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
    }

    return sendEmail(email, subject, htmlContent);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

// Send order shipped email
export const sendOrderShippedEmail = async (
  email: string,
  order: Order,
  trackingNumber: string,
  trackingUrl: string,
  customerName: string
): Promise<boolean> => {
  const subject = `Your Order #${order.order_number || order.id.substring(0, 8).toUpperCase()} Has Shipped`;

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
        .tracking-info { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Global Gourmet</div>
          <h1>Your Order Has Shipped!</h1>
        </div>

        <p>Dear ${customerName},</p>

        <p>Great news! Your order #${order.order_number || order.id.substring(0, 8).toUpperCase()} has been shipped and is on its way to you.</p>

        <div class="tracking-info">
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <p><a href="${trackingUrl}" class="button">Track Your Package</a></p>
        </div>

        <p>You can also view your order details and tracking information in your account:</p>

        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/orders/${order.id}" class="button">View Order Details</a>
        </div>

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
