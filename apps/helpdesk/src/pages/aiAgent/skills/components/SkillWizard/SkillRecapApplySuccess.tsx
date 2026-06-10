import { useEffect } from 'react'
import Lottie from 'lottie-react'
import { Duration } from '@gorgias/toolkit'

import { useHistory, useParams } from 'react-router-dom'

import { Box, Heading, Text } from '@gorgias/axiom'

import doneAnimation from 'assets/img/ai-agent/skill_wizrad_done.json'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

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
        }, Duration.seconds(3))
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
            <Box w={115} h={115}>
                <Lottie
                    animationData={doneAnimation}
                    loop={true}
                    autoplay={true}
                    aria-hidden="true"
                    aria-label="Skills applied successfully"
                />
            </Box>
            <Box flexDirection="column" gap="xs" alignItems="center">
                <Heading size="lg">
                    {liveSkillsCount} {skillNoun} live
                </Heading>
                <Text>
                    Your AI Agent will now follow your skills based on customer
                    intent.
                </Text>
                <Text size="sm" color="content-neutral-secondary">
                    Taking you to skills...
                </Text>
            </Box>
        </Box>
    )
}
