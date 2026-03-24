const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway');


const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://localhost:3000/dev/graphql' },
    ],
  }),
});
const server = new ApolloServer({ gateway });

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`🚀  Evolus API Gateway ready at ${url}`);
  console.log(`   Subgraphs:`);
  console.log(`     • users  → http://localhost:3000/dev/graphql`);
});
