const https = require('https')

// ⚠️ 本地填入真实 token；push 到 GitHub 前请改回空字符串 ''
const TOKEN = ''

function callMiniMax(input) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ model: 'MiniMax-M3', input })
    const req = https.request(
      {
        hostname: 'api.minimaxi.com',
        path: '/v1/responses',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      }
    )
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

exports.main = async (event) => {
  if (!TOKEN) {
    return { success: false, error: 'no_token' }
  }

  const { name = '', relation = '', birthdayText = '', note = '' } = event
  const input = `# 角色
你是一名文案写手，擅长短文案。

# 任务
根据输入信息，写一条生日祝福语。

# 输入
- 生日日期：${birthdayText}
- 名字：${name}
- 关系：${relation}
- 备注：${note}

# 约束
- 严格不超过 50 个汉字（标点不计入）
- 必须自然融入全部输入信息
- 简洁、有记忆点，不要凑字

# 输出规则（重要）
- 直接输出祝福语正文，仅此一行
- 不要任何解释、前缀、推荐、备选方案
- 不要"好的""以下是"等开场白
- 不要表情符号（除非祝福语本身需要）
- 如果输入内容为空，则忽略输入，正常输出

# 示例
输入：名字=小明，生日=1月1号，关系=同事，备注=程序员
输出：程序员小明生日快乐，愿你的人生少写 if，多写 return。`

  try {
    const result = await callMiniMax(input)
    const text = result && result.output_text
    if (!text) {
      return { success: false, error: 'no_output', raw: result }
    }
    return { success: true, blessing: text }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
