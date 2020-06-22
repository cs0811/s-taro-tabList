import Taro, { Component } from '@tarojs/taro'
import { View, Button, ScrollView } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import styles from './style.module.less'
import HLJTab from '../Tab/index.js'


@inject('counterStore')
@observer
class Index extends Component {
  timeout = null
  scrollTop = 0
  topH = 40
  tabH = 44

  config = {
    navigationBarTitleText: '首页',
  }

  state = {
    tabIndex: 0,
    cIndex: -1,
    viewHeight: 0,
  }

  componentWillMount () { }

  componentWillReact () {
    // console.log('componentWillReact')
  }

  componentDidMount () {
    const query = Taro.createSelectorQuery()
    query.selectViewport().boundingClientRect()
    query.exec((res) => {
      this.setState({
        viewHeight: res[0].height-this.tabH
      })
    })

    this.autoObserveScrollTop()
  }

  autoObserveScrollTop = () => {
    const query1 = Taro.createSelectorQuery()
    query1.select('#list').scrollOffset()
    query1.exec((res) => {
      if (this.scrollTop != res[0].scrollTop) {
        let shouldReload = true
        if (this.scrollTop > this.topH && res[0].scrollTop > this.topH) {
          shouldReload = false
        }
        this.scrollTop = res[0].scrollTop
        // console.log(this.scrollTop)
        if (shouldReload) {
          this.setState({
            viewHeight: this.state.viewHeight,
          })
        }

        this.handleScrollWithTab()
      }
    })
    this.debounce(() => {
      this.autoObserveScrollTop()
    }, 10)
  }

  handleScrollWithTab = () => {
    // this.debounce(() => {
      const query = Taro.createSelectorQuery()
      const queryArr = [...Array(30).keys()].map((item, index) => {
        return ('#item'+index)
      })
      queryArr.forEach((item) => {
        query.select(item).boundingClientRect()
      })
      query.exec((res) => {
        for (var item of res) {
          if (item.top <= this.tabH && item.bottom > this.tabH) {
            const itemId = item.id
            const tabIndex = itemId.split('item')[1]
            if (this.state.tabIndex != tabIndex) {
              this.setState({
                tabIndex: tabIndex
              })
            }
            break
          }
        }
      })
    // }, 350)
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  componentDidShow () { }

  componentDidHide () { }

  onTabChange = (e) => {
    if (this.state.cIndex != e.currentIndex || this.state.tabIndex != e.currentIndex) {
      this.setState({
        cIndex: e.currentIndex,
        tabIndex: e.currentIndex,
      })
    }
  }

  onScrollToUpper = (e) => {
    // console.log(e)
  }

  debounce(fn, interval) {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.timeout = null
      fn.apply(this, arguments)
    }, interval);
  }

  onScroll = (e) => {
    // console.log(e.detail.scrollTop)
    // 返回数据不连贯，间隔太大，且快速滑动大概率漏掉事件，暂时使用循环去获取scroll的偏移    
  }

  render () {
    const titlList = [...Array(30).keys()]
    const list = [...Array(30).keys()].map((item, index) => {
      return <View className={styles.item} id={'item'+index}>{item}</View>
    })

    let topY = this.scrollTop
    topY = Math.max(topY, 0)
    topY = Math.min(topY, this.topH)
    topY = -topY+'px'
    
    return (
      <View className={styles.index}>
        <ScrollView scrollY className={styles.list} 
        scrollIntoView={'item'+this.state.cIndex}
        // scrollTop = {this.state.cIndex*10}
        // onScroll={this.onScroll.bind(this)}
        // onScrollToUpper={this.onScrollToUpper.bind(this)}
        upperThreshold={0}
        scrollWithAnimation
        style={{
          height:this.state.viewHeight+'px'
        }}
        id='list'
        >
          <View className={styles.top} ></View>
          {list}
        </ScrollView>
        <View className={styles.top} style={{marginTop:topY}}>
          <Button className={styles.btn} 
          >netTab</Button>
          <HLJTab itemList={titlList} 
          currentIndex={this.state.tabIndex} 
          onChange={this.onTabChange.bind(this)}>
          </HLJTab>
        </View>
      </View>
    )
  }
}

export default Index 
