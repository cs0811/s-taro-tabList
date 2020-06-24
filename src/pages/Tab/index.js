import Taro, { Component } from '@tarojs/taro'
import { View, Text , ScrollView} from '@tarojs/components'
import { observer } from '@tarojs/mobx'
import styles from './style.module.less'

@observer
class HLJTab extends Component {
  tabInfo = {}
  isLoadFirst = false
  cIndex = 0

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

  componentWillMount () { 
  }

  componentWillReact () { }

  componentDidMount () {
    this.props.bindInfo({changeTab:this.changeTab})
    this.queryItemInfoWithId('#tab', (res) => {
      this.tabInfo = res
    })
    this.onItemClick(this.props.currentIndex, false, false, true)
  }

  componentWillReceiveProps (nextProps) {
    // if (nextProps.currentIndex != this.props.currentIndex) {
      this.onItemClick(nextProps.currentIndex, true, false, true)
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
    query.select('#list').scrollOffset()
    query.exec((res) => {
      fn.apply(this, res);
    })
  }

  onItemClick = (index, isAnimation, canCallOut, forceLoad) => {
    if (this.cIndex == index && !forceLoad) {
      return
    }
    if (canCallOut) {
      this.props.onChange({currentIndex:index})
    }
    const query = Taro.createSelectorQuery().in(this.$scope)
    query.select('#item'+index).boundingClientRect()
    query.select('#list').scrollOffset()
    query.exec((res) => {
      const cItemInfo = res[0]
      if (!cItemInfo) {
        return
      }
      this.cIndex = index
      this.isLoadFirst = true
      const cScrollLeft = res[1].scrollLeft
      let centerX = (cItemInfo.left + cItemInfo.right)/2.
      let animation = Taro.createAnimation({
        duration: (isAnimation && centerX != this.tabInfo.width/2.)?250:0,
        timingFunction: 'ease-in-out',
      })
      
      centerX = cScrollLeft+centerX
      animation.translateX(centerX-9).step()
      this.setState({
        animationData: animation.export(),
        cCenter: centerX-this.tabInfo.width/2.,
      })
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
            onClick={this.onItemClick.bind(this, index, true, true, false)}
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