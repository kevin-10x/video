import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: config.email.user && config.email.pass ? { user: config.email.user, pass: config.email.pass } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const transport = getTransporter();
  return transport.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${config.clientUrl}/verify-email?token=${token}`;
  await sendEmail(email, 'Verify your AfroToon AI account', `
    <h1>Welcome to AfroToon AI!</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${url}">${url}</a>
    <p>This link expires in 24 hours.</p>
  `);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${config.clientUrl}/reset-password?token=${token}`;
  await sendEmail(email, 'Reset your AfroToon AI password', `
    <h1>Password Reset Request</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${url}">${url}</a>
    <p>This link expires in 1 hour.</p>
  `);
}

export async function sendJobCompleteEmail(email: string, projectName: string, jobType: string) {
  await sendEmail(email, `Your ${jobType} is ready!`, `
    <h1>Processing Complete</h1>
    <p>Your project <strong>${projectName}</strong> has finished ${jobType.toLowerCase()}.</p>
    <p>Log in to <a href="${config.clientUrl}">AfroToon AI</a> to download your result.</p>
  `);
}

export async function sendJobFailedEmail(email: string, projectName: string, jobType: string, error: string) {
  await sendEmail(email, `Your ${jobType} failed`, `
    <h1>Processing Failed</h1>
    <p>Your project <strong>${projectName}</strong> encountered an error during ${jobType.toLowerCase()}.</p>
    <p>Error: ${error}</p>
    <p>Please try again or contact support.</p>
  `);
}