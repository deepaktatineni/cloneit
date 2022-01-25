export const findUserBy = (userNameOrEmail: string) => userNameOrEmail.includes('@') ? { email: userNameOrEmail } : { username: userNameOrEmail }
