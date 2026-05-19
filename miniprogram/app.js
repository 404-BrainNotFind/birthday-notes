App({
  onLaunch() {
    try {
      if (wx.cloud) {
        wx.cloud.init({
          // 开通云开发后将 YOUR-ENV-ID 替换为实际环境 ID
          env: 'cloudbase-d1gvoiosx8ed73cf5',
          traceUser: true,
        })
      }
    } catch (e) {}
  },
})
