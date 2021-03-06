import { Arg, Int, Mutation, Query, Resolver } from "type-graphql"
import { Post } from "../entities/Post"

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find()
  }

  @Query(() => Post)
  post(
    @Arg('id', () => Int) id: number,
  ): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string
  ): Promise<Post> {
    return Post.create({ title }).save()
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne( id)

    if (!post) {
      return null
    }

    if (title != undefined) {
      Post.update({ id }, { title })
    }
    return post
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number
  ): Promise<boolean> {
    try {
      await Post.delete(id)
    } catch {
      return false
    }
    return true
  }
}
