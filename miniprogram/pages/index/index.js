const store = require('../../utils/birthday-service')
const dateUtil = require('../../utils/date')

function getOrCreateToken() {
  let token = wx.getStorageSync('invite_token')
  if (!token) {
    token = Math.random().toString(36).substr(2, 8)
    wx.setStorageSync('invite_token', token)
  }
  return token
}

Page({
  data: {
    stats: { totalCount: 0, todayCount: 0, within7Count: 0, monthCount: 0 },
    todayList: [],
    upcomingList: [],
    inboxCount: 0,
    showInviteModal: false,
    inviteQRCode: null,
    qrLoading: false,
  },

  onShow() {
    this.loadData()
    this.loadInboxCount()
  },

  loadData() {
    const list = store.getBirthdays()
    const stats = dateUtil.getStats(list)
    const todayList = list.filter((item) => item.isToday)
    const upcomingList = list.filter((item) => item.isUpcoming)
    this.setData({ stats, todayList, upcomingList })
  },

  loadInboxCount() {
    if (!wx.cloud) return
    wx.cloud.callFunction({
      name: 'getInboxItems',
      data: { token: getOrCreateToken() },
      success: (res) => {
        const items = Array.isArray(res.result) ? res.result : []
        this.setData({ inboxCount: items.length })
      },
      fail: () => {},
    })
  },

  goAdd() {
    wx.switchTab({ url: '/pages/add/add' })
  },

  goList() {
    wx.switchTab({ url: '/pages/list/list' })
  },

  goDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goInbox() {
    wx.navigateTo({ url: '/pages/inbox/inbox' })
  },

  openInviteModal() {
    this.setData({ showInviteModal: true, inviteQRCode: null })
    this.generateQRCode()
  },

  closeInviteModal() {
    this.setData({ showInviteModal: false })
  },

  generateQRCode() {
    if (!wx.cloud) {
      wx.showToast({ title: '请先开通云开发', icon: 'none' })
      return
    }
    this.setData({ qrLoading: true })
    const token = getOrCreateToken()
    wx.cloud.callFunction({
      name: 'generateQRCode',
      data: { token },
      success: (res) => {
        this.setData({ inviteQRCode: res.result.base64, qrLoading: false })
      },
      fail: () => {
        this.setData({ qrLoading: false })
        wx.showToast({ title: '生成失败，请用分享卡', icon: 'none' })
      },
    })
  },

  onShareAppMessage() {
    const token = getOrCreateToken()
    return {
      title: '填写你的生日，让我帮你记住 🎂',
      path: `/pages/invite/invite?token=${token}`,
    }
  },
})
