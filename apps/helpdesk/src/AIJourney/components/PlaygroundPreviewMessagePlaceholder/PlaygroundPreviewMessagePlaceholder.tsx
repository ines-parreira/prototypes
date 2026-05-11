import { Box, Icon, Size } from '@gorgias/axiom'

import css from './PlaygroundPreviewMessagePlaceholder.less'

export const PlaygroundPreviewMessagePlaceholder = () => {
    return (
        <Box className={css.messageBubble} gap={Size.Xxs}>
            <Icon name="ai-agent-feedback" size={Size.Sm} />
            AI agent ready to preview messages
        </Box>
    )
}
