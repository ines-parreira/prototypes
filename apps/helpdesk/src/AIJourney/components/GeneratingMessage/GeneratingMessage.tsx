import { Box, Icon, IconSize, Size } from '@gorgias/axiom'

import { TypingMessage } from 'pages/aiAgent/Onboarding_V2/components/TypingMessage/TypingMessage'

import css from './GeneratingMessage.less'

export const GeneratingMessage = () => {
    return (
        <Box flexDirection="column" gap={Size.Xs}>
            <Box className={css.messageBubble}>
                <TypingMessage
                    color="transparent"
                    indicatorColor="#B3B8C1" // var(--static-secondary)
                    customStyle={{ margin: 0, padding: 0 }}
                />
            </Box>
            <Box
                alignItems="center"
                gap={Size.Xxs}
                className={css.bottomMessage}
            >
                <Icon name="ai-agent-feedback" size={IconSize.Xs} />
                Generating messages
            </Box>
        </Box>
    )
}
