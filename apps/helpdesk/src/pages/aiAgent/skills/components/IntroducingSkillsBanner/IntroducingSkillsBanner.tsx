import { useState } from 'react'

import { Box, Button, Card, Heading, Tag, TagColor, Text } from '@gorgias/axiom'

import { SkillsVideo } from '../SkillsVideo/SkillsVideo'

import css from './IntroducingSkillsBanner.less'

const getDismissedKey = (shopName: string) =>
    `introducing-skills-banner-dismissed-${shopName}`

type Props = {
    shopName: string
}

export const IntroducingSkillsBanner: React.FC<Props> = ({ shopName }) => {
    const [isDismissed, setIsDismissed] = useState(
        () => localStorage.getItem(getDismissedKey(shopName)) === 'true',
    )

    const handleOnClose = () => {
        localStorage.setItem(getDismissedKey(shopName), 'true')
        setIsDismissed(true)
    }

    if (isDismissed) return null

    return (
        <Card
            width="100%"
            display="flex"
            flexDirection="column"
            padding="lg"
            gap="0px"
            className={css.banner}
        >
            <Box justifyContent="flex-end" marginBottom="sm">
                <Button
                    onClick={handleOnClose}
                    variant="tertiary"
                    size="sm"
                    icon="close"
                    aria-label="Dismiss"
                />
            </Box>
            <Box gap="80px" justifyContent="space-between">
                <Box flexDirection="column" gap="xs" maxWidth={728}>
                    <Box>
                        <Tag color={TagColor.Purple}>New</Tag>
                    </Box>
                    <Heading size="xl">
                        Introducing Skills - precise control over your most
                        common conversations
                    </Heading>
                    <Text>
                        Skills give you control over how AI Agent handles each
                        type of conversation. When it detects what a customer
                        wants, it follows your matching skill. Knowledge fills
                        in the rest, answering anything your skills don&apos;t
                        cover.
                    </Text>
                </Box>
                <SkillsVideo />
            </Box>
        </Card>
    )
}
