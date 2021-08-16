import React from 'react'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import Tooltip from '../../../../common/components/Tooltip'
import headerCss from '../TicketHeader.less'

import css from './TicketStatus.less'

type Props = {
    setQuickStatus: (status: string) => void
    currentStatus: string
}

const TicketStatus = ({setQuickStatus, currentStatus}: Props) => {
    const toClose = currentStatus !== 'closed'

    return (
        <div className="d-inline-block mr-2">
            <Button
                type="button"
                id="change-status-button"
                className={classnames(
                    headerCss.headerButton,
                    'font-weight-medium',
                    {
                        [css.closed]: !toClose,
                    }
                )}
                color={toClose ? 'secondary' : 'success'}
                onClick={() => setQuickStatus(currentStatus)}
            >
                <i
                    className={classnames(css.icon, 'material-icons', {
                        ['md-2 mr-1']: toClose,
                        ['md-3']: !toClose,
                    })}
                >
                    check
                </i>
                {toClose && <span>Close</span>}
            </Button>
            <Tooltip placement="bottom" target="change-status-button">
                {toClose ? 'Close (press C)' : 'Reopen (press O)'}
            </Tooltip>
        </div>
    )
}

export default TicketStatus
