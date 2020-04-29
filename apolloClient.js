import React from 'react'
import {ApolloClient} from 'apollo-client'
import {ApolloProvider} from 'react-apollo'
import {InMemoryCache} from 'apollo-cache-inmemory'
import {split} from 'apollo-link'
import {HttpLink} from 'apollo-link-http'
import {WebSocketLink} from 'apollo-link-ws'
import {getMainDefinition} from 'apollo-utilities'

// Create an http link:
const httpLink = new HttpLink({
  uri: 'https://hasura-vr-game.herokuapp.com/v1/graphql',
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `wss://hasura-vr-game.herokuapp.com/v1/graphql`,
  options: {
    reconnect: true,
  },
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({query}) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink,
)

const cache = new InMemoryCache()
export const client = new ApolloClient({
  // Provide required constructor fields
  cache: cache,
  link,
})

export const AppoloWrapper = ({children}) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
)
