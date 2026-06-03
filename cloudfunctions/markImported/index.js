const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const db = cloud.database()
  await db.collection('invitations').doc(event.id).update({
    data: { status: 'imported' },
  })
  return { success: true }
}
