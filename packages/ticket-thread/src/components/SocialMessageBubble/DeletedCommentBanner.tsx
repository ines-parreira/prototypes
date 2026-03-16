import { Box, Text } from '@gorgias/axiom'

import css from './SocialMessageBubble.less'

export function DeletedCommentBanner() {
    return (
        <Box alignItems="center" className={css.deletedBanner}>
            <Text size="sm">Comment deleted on Facebook</Text>
        </Box>
    )
}
