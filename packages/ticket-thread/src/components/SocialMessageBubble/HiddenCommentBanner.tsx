import { Box, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './SocialMessageBubble.less'

type HiddenCommentBannerProps = {
    onUnhide?: () => void
}

export function HiddenCommentBanner({ onUnhide }: HiddenCommentBannerProps) {
    return (
        <Box alignItems="center" gap="xs" className={css.hiddenBanner}>
            <Icon name={'hide' as IconName} size="sm" />
            <Text size="sm">Comment hidden</Text>
            {onUnhide && (
                <span
                    role="button"
                    aria-label="Unhide comment"
                    onClick={onUnhide}
                    className={css.unhideButton}
                >
                    Unhide comment
                </span>
            )}
        </Box>
    )
}
