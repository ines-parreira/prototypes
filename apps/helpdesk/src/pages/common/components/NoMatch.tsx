import { Box, Button, Heading, Icon, Text } from '@gorgias/axiom'

import { assetsUrl } from 'utils'

import css from './NoMatch.less'

export default function NoMatch() {
    return (
        <Box
            as="main"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="md"
            p="lg"
            className={css.container}
        >
            <img
                className={css.image}
                src={assetsUrl('/img/404-error-image.svg')}
                alt="Illustration of a hand holding binoculars shaped like the number 404, indicating a 'Page not found' error."
            />
            <Heading size="xl">Page not found</Heading>
            <Box flexDirection="column" alignItems="center" gap="xxs">
                <Text as="p" align="center">
                    The page you’re looking for couldn’t be found.
                </Text>
                <Text as="p" align="center">
                    Double check the URL, go back, or try refreshing the page.
                </Text>
            </Box>
            <Button
                as="a"
                href="/app/views"
                leadingSlot={<Icon name="inbox" />}
            >
                Go to inbox
            </Button>
            <Text as="p" align="center" size="sm">
                If you think this is a mistake,{' '}
                <a
                    href="https://docs.gorgias.com/en-US/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    contact Support
                </a>
            </Text>
        </Box>
    )
}
