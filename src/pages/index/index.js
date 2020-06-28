import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'
import { observer } from '@tarojs/mobx'
import HLJSlideTab from '../Tab'
import styles from './style.module.less'


@observer
class Index extends Component {
  timeout = null
  tabTimeOut = null
  scrollTop = 0
  posterH = 0
  tabH = 0
  isStaticTop = true
  offsetY = 0
  tabIndex = 0
  changeTab = null
  staticChangeTab = null
  itemsInfoArr = []
  ignoreHandleScroll = false

  state = {
    viewHeight: 0,
    showPop: true,
  }

  config = {
    navigationBarTitleText: '首页',
    enablePullDownRefresh: false,
    onReachBottomDistance: 100,
    backgroundTextStyle: 'dark',
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
    this.timeout = null
    clearTimeout(this.tabTimeOut)
    this.tabTimeOut = null
  }

  componentDidMount() {
    const query = Taro.createSelectorQuery()
    query.selectViewport().boundingClientRect()
    query.exec((res) => {
      this.setState({
        viewHeight: res[0].height,
      })
    })
    this.autoObserveScrollTop()
  }

  componentDidUpdate() {
    const query = Taro.createSelectorQuery().in(this.$scope)
    query.select('#poster').boundingClientRect()
    query.select('#tab').boundingClientRect()
    query.exec((res) => {
      const posterInfo = res[0]
      const tabInfo = res[1]
      if (!tabInfo) {
        return
      }
      let reload = false
      if (posterInfo && this.posterH != posterInfo.height) {
        this.posterH = posterInfo.height
        this.handleStaticTop(false)
        reload = true
      }
      if (this.tabH != tabInfo.height) {
        this.tabH = tabInfo.height
        reload = true
      }
      if (reload) {
        this.setState({})
      }
    })
  }

  autoObserveScrollTop = () => {
    const query = Taro.createSelectorQuery()
    query.select('#list').scrollOffset()
    if (this.itemsInfoArr.length <= 0) {
      const list = [...Array(60).keys()]
      const queryArr = list.map((item, index) => {
        return '#item' + index
      })
      queryArr.forEach((item) => {
        query.select(item).boundingClientRect()
      })
    }
    query.exec((res) => {
      if (!res[0]) {
        return
      }
      this.handleScrollTop(res[0].scrollTop)
      if (this.itemsInfoArr.length <= 0) {
        if (res.length <= 1) {
          return
        }
        res.forEach((item, index) => {
          if (index != 0) {
            this.itemsInfoArr.push({top:item.top, bottom:item.bottom, id:item.id})
          }
        })
      }
      if (!this.ignoreHandleScroll) {
        this.handleScrollWithTabIndex()
      }
    })

    this.debounce(() => {
      this.autoObserveScrollTop()
    }, 50)
  }

  handleScrollTop = (scrollTop) => {
    if (this.scrollTop != scrollTop) {
      this.scrollTop = scrollTop
      this.handleStaticTop(true)
    }
  }

  handleStaticTop = (shouldReload) => {
    const oldStaticTop = this.isStaticTop
    if (this.scrollTop >= this.posterH) {
      this.isStaticTop = true
    } else {
      this.isStaticTop = false
    }
    if (this.posterH <= 0) {
      this.isStaticTop = true
    }
    if (oldStaticTop != this.isStaticTop && shouldReload) {
      this.setState({})
    }
  }

  handleScrollWithTabIndex = () => {
    let realItem
    if (this.scrollTop <= this.posterH) {
      realItem = this.itemsInfoArr[0]
    } else {
      for (var item of this.itemsInfoArr) {
        if ((this.scrollTop-this.posterH)>=item.top && (this.scrollTop-this.posterH)<item.bottom) {
          realItem = item
          break
        }
      }
    }

    if (realItem) {
      const itemId = realItem.id
      const tabIndex = itemId.split('item')[1]
      if (this.tabIndex != tabIndex) {
        this.tabIndex = tabIndex
        if (this.isStaticTop) {
          if (this.staticChangeTab != null) {
            this.staticChangeTab(tabIndex)
          }
        } else {
          if (this.changeTab != null) {
            this.changeTab(tabIndex)
          }
        }
      }
    }
  }

  tabBindInfo = (e) => {
    this.changeTab = e.changeTab
  }
  staticTabBindInfo = (e) => {
    this.staticChangeTab = e.changeTab
  }

  onTabChange = (e) => {
    if (this.itemsInfoArr.length <= 0) {
      return
    }
    if (this.tabIndex != e.currentIndex) {
        const item = this.itemsInfoArr[e.currentIndex]
        const oldOffsetY = this.offsetY
        this.offsetY = this.posterH + item.top
        this.offsetY = Math.ceil(this.offsetY)
        this.offsetY += 1 // 安卓手机大屏上可能存在的误差
        if (this.offsetY == oldOffsetY) {
          // offsetY不改变时 list不会reload
          this.offsetY += 0.01
        }

        this.isStaticTop = true
        this.tabIndex = e.currentIndex
        this.ignoreHandleScroll = true
        this.setState({})
        this.tabDebounce(() => {
          this.ignoreHandleScroll = false
        }, 300);
    }
  }

  debounce(fn, interval) {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.timeout = null
      fn.apply(this, arguments)
    }, interval)
  }

  tabDebounce(fn, interval) {
    clearTimeout(this.tabTimeOut)
    this.tabTimeOut = setTimeout(() => {
      this.tabTimeOut = null
      fn.apply(this, arguments)
    }, interval)
  }

  onScroll = (e) => {
    this.handleScrollTop(e.detail.scrollTop)
  }

  render() {
    const list = [...Array(60).keys()]
    const cellList = list.map((item, index) => {
      return <View itemData={list[index]} key={'theme' + index} id={'item' + index} className={styles.item}>{item}</View>
    })
    const titlList = list.map((item) => {
      return item
    })

    return (
      <View className={styles.index}>
        <ScrollView
          scrollY
          className={styles.list}
          scrollTop={this.offsetY}
          onScroll={this.onScroll.bind(this)}
          scrollWithAnimation
          enablePullDownRefresh={false}
          style={{
            height: this.state.viewHeight + 'px',
          }}
          id="list"
        >
          <View className={styles.list_top} style={{ height: this.posterH + this.tabH + 'px' }}>
            {<View id="poster">11111</View>}
            <View 
              className={styles.list_top_tab}
              style={{visibility:this.posterH != 0?'visible':'hidden'}}
            >
              <HLJSlideTab
                itemList={titlList}
                currentIndex={this.tabIndex}
                onChange={this.onTabChange.bind(this)}
                bindInfo={this.tabBindInfo.bind(this)}
                id="tab"
              ></HLJSlideTab>
            </View>
          </View>
          {list.length > 0 && (
            <View>
              {cellList}
              <View className={styles.safeArea}></View>
            </View>
          )}
          
        </ScrollView>

        <View
          className={styles.tab}
          style={{ height: this.tabH + 'px', visibility: this.isStaticTop ? 'visible' : 'hidden' }}
        >
          <HLJSlideTab
            itemList={titlList}
            currentIndex={this.tabIndex}
            onChange={this.onTabChange.bind(this)}
            bindInfo={this.staticTabBindInfo.bind(this)}
          ></HLJSlideTab>
        </View>
        
      </View>
    )
  }
}

export default Index
