import Taro, { Component } from '@tarojs/taro'
import { View, Text , ScrollView} from '@tarojs/components'
import { observer } from '@tarojs/mobx'
import styles from './style.module.less'

@observer
class HLJSlideTab extends Component {
  timeout = null
  tabInfo = {}
  isLoadFirst = false
  cIndex = 0
  itemsInfoArr = []
  isClick = false
  edgeSpace = 4

  static defaultProps = {
    itemList: [],
    currentIndex: 0,
    onChange: (e) => {}, // 主动点击tab之后返回信息
    bindInfo: (e) => {}, // 创建时返回changeTab方法
  }

  state = {
    cCenter: 0,
    animationData: {},
  }

  componentWillMount () { }

  componentWillReact () { }

  componentDidMount () {
    this.props.bindInfo({changeTab:this.changeTab})
    this.queryItemInfoWithId('#tab', (res) => {
      this.tabInfo = res
    })
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.itemList.length > 0 && this.itemsInfoArr.length <= 0) {
      this.debounce( () => {
        this.queryAllItemsInfo(() => {
          this.onItemClick(nextProps.currentIndex, true, false, false)
        })
      }, 50)
    }
    // if (nextProps.currentIndex != this.props.currentIndex) {
      this.onItemClick(nextProps.currentIndex, true, false, false)
    // }
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
    this.timeout = null
  }

  componentDidShow () { }

  componentDidHide () { }

  changeTab = (index) => {
    this.onItemClick(index, true, false, false)
  }

  queryItemInfoWithId = (id, fn) => {
    const query = Taro.createSelectorQuery().in(this.$scope)
    query.select(id).boundingClientRect()
    query.exec((res) => {
      fn.apply(this, res);
    })
  }

  queryAllItemsInfo = (fn) => {
    const query = Taro.createSelectorQuery().in(this.$scope)
    const {itemList} = this.props;
    const queryitemsInfoArr = itemList.map((item, index) => {
      return '#item' + index
    })
    queryitemsInfoArr.forEach((item) => {
      query.select(item).boundingClientRect()
    })
    query.exec((res) => {
      if (res.length <= 0) {
        return
      }
      if (res[0] && res[0].left != this.edgeSpace) {
        return
      }
      for (var item of res) {
        if (item) {
          this.itemsInfoArr.push({left:item.left, right:item.right})
        }
      }
      fn.apply(this, res);
    })
  }

  debounce(fn, interval) {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.timeout = null
      fn.apply(this, arguments)
    }, interval)
  }

  onItemClick = (index, isAnimation, canCallOut, isClick) => {
    if (this.itemsInfoArr.length <= 0) {
      return
    }
    if (this.cIndex == index && this.isLoadFirst) {
      return
    }
    if (isClick) {
      // 点击间隔
      this.isClick = true
      setTimeout(() => {
        this.isClick = false
        this.setState({})
      }, 150);
    }
    if (canCallOut) {
      this.props.onChange({currentIndex:index})
    }
    const cItemInfo = this.itemsInfoArr[index]
    this.cIndex = index
    this.isLoadFirst = true
    let centerX = (cItemInfo.left + cItemInfo.right)/2.
    let animation = Taro.createAnimation({
      duration: (isAnimation && centerX != this.tabInfo.width/2.)?250:0,
      timingFunction: 'ease-in-out',
    })
    animation.translateX(centerX-9).step()
    this.setState({
      animationData: animation.export(),
      cCenter: centerX-this.tabInfo.width/2.,
    })
  }

  render () {
    const {itemList} = this.props;
    const tabList = itemList.map((title, index) => {
        let itemStyle = {}
        if (index == 0) {
          itemStyle = {
            marginLeft: this.edgeSpace+'px'
          }
        } else if (index == itemList.length-1) {
          itemStyle = {
            marginRight: this.edgeSpace+'px'
          }
        }

        return (
            <View key={'item'+index}
            className={styles.item} 
            style={itemStyle} 
            onClick={this.isClick?null:this.onItemClick.bind(this, index, true, true, true)}
            id={'item'+index}
            >
              <View 
              className={this.cIndex == index ? styles.title_select : styles.title_normal}
              >
                <Text>{title}</Text>
              </View>
            </View>
        )
    })

    return (
      <View className={styles.tab} id='tab'>
        <ScrollView 
          className={styles.scroll} 
          scrollLeft={this.state.cCenter}
          scrollX 
          scrollWithAnimation 
          id='list'
          > 
          {tabList}
          <View className={styles.bottom_line} 
          animation={this.state.animationData}
          style={{opacity:this.isLoadFirst?1:0}}
          ></View>
        </ScrollView>
      </View>
    )
  }
}

export default HLJSlideTab