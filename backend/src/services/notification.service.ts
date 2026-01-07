import { publishEvent, NATS_SUBJECTS } from '../config/nats';
import { createNotification } from '../modules/notifications/notification.service';

export interface NotificationEvent {
  userId: string;
  type: 'answer' | 'comment' | 'support' | 'announcement';
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Send notification via NATS and store in database
   */
  static async sendNotification(data: NotificationEvent): Promise<void> {
    try {
      // Store in database
      await createNotification({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      });

      // Publish to NATS for real-time delivery
      await publishEvent(NATS_SUBJECTS.NOTIFICATION, {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification when a question is answered
   */
  static async notifyQuestionAnswered(
    questionAuthorId: string,
    answerAuthorName: string,
    questionId: string,
    questionTitle: string
  ): Promise<void> {
    await this.sendNotification({
      userId: questionAuthorId,
      type: 'answer',
      title: 'New Answer to Your Question',
      message: `${answerAuthorName} answered your question: "${questionTitle}"`,
      link: `/questions/${questionId}`,
      metadata: {
        questionId,
        answerAuthorName,
      },
    });
  }

  /**
   * Send notification when support ticket is updated
   */
  static async notifySupportTicketUpdated(
    userId: string,
    ticketId: string,
    ticketTitle: string,
    updatedBy: string
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'support',
      title: 'Support Ticket Updated',
      message: `${updatedBy} updated your support ticket: "${ticketTitle}"`,
      link: `/support/${ticketId}`,
      metadata: {
        ticketId,
        updatedBy,
      },
    });
  }

  /**
   * Send notification when answer is accepted
   */
  static async notifyAnswerAccepted(
    answerAuthorId: string,
    questionId: string,
    questionTitle: string
  ): Promise<void> {
    await this.sendNotification({
      userId: answerAuthorId,
      type: 'answer',
      title: 'Your Answer Was Accepted',
      message: `Your answer to "${questionTitle}" was accepted as the best answer!`,
      link: `/questions/${questionId}`,
      metadata: {
        questionId,
      },
    });
  }
}

