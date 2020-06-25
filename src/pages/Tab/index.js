import Taro, { Component } from '@tarojs/taro'
import { View, Text , ScrollView} from '@tarojs/components'
import { observer } from '@tarojs/mobx'
import styles from './style.module.less'

@observer
class HLJTab extends Component {
  tabInfo = {}
  isLoadFirst = false
  cIndex = 0
  itemsInfoArr = []
  isClick = false

  static defaultProps = {
    itemList: [],
    currentIndex: 0,
    onChange: (e) => {},
    bindInfo: (e) => {},
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
    this.queryAllItemsInfo(() => {
    })
  }

  componentWillReceiveProps (nextProps) {
    // if (nextProps.currentIndex != this.props.currentIndex) {
      this.onItemClick(nextProps.currentIndex, true, false, false)
    // }
  }

  componentWillUnmount () { }

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
      for (var item of res) {
        this.itemsInfoArr.push({left:item.left, right:item.right})
      }
      fn.apply(this, res);
    })
  }

  onItemClick = (index, isAnimation, canCallOut, isClick) => {
    if (this.itemsInfoArr.length <= 0) {
      return
    }
    if (this.cIndex == index && this.isLoadFirst) {
      return
    }
    if (isClick) {
      this.isClick = true
      setTimeout(() => {
        this.isClick = false
        this.setState({})
      }, 250);
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
            marginLeft: '4px'
          }
        } else if (index == itemList.length-1) {
          itemStyle = {
            marginRight: '4px'
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

export default HLJTab 