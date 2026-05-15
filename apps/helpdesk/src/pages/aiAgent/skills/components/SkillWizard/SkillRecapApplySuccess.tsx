import { useEffect } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { Box, Heading, Text } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

const REDIRECT_DELAY_MS = 3000

type Props = {
    liveSkillsCount: number
}

export const SkillRecapApplySuccess = ({ liveSkillsCount }: Props) => {
    const { shopName } = useParams<{ shopName: string }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const history = useHistory()

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            history.push(routes.skills)
        }, REDIRECT_DELAY_MS)
        return () => window.clearTimeout(timeoutId)
    }, [history, routes.skills])

    const skillNoun = liveSkillsCount === 1 ? 'skill is' : 'skills are'

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="sm"
            height="100%"
        >
            <Box
                w={115}
                h={115}
                aria-hidden="true"
                style={{ backgroundColor: '#d9d9d9' }}
            />
            <Box flexDirection="column" gap="xs" alignItems="center">
                <Heading size="lg">
                    {liveSkillsCount} {skillNoun} live
                </Heading>
                <Text>
                    Your AI Agent will now follow your instructions based on
                    customer intent.
                </Text>
                <Text size="sm" color="content-neutral-secondary">
                    Taking you to skills...
                </Text>
            </Box>
        </Box>
    )
}
