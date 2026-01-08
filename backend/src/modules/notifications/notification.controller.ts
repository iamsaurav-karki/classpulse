import { Request, Response } from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from './notification.service';
import { sendSuccess, sendError } from '../../utils/response';

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await getUserNotifications(req.user.userId, unreadOnly);
    sendSuccess(res, notifications, 'Notifications retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const notification = await markAsRead(req.params.id, req.user.userId);
    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const count = await markAllAsRead(req.user.userId);
    sendSuccess(res, { count }, 'All notifications marked as read');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getUnread = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const count = await getUnreadCount(req.user.userId);
    sendSuccess(res, { count }, 'Unread count retrieved');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

