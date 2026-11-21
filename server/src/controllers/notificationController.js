import Notification from '../models/Notification.js';
import { isConnectedToMongo } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let notifications = [];

    if (isConnectedToMongo) {
      notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(30);
    } else {
      notifications = memoryStore.notifications
        .filter((n) => String(n.userId) === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 30);
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (isConnectedToMongo) {
      if (id === 'all') {
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      } else {
        await Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true });
      }
    } else {
      if (id === 'all') {
        memoryStore.notifications.forEach((n) => {
          if (String(n.userId) === String(userId)) n.isRead = true;
        });
      } else {
        const notif = memoryStore.notifications.find(
          (n) => String(n._id) === String(id) && String(n.userId) === String(userId)
        );
        if (notif) notif.isRead = true;
      }
    }

    res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
};
