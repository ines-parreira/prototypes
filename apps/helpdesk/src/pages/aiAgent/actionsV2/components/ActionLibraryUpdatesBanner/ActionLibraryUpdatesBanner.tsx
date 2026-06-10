import { useHistory } from 'react-router-dom'

import { useDismissFlag } from '@gorgias/toolkit-react'

import {
    Box,
    Button,
    Card,
    Heading,
    Link,
    Tag,
    TagColor,
    Text,
} from '@gorgias/axiom'

import { ACTION_LIBRARY_LEARNING_RESOURCES_URL } from '../../constants'

import css from './ActionLibraryUpdatesBanner.less'

const APP_STORE_URL = '/app/settings/integrations'

const getDismissedKey = (shopName: string) =>
    `action-library-updates-banner-dismissed-${shopName}`

type Props = {
    shopName: string
}

const ActionLibraryUpdatesBanner = ({ shopName }: Props) => {
    const history = useHistory()
    const { isDismissed, dismiss } = useDismissFlag(
        getDismissedKey(shopName),
        true,
    )

    if (isDismissed) return null

    return (
        <Card
            width="100%"
            display="flex"
            flexDirection="column"
            padding="lg"
            gap="md"
            className={css.banner}
        >
            <Box className={css.closeButton}>
                <Button
                    onClick={dismiss}
                    variant="tertiary"
                    size="sm"
                    icon="close"
                    aria-label="Dismiss banner"
                />
            </Box>
            <Box flexDirection="column" gap="xs">
                <Box>
                    <Tag color={TagColor.Purple}>New</Tag>
                </Box>
                <Heading size="xl">Updates to how actions work</Heading>
                <Text>
                    Actions now appear here automatically – from apps
                    you&rsquo;ve already connected, and from new apps you
                    install from{' '}
                    <Link onClick={() => history.push(APP_STORE_URL)}>
                        App Store
                    </Link>
                    .
                </Text>
                <ul className={css.bulletList}>
                    <li>
                        <Text as="span" variant="bold">
                            Actions you&rsquo;ve created
                        </Text>{' '}
                        continue working exactly as they did. AI Agent run these
                        autonomously, and you can also reference them in a skill
                        or guidance.
                    </li>
                    <li>
                        <Text as="span" variant="bold">
                            Actions from connected apps
                        </Text>{' '}
                        will not run on their own. They&rsquo;ll only become
                        active once you reference them inside a skill or
                        guidance.
                    </li>
                </ul>
            </Box>
            <Box>
                <Button
                    variant="secondary"
                    size="md"
                    as="a"
                    href={ACTION_LIBRARY_LEARNING_RESOURCES_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    Learn more
                </Button>
            </Box>
        </Card>
    )
}

export default ActionLibraryUpdatesBanner
