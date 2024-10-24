import {Tooltip} from '@gorgias/ui-kit'
import React from 'react'

import {TicketStatus as TicketStatusEnum} from 'business/types/ticket'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'

type Props = {
    setQuickStatus: (status: string) => void
    currentStatus: string
}

const TicketStatus = ({setQuickStatus, currentStatus}: Props) => {
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
                    >
                        <ButtonIconLabel icon="check">Close</ButtonIconLabel>
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
