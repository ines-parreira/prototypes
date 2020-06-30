import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import Tooltip from '../../../../common/components/Tooltip'

import headerCss from '../TicketHeader.less'

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
                    {toClose && 'Close'}
                </Button>
                <Tooltip placement="bottom" target="change-status-button">
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
