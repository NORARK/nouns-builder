import { Box, Flex, Text } from '@zoralabs/zord'
import Link from 'next/link'
import React from 'react'

import { MadeWithZoraFooter } from './MadeWithZoraFooter'
import { footerContent, footerLink, footerWrapper } from './Nav.styles.css'

export const Footer = () => {
  return (
    <Box w="100%" as="footer" className={footerWrapper}>
      <Box className={footerContent} w="100%" m="auto">
        <Box
          m="auto"
          p={{ '@initial': 'x4', '@768': 'x8' }}
          textAlign={{ '@initial': 'center', '@768': 'left' }}
        >
          <Box>
            <Flex
              align="center"
              justify={{
                '@initial': 'center',
                '@1024': 'space-between',
              }}
              direction={{ '@initial': 'column', '@768': 'row' }}
            >
              <Text
                variant="paragraph-sm"
                color="tertiary"
                as="a"
                href="https://docs.zora.co/docs/smart-contracts/nouns-builder/intro"
                rel="noopener noreferrer"
                target="_blank"
                mr={{ '@initial': 'x0', '@768': 'x4' }}
                className={footerLink}
              >
                Documentation
              </Text>

              <Flex align="center" direction={{ '@initial': 'column', '@768': 'row' }}>
                <Text
                  variant="paragraph-sm"
                  color="tertiary"
                  as="a"
                  href="https://support.zora.co/en/articles/6383373-zora-privacy-policy"
                  rel="noopener noreferrer"
                  target="_blank"
                  mr={{ '@initial': 'x0', '@768': 'x4', '@1024': 'x6' }}
                  mt={{ '@initial': 'x4', '@768': 'x0' }}
                  className={footerLink}
                >
                  Privacy policy
                </Text>

                <Link href="/legal" passHref legacyBehavior>
                  <Text
                    variant="paragraph-sm"
                    color="tertiary"
                    as="a"
                    mt={{ '@initial': 'x4', '@768': 'x0' }}
                    className={footerLink}
                  >
                    Terms of service
                  </Text>
                </Link>
              </Flex>
            </Flex>
          </Box>

          <MadeWithZoraFooter backgroundColor="background1" color="text3" mb={'x0'} />
        </Box>
      </Box>
    </Box>
  )
}
