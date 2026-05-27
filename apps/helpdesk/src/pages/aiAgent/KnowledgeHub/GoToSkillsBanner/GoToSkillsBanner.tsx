import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import type { BoxProps } from '@gorgias/axiom'
import { Banner, Box, Button, Text } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

const getDismissedKey = (shopName: string) =>
    `go-to-skills-banner-dismissed-${shopName}`

const DEFAULT_TITLE =
    'Skills are here: your recommendations are ready to review'
const DEFAULT_DESCRIPTION =
    "Knowledge works alongside skills to support questions they don't cover."

type Props = {
    shopName: string
    title?: React.ReactNode
    description?: React.ReactNode
    width?: BoxProps['width']
}

export const GoToSkillsBanner: React.FC<Props> = ({
    shopName,
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    width,
}) => {
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
        <Box width={width}>
            <Banner
                size="md"
                variant="inline"
                intent="info"
                isClosable
                onOpenChange={handleOnClose}
                title={title}
                description={
                    <Box
                        flexDirection="column"
                        gap="xs"
                        alignItems="flex-start"
                    >
                        <Text variant="regular" size="md">
                            {description}
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
        </Box>
    )
}
