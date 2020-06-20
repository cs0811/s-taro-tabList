import Taro, { Component } from '@tarojs/taro'
import { View, Text , ScrollView} from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import styles from './style.module.less'

@inject('counterStore')
@observer
class HLJTab extends Component {
  cScrollLeft = 0.

  static defaultProps = {
    itemList: [],
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
    this.onItemClick(0, false)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  onScroll = (e) => {
    this.cScrollLeft = e.detail.scrollLeft
  }

  onItemClick = (index, isAnimation) => {
    const query = Taro.createSelectorQuery().in(this.$scope)
    query.select('#item'+index).boundingClientRect()
    query.select('#tab').boundingClientRect()
    query.exec((res) => {
        console.log(res)
        const cItemInfo = res[0]
        let centerX = (cItemInfo.left + cItemInfo.right)/2.
        const tabInfo = res[1]
        if (centerX != tabInfo.width/2.) {
          let animation = Taro.createAnimation({
            duration: isAnimation?200:0,
            timingFunction: 'ease-in-out',
          })
          animation.translateX(this.cScrollLeft+centerX-6).step()
          this.setState({
            // cIndex: index,
            // cCenter: this.cScrollLeft+centerX-tabInfo.width/2.,
            animationData: animation.step()
          }, () => {
            setTimeout(() => {
              this.setState({
                cIndex: index,
                cCenter: this.cScrollLeft+centerX-tabInfo.width/2.,
              })
            },250)
          })
          
        } else {
          this.setState({
            cIndex: index,
          })
        }
    })

  }

  render () {
    const {itemList} = this.props;
    const tabList = itemList.map((title, index) => {
        let itemStyle = {}
        if (index === 0) {
          itemStyle = {
            marginLeft: '4px'
          }
        } else if (index === itemList.length-1) {
          itemStyle = {
            marginRight: '4px'
          }
        }
        return (
            <View className={styles.item} style={itemStyle} 
            onClick={this.onItemClick.bind(this, index, true)}
            id={'item'+index}
            >
              <View 
              className={this.state.cIndex === index ? styles.title_select : styles.title_normal}
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
        onScroll={this.onScroll.bind(this)}
        scrollX scrollWithAnimation > 
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