import React, {Fragment} from 'react'
import {
  AppRegistry,
  asset,
  StyleSheet,
  Environment,
  Prefetch,
  View,
  Image,
  NativeModules,
  Text,
  VrButton,
} from 'react-360'
import GameTile from './GameTile'
import {Query} from 'react-apollo'
import {gql} from 'apollo-boost'
const {GameModule} = NativeModules

const GET_GAMES = gql`
  query getGames {
    games {
      id
      name: gameName
      thumb
      panorama
    }
  }
`

export default class GameGallery extends React.Component {
  state = {
    activeGame: '',
  }

  changeBackground(panorama, name) {
    Environment.setBackgroundImage(asset(panorama))
  }

  renderGameList() {
    return (
      <Query query={GET_GAMES}>
        {({loading, error, data}) => {
          if (loading) {
            return (
              <View>
                <Text>Loading...</Text>
              </View>
            )
          }
          if (error) {
            return (
              <View>
                <Text>{JSON.stringify(error)}</Text>
              </View>
            )
          }
          return data.games.map((game) => {
            return (
              <Fragment key={game.id}>
                <Prefetch source={asset(game.panorama)} />
                <VrButton
                  onEnter={() => this.setState({activeGame: game.id})}
                  onExit={() => this.setState({activeGame: ''})}
                  onClick={() => {
                    this.changeBackground(game.panorama, game.thumb)
                  }}
                >
                  <GameTile
                    image={game.thumb}
                    isActive={game.id === this.state.activeGame}
                  />
                </VrButton>
              </Fragment>
            )
          })
        }}
      </Query>
    )
  }

  render() {
    const {gameGalleryContainer} = styles
    return <View style={gameGalleryContainer}>{this.renderGameList()}</View>
  }
}

const styles = StyleSheet.create({
  gameGalleryContainer: {
    height: 600,
    width: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
})
