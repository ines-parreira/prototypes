import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { TicketStatus as TicketStatusEnum } from 'business/types/ticket'
import IconButton from 'pages/common/components/button/IconButton'

type Props = {
    setQuickStatus: (status: string) => void
    currentStatus: string
}

const TicketStatus = ({ setQuickStatus, currentStatus }: Props) => {
    const isClosed = currentStatus === TicketStatusEnum.Closed

    return (
        <>
            <span id="change-status-button">
                {isClosed ? (
                    <IconButton
                        size="small"
                        onClick={() => setQuickStatus(currentStatus)}
                    >
                        check
                    </IconButton>
                ) : (
                    <Button
                        size="small"
                        intent="secondary"
                        onClick={() => setQuickStatus(currentStatus)}
                        leadingIcon="check"
                    >
                        Close
                    </Button>
                )}
            </span>
            <Tooltip placement="bottom" target="change-status-button">
                {isClosed ? 'Reopen (press O)' : 'Close (press C)'}
            </Tooltip>
        </>
    )
}

export default TicketStatus
