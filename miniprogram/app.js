App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        // 开通云开发后，将 YOUR-ENV-ID 替换为实际环境 ID
        // 在 DevTools → 云开发 → 环境 → 环境 ID 处查看
        env: 'YOUR-ENV-ID',
        traceUser: true,
      })
    }
  },
})
