import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { Banner, Box, Button, Text } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

const getDismissedKey = (shopName: string) =>
    `go-to-skills-banner-dismissed-${shopName}`

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

    if (isDismissed) return null

    return (
        <Banner
            size="md"
            variant="inline"
            intent="info"
            isClosable
            onOpenChange={handleOnClose}
            title="Skills are here: your recommendations are ready to review"
            description={
                <Box flexDirection="column" gap="xs" alignItems="flex-start">
                    <Text variant="regular" size="md">
                        Knowledge works alongside skills to support questions
                        they don&apos;t cover.
                    </Text>
                    <Button
                        size="sm"
                        onClick={handleGoToSkills}
                        aria-label="Go to skills"
                        variant="primary"
                        trailingSlot="arrow-right"
                    >
                        Go to skills
                    </Button>
                </Box>
            }
        ></Banner>
    )
}
