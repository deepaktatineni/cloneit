import { Box, Button, Flex, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

import React from 'react'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {

  const [{ data, fetching }] = useMeQuery()

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

  let body = null

  if (fetching) {

  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link>Register</Link>
        </NextLink>
      </>
    )
  } else {
    body = <Flex>
      <Box>{data.me.username}</Box>
      <Button
        ml={4}
        variant='link'
        isLoading={logoutFetching}
        onClick={() => logout()}
      >
        logout
      </Button>
    </Flex>
  }

  return (
    <Flex bg='tan' p={4}>
      <Box ml='auto'>
        {body}
      </Box>
    </Flex>
  )
}
