import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'
import { observer } from '@tarojs/mobx'
import HLJTab from '../Tab'
import styles from './style.module.less'


@observer
class Index extends Component {
  timeout = null
  scrollTop = 0
  posterH = 0
  tabH = 0
  isStaticTop = true
  offsetY = 0
  tabIndex: 0
  changeTab: null
  staticChangeTab: null

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
        this.setState({
          viewHeight: this.state.viewHeight,
        })
      }
    })
  }

  autoObserveScrollTop = () => {
    const query1 = Taro.createSelectorQuery()
    query1.select('#list').scrollOffset()
    query1.exec((res) => {
      if (!res[0]) {
        return
      }
      this.handleScrollTop(res[0].scrollTop)
    })
    this.debounce(() => {
      this.autoObserveScrollTop()
    }, 50)
  }

  handleScrollTop = (scrollTop) => {
    if (this.scrollTop != scrollTop) {
      this.scrollTop = scrollTop
      this.handleStaticTop(true)
      this.handleScrollWithTab()
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
      this.setState({
        viewHeight: this.state.viewHeight,
      })
    }
  }

  handleScrollWithTab = () => {
    const query = Taro.createSelectorQuery()
    const list = [...Array(60).keys()]
    const queryArr = list.map((item, index) => {
      return '#item' + index
    })
    queryArr.forEach((item) => {
      query.select(item).boundingClientRect()
    })
    query.exec((res) => {
      if (res.length <= 0) {
        return
      }
      let realItem
      if (res[0].top >= this.tabH) {
        realItem = res[0]
      } else {
        for (var item of res) {
          if (Math.floor(item.top) <= this.tabH && item.bottom > this.tabH) {
            realItem = item
            break
          }
        }
      }

      if (realItem) {
        const itemId = realItem.id
        const tabIndex = itemId.split('item')[1]
        console.log('scrollindex  '+ tabIndex)

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
    })
  }

  tabBindInfo = (e) => {
    this.changeTab = e.changeTab
  }
  staticTabBindInfo = (e) => {
    this.staticChangeTab = e.changeTab
  }

  onTabChange = (e) => {
    if (this.tabIndex != e.currentIndex) {
      const query = Taro.createSelectorQuery()
      query.select('#item' + e.currentIndex).boundingClientRect()
      query.exec((res) => {
        const item = res[0]
        if (!item) {
          return
        }

        const oldOffsetY = this.offsetY
        this.offsetY = this.scrollTop + item.top - this.tabH
        this.offsetY = Math.ceil(this.offsetY)
        this.offsetY += 1 // 安卓手机大屏上可能存在的误差
        if (this.offsetY == oldOffsetY) {
          // offsetY不改变时 list不会reload
          this.offsetY += 0.01
        }

        this.isStaticTop = true

        console.log('tabindex  '+ e.currentIndex)

        this.tabIndex = e.currentIndex
        this.setState({
          viewHeight: this.state.viewHeight,
        })
      })
    }
  }

  debounce(fn, interval) {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.timeout = null
      fn.apply(this, arguments)
    }, interval)
  }

  onScroll = (e) => {
    this.handleScrollTop(e.detail.scrollTop)
  }

  render() {
    const list = [...Array(60).keys()]
    const cellList = list.map((item, index) => {
      return <View itemData={list[index]} key={'theme' + index} id={'item' + index} className={styles.item}>item</View>
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
              <HLJTab
                itemList={titlList}
                currentIndex={this.tabIndex}
                onChange={this.onTabChange.bind(this)}
                bindInfo={this.tabBindInfo.bind(this)}
                id="tab"
              ></HLJTab>
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
          <HLJTab
            itemList={titlList}
            currentIndex={this.tabIndex}
            onChange={this.onTabChange.bind(this)}
            bindInfo={this.staticTabBindInfo.bind(this)}
          ></HLJTab>
        </View>
        
      </View>
    )
  }
}

export default Index
