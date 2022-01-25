import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button, Flex, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/utils'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/urqlClient'

interface LoginProps {

}


const Login: React.FC<LoginProps> = ({ }) => {

  const [, login] = useLoginMutation()
  const router = useRouter();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values)
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            router.push('/')
          }

        }}
      >
        {
          ({ isSubmitting }) => (
            <Form>
              <InputField name='usernameOrEmail' placeholder='username or email' label='Username Or Email:' />
              <Box mt={4}>
                <InputField name='password' placeholder='password' label='Password:' />
              </Box>
              <Flex justifyContent='space-between' alignItems='baseline'>
                <Button mt={4} type='submit' isLoading={isSubmitting} color='white' background='teal'>
                  Login
                </Button>
                <NextLink href='/forgot-password'>
                  <Link>forgot password?</Link>
                </NextLink>
              </Flex>
            </Form>
          )
        }
      </Formik>
    </Wrapper>

  );
}


export default withUrqlClient(createUrqlClient)(Login)
