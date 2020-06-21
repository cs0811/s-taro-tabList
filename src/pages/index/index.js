import Taro, { Component } from '@tarojs/taro'
import { View, Button, ScrollView } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import styles from './style.module.less'
import HLJTab from '../Tab/index.js'


@inject('counterStore')
@observer
class Index extends Component {

  config = {
    navigationBarTitleText: '首页',
  }

  state = {
    tabIndex: 1,
    cIndex: 1,
    scrollTop: 0,
    viewHeight: 0,
  }

  componentWillMount () { }

  componentWillReact () {
    console.log('componentWillReact')
  }

  componentDidMount () {
    const query = Taro.createSelectorQuery()
    query.selectViewport().boundingClientRect()
    query.exec((res) => {
      this.setState({
        viewHeight: res[0].height-44
      })
    })
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  onClickBtn = () => {
    this.setState({
      tabIndex: this.state.tabIndex+2
    })
  }

  onTabChange = (e) => {
    console.log(e.currentIndex)
    this.setState({
      cIndex: e.currentIndex,
    })
  }

  onScrollToUpper = (e) => {
    console.log(e)
    this.setState({
      scrollTop: 0,
    })
  }

  debounce(fn, interval) {
    let timeout = null;     // timeout占位
    return function () {    // 返回闭包函数 timeout保留作用域
      clearTimeout(timeout);  // 先清除上一个timeout
      timeout = setTimeout(() => {    //重新给timeout赋值，interval时间之后执行cb
        fn.apply(this, arguments);
      }, interval);
    };
  }

  onScroll = (e) => {
    // console.log(e.detail.scrollTop)
    this.setState({
      scrollTop: e.detail.scrollTop,
    }, () => {
      this.debounce(() => {
        const query = Taro.createSelectorQuery()
        const queryArr = [...Array(30).keys()].map((item, index) => {
          return ('#item'+index)
        })
        queryArr.forEach((item) => {
          query.select(item).boundingClientRect()
        })
        query.exec((res) => {
          for (var item of res) {
            if (item.top <= 44 && item.bottom > 44) {
              const itemId = item.id
              const tabIndex = itemId.split('item')[1]
              this.setState({
                tabIndex: tabIndex
              })
              break
            }
          }
        })
      }, 350)()
    })
    
  }

  render () {
    const titlList = [...Array(30).keys()]
    const list = [...Array(30).keys()].map((item, index) => {
      return <View className={styles.item} id={'item'+index}>{item}</View>
    })

    let topY = this.state.scrollTop
    topY = Math.max(topY, 0)
    topY = Math.min(topY, 40)
    topY = -topY+'px'

    return (
      <View className={styles.index}>
        <ScrollView scrollY className={styles.list} 
        scrollIntoView={'item'+this.state.cIndex}
        // scrollTop = {this.state.cIndex*10}
        onScroll={this.onScroll.bind(this)}
        onScrollToUpper={this.onScrollToUpper.bind(this)}
        upperThreshold={2}
        scrollWithAnimation
        style={{
          height:this.state.viewHeight+'px'
        }}
        >
          <View className={styles.top} ></View>
          {list}
        </ScrollView>
        <View className={styles.top} style={{marginTop:topY}}>
          <Button className={styles.btn} onClick={this.onClickBtn.bind(this)} 
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
