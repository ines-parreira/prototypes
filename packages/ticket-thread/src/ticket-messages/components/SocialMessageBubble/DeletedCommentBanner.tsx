import { Box, Icon, Text } from '@gorgias/axiom'

import css from './SocialMessageBubble.less'

export function DeletedCommentBanner() {
    return (
        <Box alignItems="center" gap="xxxs" className={css.deletedBanner}>
            <Icon name="trash-empty" size="sm" />
            <Text size="sm">Comment deleted on Facebook</Text>
        </Box>
    )
}
