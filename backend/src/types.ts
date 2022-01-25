import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
import { Request, Response } from 'express'
import Redis from 'ioredis'

export interface MyContext {
  em: EntityManager<IDatabaseDriver<Connection>>,
  req: Request & { session: Express.Session },
  res: Response
  redis: Redis.Redis
}
