Page({
  data: {
    stats: {
      totalCount: 0,
      todayCount: 0,
      within7Count: 0,
      monthCount: 0
    }
  },

  goAdd() {
    wx.switchTab({
      url: '/pages/add/add'
    })
  },

  goList() {
    wx.switchTab({
      url: '/pages/list/list'
    })
  }
})
