
import { Box } from '@chakra-ui/layout';
import React from 'react'

interface WrapperProps {
  variant: 'small' | 'regular'
}

export const Wrapper: React.FC<WrapperProps> = ({ variant = 'regular', children }) => {
  return (
    <Box mt={8} mx="auto" maxW={variant === 'regular' ? '800px' : '400px'}> {children} </Box>
  );
}
