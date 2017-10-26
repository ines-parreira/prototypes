import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import Tooltip from '../../../../common/components/Tooltip'

import css from './TicketStatus.less'

export default class TicketStatus extends React.Component {
    render() {
        const {setQuickStatus, currentStatus} = this.props

        const toClose = currentStatus !== 'closed'

        return (
            <div className="d-inline-block mr-2">
                <Button
                    type="button"
                    id="change-status-button"
                    className={classnames('d-inline-block', css.button)}
                    color={toClose ? 'secondary' : 'success'}
                    onClick={() => setQuickStatus(currentStatus)}
                >
                    <i
                        className={classnames('fa fa-fw fa-check mr-1', {
                            [css.alone]: !toClose,
                        })}
                    />
                    {toClose && 'Close'}
                </Button>
                <Tooltip
                    placement="bottom"
                    target="change-status-button"
                >
                    {toClose ? 'Close (press C)' : 'Reopen (press O)'}
                </Tooltip>
            </div>
        )
    }
}

TicketStatus.propTypes = {
    setQuickStatus: PropTypes.func.isRequired,
    currentStatus: PropTypes.string.isRequired,
}
