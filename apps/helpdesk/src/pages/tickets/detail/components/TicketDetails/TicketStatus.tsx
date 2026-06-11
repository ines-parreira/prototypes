import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { TicketStatus as TicketStatusEnum } from 'business/types/ticket'

type Props = {
    setQuickStatus: (status: string) => void
    currentStatus: string
    disabled?: boolean
}

const TicketStatus = ({
    currentStatus,
    disabled = false,
    setQuickStatus,
}: Props) => {
    const isClosed = currentStatus === TicketStatusEnum.Closed

    const button = isClosed ? (
        <Button
            size="sm"
            icon="check"
            aria-label="Reopen"
            onClick={() => setQuickStatus(currentStatus)}
            isDisabled={disabled}
        />
    ) : (
        <Button
            size="sm"
            variant="secondary"
            leadingSlot="check"
            onClick={() => setQuickStatus(currentStatus)}
            isDisabled={disabled}
        >
            Close
        </Button>
    )

    const tooltipLabel = disabled
        ? 'Not available in standalone mode'
        : isClosed
          ? 'Reopen (press O)'
          : 'Close (press C)'

    return (
        <Tooltip delay={0} placement="bottom" trigger={button}>
            <TooltipContent title={tooltipLabel} />
        </Tooltip>
    )
}

export { TicketStatus }
