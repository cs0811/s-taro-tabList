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
    })()
    this.onItemClick(this.props.currentIndex, false, true)
  }

  componentWillReceiveProps (nextProps) {
    // if (nextProps.currentIndex != this.props.currentIndex) {
      this.onItemClick(nextProps.currentIndex, true, false)
    // }
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  onScroll = (e) => {
    this.cScrollLeft = e.detail.scrollLeft
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

  queryItemInfoWithId = (id, fn) => {
    const query = Taro.createSelectorQuery().in(this.$scope)
    return function() {
      query.select(id).boundingClientRect()
      query.exec((res) => {
        fn.apply(this, res);
      })
    }
  }

  onItemClick = (index, isAnimation, canCallOut) => {
    if (this.state.cIndex === index || this.isAnimaiton) {
      return
    }
    if (canCallOut) {
      this.props.onChange({currentIndex:index})
    }
    this.queryItemInfoWithId('#item'+index, (res) => {
      const cItemInfo = res
      let centerX = (cItemInfo.left + cItemInfo.right)/2.
      if (centerX != this.tabInfo.width/2.) {
        let animation = Taro.createAnimation({
          duration: isAnimation?200:0,
          timingFunction: 'ease-in-out',
        })
        animation.translateX(this.cScrollLeft+centerX-6).step()
        this.isAnimaiton = true
        this.setState({
          cIndex: index,
          animationData: animation.step(),
        }, () => {
          this.debounce(() => {
            this.setState({
              cCenter: this.cScrollLeft+centerX-this.tabInfo.width/2.,
            }, () => {
              this.debounce(() => {
                this.isAnimaiton = false
              },300)()
            })
          },300)()
        })
        
      } else {
        this.setState({
          cIndex: index,
        })
      }
    })()

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
            onClick={this.onItemClick.bind(this, index, true, true)}
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