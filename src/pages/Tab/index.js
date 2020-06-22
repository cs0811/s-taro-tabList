import Taro, { Component } from '@tarojs/taro'
import { View, Text , ScrollView} from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import styles from './style.module.less'

@inject('counterStore')
@observer
class HLJTab extends Component {
  cScrollLeft = 0.
  tabInfo = {}
  isAnimaiton = false
  timeout = null

  static defaultProps = {
    itemList: [],
    currentIndex: 0,
    onChange: (e) => {},
  }

  state = {
    cIndex: 0,
    cCenter: 0,
    animationData: {},
  }

  componentWillMount () { 
  }

  componentWillReact () { }

  componentDidMount () {
    this.queryItemInfoWithId('#tab', (res) => {
      this.tabInfo = res
    })
    this.onItemClick(this.props.currentIndex, false, false, true)
  }

  componentWillReceiveProps (nextProps) {
    // if (nextProps.currentIndex != this.props.currentIndex) {
      this.onItemClick(nextProps.currentIndex, true, false, false)
    // }
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  componentDidShow () { }

  componentDidHide () { }

  onScroll = (e) => {
    // this.cScrollLeft = e.detail.scrollLeft
  }

  debounce(fn, interval) {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.timeout = null
      fn.apply(this, arguments)
    }, interval);
  }

  queryItemInfoWithId = (id, fn) => {
    const query = Taro.createSelectorQuery().in(this.$scope)
    query.select(id).boundingClientRect()
    query.select('#list').scrollOffset()
    query.exec((res) => {
      fn.apply(this, res);
    })
  }

  onItemClick = (index, isAnimation, canCallOut, forceLoad) => {
    this.debounce(() => {
      if (this.state.cIndex == index && !forceLoad) {
        return
      }
      this.isAnimaiton = true
      if (canCallOut) {
        this.props.onChange({currentIndex:index})
      }

      const query = Taro.createSelectorQuery().in(this.$scope)
      query.select('#item'+index).boundingClientRect()
      query.select('#list').scrollOffset()
      query.exec((res) => {
        const cItemInfo = res[0]
        this.cScrollLeft = res[1].scrollLeft
        let centerX = (cItemInfo.left + cItemInfo.right)/2.
        let animation = Taro.createAnimation({
          duration: (isAnimation && centerX != this.tabInfo.width/2.)?250:0,
          timingFunction: 'ease-in-out',
        })
        
        centerX = this.cScrollLeft+centerX
        animation.translateX(centerX-6).step()
        this.setState({
          cIndex: index,
          animationData: animation.export(),
          cCenter: centerX-this.tabInfo.width/2.,
        }, () => {
          this.debounce(() => {
            this.isAnimaiton = false
          },260)
        })
      })
    }, this.isAnimaiton?260:0)

  }

  render () {
    const {itemList} = this.props;
    const tabList = itemList.map((title, index) => {
        let itemStyle = {}
        if (index == 0) {
          itemStyle = {
            marginLeft: '4px'
          }
        } else if (index == itemList.length-1) {
          itemStyle = {
            marginRight: '4px'
          }
        }

        return (
            <View className={styles.item} style={itemStyle} 
            onClick={this.onItemClick.bind(this, index, true, true, false)}
            id={'item'+index}
            >
              <View 
              className={this.state.cIndex == index ? styles.title_select : styles.title_normal}
              >
                <Text>{title}</Text>
              </View>
            </View>
        )
    })

    return (
      <View className={styles.tab} id='tab'>
        <ScrollView className={styles.scroll} 
        scrollLeft={this.state.cCenter}
        // onScroll={this.onScroll.bind(this)}
        scrollX scrollWithAnimation id='list'> 
          {tabList}
          <View className={styles.bottom_line} 
          animation={this.state.animationData}
          ></View>
        </ScrollView>
      </View>
    )
  }
}

export default HLJTab 