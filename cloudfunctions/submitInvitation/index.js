const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const db = cloud.database()
  try {
    await db.createCollection('invitations')
  } catch (e) {
    // 集合已存在，忽略
  }
  const { inviterToken, name, month, day, contact, note } = event
  await db.collection('invitations').add({
    data: {
      inviterToken,
      name,
      month,
      day,
      contact: contact || '',
      note: note || '',
      submitTime: db.serverDate(),
      status: 'pending',
    },
  })
  return { success: true }
}
