const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: event.token,
    page: 'pages/invite/invite',
    is_hyaline: false,
    width: 280,
  })
  const base64 = `data:image/png;base64,${result.buffer.toString('base64')}`
  return { base64 }
}
