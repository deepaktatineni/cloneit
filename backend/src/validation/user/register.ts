import { FieldError } from '../../resolvers/types/FieldError'
import { UserCredentials } from '../../resolvers/types/UserCredentials'

export const validateRegister = (options: UserCredentials): FieldError[] => {

  if (options.username.length <= 2) {
    return [
        {
          field: "username",
          message: "length must be greater than 2"
        }
      ]
    
  }

  if (options.password.length <= 3) {
    return  [
        {
          field: "password",
          message: "length must be greater than 3"
        }
      ]
    
  }

  if (!options.email.includes('@')) {
    return [
        {
          field: "email",
          message: "invalid email"
        }
      ]
    
  }

  if (options.username.includes('@')) {
    return  [
        {
          field: "username",
          message: "invalid username. cant include `@`"
        }
      ]
    
  }

  return []

}
