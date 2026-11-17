const db = require('../config/db');

async function getMyNotifications(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    );
    res.json({ success: true, count: rows.length, notifications: rows });
  } catch (error) {
    console.error('[GetNotifications Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications: ' + error.message });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user.id;
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('[MarkNotifications Error]', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications read: ' + error.message });
  }
}

module.exports = {
  getMyNotifications,
  markAllNotificationsRead
};

