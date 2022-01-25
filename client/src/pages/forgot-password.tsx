import { Box, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import React, { useState } from 'react'
import { useForgotPasswordMutation } from '../generated/graphql'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/urqlClient'


interface ForgotPasswordProps {

}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ }) => {

  const [complete, setComplete] = useState(false)

  const [, forgotPassword] = useForgotPasswordMutation()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          const response = await forgotPassword(values)
          console.log(response)
          setComplete(true)
        }}
      >
        {
          ({ isSubmitting }) => complete ? <Box>If an account with that email exists, we sent you an email</Box> : (
            <Form>
              <InputField name='email' placeholder='email' label='Email:' />
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


export default withUrqlClient(createUrqlClient)(ForgotPassword)
