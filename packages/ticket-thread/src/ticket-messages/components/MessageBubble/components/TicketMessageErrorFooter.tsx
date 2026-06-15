import { Box, Button, Tooltip, TooltipContent } from '@gorgias/axiom'

type TicketMessageErrorFooterProps = {
    isRetriable?: boolean
    isForceable?: boolean
    isCancelable?: boolean
    isLoading: boolean
    isSubmittingMessage: boolean
    retryTooltipMessage: string
    onRetry: () => void
    onForce: () => void
    onCancel: () => void
}

const FORCE_TOOLTIP_MESSAGE =
    'Ignore failure, execute other actions and send the message.'
const CANCEL_TOOLTIP_MESSAGE = 'Delete the message and never send it.'

export function TicketMessageErrorFooter({
    isRetriable,
    isForceable,
    isCancelable,
    isLoading,
    isSubmittingMessage,
    retryTooltipMessage,
    onRetry,
    onForce,
    onCancel,
}: TicketMessageErrorFooterProps) {
    if (!isRetriable && !isForceable && !isCancelable) {
        return null
    }

    return (
        <Box flexWrap="wrap" gap="xxs">
            {isRetriable ? (
                <Tooltip
                    trigger={
                        <Button
                            isDisabled={isLoading || isSubmittingMessage}
                            onClick={onRetry}
                            size="sm"
                            variant="primary"
                        >
                            Retry
                        </Button>
                    }
                >
                    <TooltipContent title={retryTooltipMessage} />
                </Tooltip>
            ) : null}
            {isForceable ? (
                <Tooltip
                    trigger={
                        <Button
                            isDisabled={isLoading || isSubmittingMessage}
                            onClick={onForce}
                            size="sm"
                            variant="secondary"
                        >
                            Send Anyway
                        </Button>
                    }
                >
                    <TooltipContent title={FORCE_TOOLTIP_MESSAGE} />
                </Tooltip>
            ) : null}
            {isCancelable ? (
                <Tooltip
                    trigger={
                        <Button
                            isDisabled={isLoading || isSubmittingMessage}
                            onClick={onCancel}
                            size="sm"
                            variant="secondary"
                        >
                            Cancel Message
                        </Button>
                    }
                >
                    <TooltipContent title={CANCEL_TOOLTIP_MESSAGE} />
                </Tooltip>
            ) : null}
        </Box>
    )
}
