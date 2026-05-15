const store = require('../../utils/birthday-service')
const dateUtil = require('../../utils/date')

Page({
  data: {
    stats: {
      totalCount: 0,
      todayCount: 0,
      within7Count: 0,
      monthCount: 0
    },
    todayList: [],
    upcomingList: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const list = store.getBirthdays()
    const stats = dateUtil.getStats(list)
    const todayList = list.filter((item) => item.isToday)
    const upcomingList = list.filter((item) => item.isUpcoming)
    this.setData({ stats, todayList, upcomingList })
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
  },

  goDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
})
