import { Box, Text } from '@gorgias/axiom'

import css from './SocialMessageBubble.less'

export function HiddenCommentBanner() {
    return (
        <Box alignItems="center" className={css.hiddenBanner}>
            <Text size="sm">Message hidden</Text>
        </Box>
    )
}
