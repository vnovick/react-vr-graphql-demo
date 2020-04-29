import React from 'react'
import {AppRegistry, asset, StyleSheet, Image} from 'react-360'

export default class GameTile extends React.Component {
  render() {
    const {tile} = styles
    const {isActive, image} = this.props

    return (
      <Image
        style={[tile, isActive && styles.activeTile]}
        source={asset(image)}
      />
    )
  }
}

const styles = StyleSheet.create({
  tile: {
    height: 100,
    width: 120,
    marginRight: 20,
    opacity: 0.7,
  },
  activeTile: {
    opacity: 1,
  },
})
