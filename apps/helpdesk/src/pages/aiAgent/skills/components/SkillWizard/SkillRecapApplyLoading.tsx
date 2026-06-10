import Lottie from 'lottie-react'

import { Box, Text } from '@gorgias/axiom'

import loadingAnimation from 'assets/img/ai-agent/skill_wizard_loading.json'

type Props = {
    message: string
}

export const SkillRecapApplyLoading = ({ message }: Props) => (
    <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="sm"
        height="100%"
        role="status"
        aria-live="polite"
        aria-label={message}
    >
        <Box w={115} h={115}>
            <Lottie
                animationData={loadingAnimation}
                loop={true}
                autoplay={true}
                aria-hidden="true"
                aria-label="Applying skills"
            />
        </Box>
        <Text>{message}</Text>
    </Box>
)
