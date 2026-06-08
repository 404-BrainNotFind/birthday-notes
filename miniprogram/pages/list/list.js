const store = require('../../utils/birthday-service')

const filterOptions = ['全部', '朋友', '同学', '家人', '同事', '其他']

Page({
  data: {
    filterOptions,
    activeFilter: '全部',
    keyword: '',
    allList: [],
    displayList: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const allList = store.getBirthdays()
    this.setData({ allList })
    this.refreshDisplay()
  },

  selectFilter(event) {
    const { value } = event.currentTarget.dataset
    this.setData({ activeFilter: value })
    this.refreshDisplay()
  },

  onSearchInput(event) {
    this.setData({ keyword: event.detail.value })
    this.refreshDisplay()
  },

  clearSearch() {
    this.setData({ keyword: '' })
    this.refreshDisplay()
  },

  refreshDisplay() {
    const { allList, activeFilter, keyword } = this.data
    const kw = keyword.trim().toLowerCase()
    const displayList = allList.filter((item) => {
      const matchFilter = activeFilter === '全部' || item.relation === activeFilter
      if (!matchFilter) {
        return false
      }
      if (!kw) {
        return true
      }
      const name = (item.name || '').toLowerCase()
      const note = (item.note || '').toLowerCase()
      return name.indexOf(kw) !== -1 || note.indexOf(kw) !== -1
    })
    this.setData({ displayList })
  },

  goDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
})
