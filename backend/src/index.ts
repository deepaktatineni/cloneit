import 'reflect-metadata';
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'

import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'

import { COOKIE_NAME, __prod__ } from './constants'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import ormConfig from './mikro-orm.config'
import { UserResolver } from './resolvers/user'

const CORS_CONFIG = { origin: ['http://localhost:3000', 'https://studio.apollographql.com/'], credentials: true }

const main = async () => {

  const orm = await MikroORM.init(ormConfig)
  runMigrationsIfAny(orm)
  const app = express()

  const RedisStore = connectRedis(session)
  const redisClient = new Redis()

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
        domain: __prod__ ? '' : undefined
      },
      resave: false,
      saveUninitialized: false,
      secret: 'aZccG1iIfvIS6TRSti2C',
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res, redis: redisClient })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ app, cors:  CORS_CONFIG})
  await new Promise<void>(resolve => app.listen({ port: 4000 }, resolve))
  console.log(`🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`);

}

try {
  main()
} catch (e) {
  console.log(e)
}

const runMigrationsIfAny = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {

  const migrator = await orm.getMigrator()
  const migrationsToBeRun = await migrator.getPendingMigrations()

  if (migrationsToBeRun.length === 0) {
    return
  }

  migrationsToBeRun
    .map(m => m.file)
    .forEach(f => {
      migrator.up(f)
    })
}
