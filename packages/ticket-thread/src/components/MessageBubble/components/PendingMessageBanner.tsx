import { Box, Button, Icon, Text } from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'

import styles from './PendingMessageBanner.less'

type PendingMessageBannerProps = {
    message: TicketMessage
}

export function PendingMessageBanner({ message }: PendingMessageBannerProps) {
    const {
        legacyActions: { undoTicketPendingMessage },
        legacyState: { newMessage },
    } = useTicketThreadLegacyBridge()

    const canUndoPendingMessage =
        newMessage.canUndoTicketPendingMessage?.(message) ?? false

    return (
        <Box
            alignItems="center"
            gap="xs"
            className={styles.pendingMessageBanner}
        >
            <Box alignItems="center" gap="xs">
                <Icon name="info" color="content-accent-default" />
                <Text size="sm" color="content-neutral-default">
                    Message sending...
                </Text>
            </Box>
            {canUndoPendingMessage && undoTicketPendingMessage ? (
                <Button
                    size="sm"
                    variant="primary"
                    onClick={() => undoTicketPendingMessage(message)}
                >
                    Undo
                </Button>
            ) : null}
        </Box>
    )
}
