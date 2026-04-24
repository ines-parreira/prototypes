import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { Box, Button, Card, Heading, Tag, TagColor, Text } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import css from './GoToSkillsBanner.less'

const getDismissedKey = (shopName: string) =>
    `go-to-skills-banner-dismissed-${shopName}`

const LEARNING_RESOURCES_URL = 'https://link.gorgias.com/bdb652'

type Props = {
    shopName: string
}

export const GoToSkillsBanner: React.FC<Props> = ({ shopName }) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const [isDismissed, setIsDismissed] = useState(
        () => localStorage.getItem(getDismissedKey(shopName)) === 'true',
    )

    const handleOnClose = () => {
        localStorage.setItem(getDismissedKey(shopName), 'true')
        setIsDismissed(true)
    }

    const handleGoToSkills = () => {
        history.push(routes.skills)
    }

    const handleLearnMore = () => {
        window.open(LEARNING_RESOURCES_URL, '_blank', 'noopener,noreferrer')
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
                <Box gap="lg" flexDirection="column">
                    <Box flexDirection="column" gap="xs">
                        <Box>
                            <Tag color={TagColor.Purple}>New</Tag>
                        </Box>
                        <Heading size="xl">
                            Take control of how AI Agent handles specific
                            conversations
                        </Heading>
                        <Text>
                            Skills let you write step-by-step instructions for
                            your most common request types — like order updates,
                            returns, or product questions. Your existing
                            knowledge still works; skills just give you more say
                            over what AI Agent does and says.
                        </Text>
                    </Box>
                    <Box gap="xs">
                        <Button
                            onClick={handleGoToSkills}
                            aria-label="Go to skills"
                            variant="primary"
                        >
                            Go to skills
                        </Button>
                        <Button
                            onClick={handleLearnMore}
                            variant="tertiary"
                            aria-label="Learn more"
                        >
                            Learn more
                        </Button>
                    </Box>
                </Box>
                <Card className={css.placeholder} />
            </Box>
        </Card>
    )
}
