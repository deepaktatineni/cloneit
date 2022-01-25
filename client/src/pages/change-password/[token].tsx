import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import NextLink  from 'next/link'
import { useState } from 'react'
import { InputField } from '../../components/InputField'
import { Wrapper } from '../../components/Wrapper'
import { useChangePasswordMutation } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/urqlClient'
import { toErrorMap } from '../../utils/utils'


interface ChangePasswordProps {

}

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {

  const router = useRouter()
  const [, changePassword] = useChangePasswordMutation()

  const [tokenError, setTokenError] = useState('')

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token
          })

          if (response.data?.changePassword.errors) {
            const mappedErrors = toErrorMap(response.data.changePassword.errors)
            if ('token' in mappedErrors) {
              setTokenError(mappedErrors.token)
            }
            setErrors(mappedErrors)
          } else if (response.data.changePassword.user) {
            router.push('/')
          }
        }}
      >
        {
          ({ isSubmitting }) => (
            <Form>
              <InputField name='newPassword' placeholder='password' label='Password:' />
              {tokenError && (
                <Flex>
                  <Box color='amber'>
                    {tokenError}
                  </Box>
                  <NextLink href='/forgot-password'>
                    <Link>click here to get request again?</Link>
                  </NextLink>
                </Flex>
              )}
              <Button mt={4} type='submit' isLoading={isSubmitting} color='white' background='teal'>
                Reset password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
}


ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string
  }
}

export default withUrqlClient(createUrqlClient)(ChangePassword)
