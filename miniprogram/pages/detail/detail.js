const store = require('../../utils/birthday-service')

Page({
  data: {
    record: null
  },

  onLoad(options) {
    this.recordId = options.id
  },

  onShow() {
    this.loadDetail()
  },

  loadDetail() {
    const record = store.getBirthdayById(this.recordId)
    if (!record) {
      wx.showToast({
        title: '记录不存在',
        icon: 'none'
      })
      return
    }

    this.setData({
      record
    })
  }
})
