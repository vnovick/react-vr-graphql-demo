import React from 'react'
import {
  AppRegistry,
  VrButton,
  Animated,
  asset,
  StyleSheet,
  Image,
  View,
  NativeModules,
  Text,
} from 'react-360'
import Easing from 'Easing'
import {gql} from 'apollo-boost'
import {Subscription} from 'react-apollo'
const {GameModule} = NativeModules

const GET_MESSAGES = gql`
  subscription getMessagesForTheGame($gameId: uuid) {
    messages(where: {game_id: {_eq: $gameId}}, order_by: {timestamp: asc}) {
      id
      message
      user_id
      user {
        id
        name
        avatarUrl
      }
    }
  }
`

export default class VRChatPanel extends React.Component {
  constructor() {
    super()
    this.scrollingValue = new Animated.Value(0)
    this.state.gameId = GameModule.gameState.currentGameId
  }

  state = {
    gameId: 0,
  }

  scrollOffset = 0

  scroll(value, direction) {
    const toValue = value + 5 * direction
    Animated.timing(this.scrollingValue, {
      toValue,
      duration: 40,
      easing: Easing.linear,
    }).start(() => {
      if (this.isScrolling) {
        this.scroll(toValue, direction)
      }
    })
  }

  onEnter(direction) {
    this.isScrolling = true
    this.scroll(this.scrollOffset, direction)
  }

  onExit() {
    console.log('Exit')
    this.isScrolling = false
    this.scrollOffset = this.scrollingValue._value
  }

  render() {
    return (
      <View style={styles.container}>
        <VrButton
          onEnter={() => this.onEnter(-1)}
          onExit={() => this.onExit()}
          style={{height: 50, width: '100%', backgroundColor: '#313'}}
        >
          <Text>^</Text>
        </VrButton>
        <View style={styles.chat}>
          <Subscription
            subscription={GET_MESSAGES}
            variables={{gameId: this.state.gameId}}
          >
            {({loading, data, error}) => {
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
              return (
                <Animated.View
                  style={{
                    transform: [{translateY: this.scrollingValue}],
                    overflow: 'hidden',
                  }}
                >
                  {data.messages.map(({id, user, message}, index) => (
                    <View key={id} style={styles.msgContainer}>
                      {user.id !== GameModule.gameState.userId && (
                        <Image
                          source={{uri: user.avatarUrl}}
                          style={styles.avatar}
                        />
                      )}
                      <View
                        style={[
                          styles.message,
                          user.id !== GameModule.gameState.userId
                            ? styles.incoming
                            : null,
                        ]}
                      >
                        <Text
                          style={
                            user.id !== GameModule.gameState.userId
                              ? styles.msgTextIncoming
                              : styles.msgText
                          }
                        >
                          {message}
                        </Text>
                      </View>
                    </View>
                  ))}
                </Animated.View>
              )
            }}
          </Subscription>
        </View>
        <VrButton
          onEnter={() => this.onEnter(1)}
          onExit={() => this.onExit()}
          style={{height: 30, width: '100%', backgroundColor: '#313'}}
        >
          <Text>V</Text>
        </VrButton>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  msgContainer: {
    flexDirection: 'row',
    margin: 5,
  },
  chat: {
    flex: 1,
    height: 520,
  },
  avatar: {
    height: 30,
    width: 30,
    marginRight: 5,
    borderRadius: 25,
    alignSelf: 'flex-end',
  },
  message: {
    width: 200,
    borderRadius: 5,
    marginLeft: 100,
    backgroundColor: 'blue',
    padding: 5,
  },
  incoming: {
    marginLeft: 0,
    backgroundColor: '#FFF',
  },
  msgText: {
    color: '#FFF',
  },
  msgTextIncoming: {
    color: 'black',
  },
})
