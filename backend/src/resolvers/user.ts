import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql"
import { User } from "../entities/User"
import { MyContext } from "../types"
import argon2 from 'argon2'
import { COOKIE_NAME, REDIS_FORGOTPWD_PREFIX } from "../constants"
import { findUserBy } from "../utils/userFilter"
import { UserCredentials } from "./types/UserCredentials"
import { validateRegister } from "../validation/user/register"
import { UserResponse } from "./types/UserResponse"
import { sendEmail } from "../integration/mailer"
import { v4 } from 'uuid'

@Resolver()
export class UserResolver {

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, em, req }: MyContext
  ) {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 3"
          }
        ]
      }
    }
    const lookupKey = REDIS_FORGOTPWD_PREFIX + token
    const userId = await redis.get(lookupKey)

    if(!userId) {
      return  {
        errors: [
          {
            field: "token",
            message: "Bad token or token has expired"
          }
        ]
      }
    }

    const user = await em.findOne(User, {id: parseInt(userId) })

    if(!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists"
          }
        ]
      }
    }

    user.password = await argon2.hash(newPassword)
    await em.persistAndFlush(user)

    // invalidate token
    redis.del(lookupKey)

    // log in user automatically after password change
    req.session.userId = user.id

    return { user }

  }

  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { em, req }: MyContext
  ): Promise<User | null> {

    if (!req.session.userId) {
      return null
    }
    const user = await em.findOne(User, { id: req.session.userId })
    return user
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserCredentials,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {

    const errors = validateRegister(options)

    if (errors.length) {
      return {
        errors
      }
    }


    const user = em.create(User, {
      username: options.username,
      email: options.email,
      password: await argon2.hash(options.password)
    })

    try {
      await em.persistAndFlush(user)
    } catch (e) {
      if (e.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already exists"
            }
          ]
        }
      }
    }

    req.session.userId = user.id

    return {
      user
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, findUserBy(usernameOrEmail))
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "User not found"
          }
        ]
      }
    }

    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password"
          }
        ]
      }
    }

    req.session.userId = user.id

    return {
      user
    }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    console.log(email)
    const user = await em.findOne(User, { email })
    if (!user) {
      return false
    }
    const token = v4()
    redis.set(
      REDIS_FORGOTPWD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 15 // 15 minutes
    )
    const body = `<a href='http://localhost:3000/change-password/${token}'>reset password</a>`
    await sendEmail(email, body)
    return true
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ) {
    return new Promise(resolve =>
      req.session.destroy(err => {
        res.clearCookie(COOKIE_NAME)
        if (err) {
          console.log(err)
          resolve(false)
          return
        }
        resolve(true)
      })
    )
  }
}
