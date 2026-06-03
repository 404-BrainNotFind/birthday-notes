const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const db = cloud.database()
  const result = await db
    .collection('invitations')
    .where({ inviterToken: event.token, status: 'pending' })
    .orderBy('submitTime', 'desc')
    .get()
  return result.data
}
