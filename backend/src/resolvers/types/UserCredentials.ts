import { Field, InputType } from "type-graphql";


@InputType()
export class UserCredentials {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
