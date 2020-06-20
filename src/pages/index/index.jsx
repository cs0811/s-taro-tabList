import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import './index.less'
import HLJTab from '../Tab/index.js'


@inject('counterStore')
@observer
class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }

  state = {
    tabIndex: 1,
  }

  componentWillMount () { }

  componentWillReact () {
    console.log('componentWillReact')
  }

  componentDidMount () { }

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
  }

  render () {
    const list = [...Array(20).keys()]
    return (
      <View className='index'>
        <HLJTab itemList={list} currentIndex={this.state.tabIndex} onChange={this.onTabChange.bind(this)}></HLJTab>
        <Button onClick={this.onClickBtn.bind(this)} >netTab</Button>
      </View>
    )
  }
}

export default Index 
