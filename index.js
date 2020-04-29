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
import GameTile from './components/GameTile'
import VRChatPanel from './components/VRChatPanel'
import GameGallery from './components/GameGallery'
import {Mutation} from 'react-apollo'
import {gql} from 'apollo-boost'
import {AppoloWrapper} from './apolloClient'
import {client} from './apolloClient'
const {GameModule} = NativeModules
const MAKE_A_MOVE = gql`
  mutation insertMove($userId: uuid, $gameId: uuid, $move: String) {
    insert_moves(objects: {user_id: $userId, game_id: $gameId, move: $move}) {
      affected_rows
    }
  }
`
const GAME_MOVES = gql`
  subscription getGameMoves($gameId: uuid, $userId: uuid) {
    users(where: {userGame: {game_id: {_eq: $gameId}}, id: {_eq: $userId}}) {
      userGame {
        game {
          moves(order_by: {timestamp: asc}) {
            user {
              id
              name
            }
            move
          }
        }
      }
    }
  }
`
export default class GameBoard extends React.Component {
  constructor() {
    super()
    this.state.matrix = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
  }
  state = {
    matrix: [],
  }

  updateMove(moves) {
    moves.map(({move, user}) => {
      const [row, column] = move.split(' ')
      if (this.state.matrix[row][column] === 0) {
        const matrix = this.state.matrix
        matrix[row][column] =
          user.id === GameModule.gameState.userId ? 'X' : 'O'
        this.setState({
          matrix,
        })
      }
    })
    console.log(this.state.matrix)
  }

  componentDidMount() {
    const updateMove = this.updateMove.bind(this)
    client
      .subscribe({
        query: GAME_MOVES,
        variables: {
          gameId: GameModule.gameState.currentGameId,
          userId: GameModule.gameState.userId,
        },
      })
      .subscribe({
        next({loading, data, error}) {
          if (data) {
            updateMove(data.users[0].userGame.game.moves)
          }
        },
        error(err) {
          console.error('err', err)
        },
      })
  }

  renderBoard() {
    return this.state.matrix.map((row, rowIndex) => (
      <View style={styles.row} key={rowIndex}>
        {row.map((sign, colIndex) => (
          <Mutation
            mutation={MAKE_A_MOVE}
            variables={{
              gameId: GameModule.gameState.currentGameId,
              userId: GameModule.gameState.userId,
              move: `${rowIndex} ${colIndex}`,
            }}
          >
            {(move, {data}) => {
              if (sign === 0) {
                return (
                  <VrButton
                    key={colIndex}
                    onClick={() => {
                      this.updateMove([
                        {
                          user: {id: GameModule.gameState.userId},
                          move: `${rowIndex} ${colIndex}`,
                        },
                      ])
                      move()
                    }}
                    style={styles.box}
                  >
                    <Text style={[styles.mark, styles.o]}></Text>
                  </VrButton>
                )
              }
              return (
                <View style={styles.box} key={colIndex}>
                  <Text
                    style={[styles.mark, sign === 'X' ? styles.x : styles.o]}
                  >
                    {sign}
                  </Text>
                </View>
              )
            }}
          </Mutation>
        ))}
      </View>
    ))
  }
  render() {
    const {boardContainer} = styles
    return <View style={boardContainer}>{this.renderBoard()}</View>
  }
}

const styles = StyleSheet.create({
  boardContainer: {
    height: 600,
    width: 800,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    fontSize: 50,
  },
  x: {
    color: 'red',
  },
  o: {
    color: 'black',
  },
  row: {
    margin: 10,
    flexDirection: 'row',
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: 100,
    margin: 20,
    backgroundColor: '#FFF',
  },
})

AppRegistry.registerComponent('GameBoard', () => () => (
  <AppoloWrapper>
    <GameBoard />
  </AppoloWrapper>
))
AppRegistry.registerComponent('GameTile', () => GameTile)
AppRegistry.registerComponent('VRChatPanel', () => () => (
  <AppoloWrapper>
    <VRChatPanel />
  </AppoloWrapper>
))
AppRegistry.registerComponent('GameGallery', () => () => (
  <AppoloWrapper>
    <GameGallery />
  </AppoloWrapper>
))
