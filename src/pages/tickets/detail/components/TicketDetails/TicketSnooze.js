// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'

import Tooltip from '../../../../common/components/Tooltip'
import {formatDatetime} from '../../../../../utils'

import * as currentUserSelectors from '../../../../../state/currentUser/selectors'

type Props = {
    className: ?string,
    datetime: ?string,
    timezone: string,
}

export class TicketSnooze extends Component<Props> {
    render() {
        const {datetime, timezone} = this.props

        if (!datetime) {
            return null
        }

        return (
            <div className={this.props.className}>
                <i
                    id="ticket-header-snooze-icon"
                    className="icon material-icons"
                >
                    snooze
                </i>
                <Tooltip placement="bottom" target="ticket-header-snooze-icon">
                    Snooze {formatDatetime(datetime, timezone)}
                </Tooltip>
            </div>
        )
    }
}

export default connect((state) => {
    return {
        timezone: currentUserSelectors.getTimezone(state),
    }
})(TicketSnooze)
