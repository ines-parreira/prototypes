import { useState } from 'react'

import { Box, Button, Card, Heading, Tag, TagColor, Text } from '@gorgias/axiom'

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
                />
            </Box>
            <Box gap="80px" justifyContent="space-between">
                <Box flexDirection="column" gap="xs" maxWidth={728}>
                    <Box>
                        <Tag color={TagColor.Purple}>New</Tag>
                    </Box>
                    <Heading size="xl">
                        Introducing skills: the source of truth for your most
                        common conversations
                    </Heading>
                    <Text>
                        Skills give you control over how AI Agent handles each
                        conversation type. When AI Agent detects a conversation
                        intent, it follows the matching skill instructions.
                        Knowledge complements skills for questions they
                        don&apos;t cover.
                    </Text>
                </Box>
                <Box
                    width={288}
                    height={162}
                    flexShrink={0}
                    className={css.placeholder}
                />
            </Box>
        </Card>
    )
}
