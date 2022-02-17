import React from 'react'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'
import Tooltip from 'pages/common/components/Tooltip'

type Props = {
    setQuickStatus: (status: string) => void
    currentStatus: string
}

const TicketStatus = ({setQuickStatus, currentStatus}: Props) => {
    const toClose = currentStatus !== 'closed'

    return (
        <div className="d-inline-block mr-2">
            <span id="change-status-button">
                {toClose ? (
                    <Button
                        type="button"
                        intent={ButtonIntent.Secondary}
                        onClick={() => setQuickStatus(currentStatus)}
                    >
                        <ButtonIconLabel icon="check">Close</ButtonIconLabel>
                    </Button>
                ) : (
                    <IconButton
                        type="button"
                        onClick={() => setQuickStatus(currentStatus)}
                    >
                        check
                    </IconButton>
                )}
            </span>
            <Tooltip placement="bottom" target="change-status-button">
                {toClose ? 'Close (press C)' : 'Reopen (press O)'}
            </Tooltip>
        </div>
    )
}

export default TicketStatus
