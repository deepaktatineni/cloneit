import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button } from '@chakra-ui/react'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/utils'
import { useRouter } from 'next/router'
import { createUrqlClient } from '../utils/urqlClient'
import { withUrqlClient } from 'next-urql'

interface RegisterProps {

}


const Register: React.FC<RegisterProps> = ({ }) => {

  const [, register] = useRegisterMutation()
  const router = useRouter();
  
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values })
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors))
          } else if(response.data?.register.user) {
            router.push('/')
          }

        }}
      >
        {
          ({ isSubmitting }) => (
            <Form>
              <InputField name='username' placeholder='username' label='Username:' />
              <Box mt={4}>
                <InputField name='email' placeholder='something@example.com' label='Email:' />
              </Box>
              <Box mt={4}>
                <InputField name='password' placeholder='password' label='Password:' />
              </Box>
              <Button mt={4} type='submit' isLoading={isSubmitting} color='white' background='teal'>
                Register
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>

  );
}


export default withUrqlClient(createUrqlClient)(Register)
