const store = require('../../utils/birthday-service')

const filterOptions = ['全部', '朋友', '同学', '家人', '同事', '其他']

Page({
  data: {
    filterOptions,
    activeFilter: '全部',
    allList: [],
    displayList: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const allList = store.getBirthdays()
    this.setData({ allList })
    this.applyFilter(this.data.activeFilter, allList)
  },

  selectFilter(event) {
    const { value } = event.currentTarget.dataset
    this.setData({
      activeFilter: value
    })
    this.applyFilter(value, this.data.allList)
  },

  applyFilter(filter, list) {
    const displayList = filter === '全部'
      ? list
      : list.filter((item) => item.relation === filter)

    this.setData({
      displayList
    })
  }
})
