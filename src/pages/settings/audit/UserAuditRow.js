//@flow
import React from 'react'
import {type Map} from 'immutable'
import {Link} from 'react-router'
import {connect} from 'react-redux'

import Avatar from '../../common/components/Avatar/Avatar'
import {DatetimeLabel} from '../../common/utils/labels'
import {getAgents} from '../../../state/agents/selectors.ts'

import {DATETIME_LABEL_FORMAT} from './constants'

type EventItem = Map<string, *>
type Props = {
    agents: Object,
    eventItem: EventItem,
}

export class UserAuditRow extends React.Component<Props> {
    _renderUser = (item: EventItem) => {
        const {agents} = this.props
        if (!agents) {
            return null
        }

        const user = agents.find((u) => u.get('id') === item.get('user_id'))
        if (!user) {
            return null
        }

        return (
            <div>
                <Link to={`/app/settings/users/${user.get('id')}`}>
                    <Avatar
                        name={user.get('name')}
                        url={user.getIn(['meta', 'profile_picture_url'])}
                        size={26}
                        className="d-inline-block"
                    />{' '}
                    {user.get('name')}
                </Link>
            </div>
        )
    }

    _renderObject = (item: EventItem) => {
        const objectTypeRoutes = {
            Ticket: `/app/ticket/${item.get('object_id')}/`,
            Customer: `/app/customer/${item.get('object_id')}/`,
            // TODO(customers-migration): remove this when we updated the object type for customers-related events
            User: `/app/customer/${item.get('object_id')}/`,
        }
        const objectType = item.get('object_type')
        const text = `${objectType} #${item.get('object_id')}`
        if (objectTypeRoutes[objectType]) {
            return <Link to={objectTypeRoutes[objectType]}>{text}</Link>
        }
        return text
    }

    _renderEventType = (item: EventItem) => {
        return item.get('type').split('-').slice(1).join(' ')
    }

    render() {
        const {eventItem} = this.props

        return (
            <tr>
                <td>{this._renderUser(eventItem)}</td>
                <td>{this._renderEventType(eventItem)}</td>
                <td>{this._renderObject(eventItem)}</td>
                <td className="smallest">
                    <DatetimeLabel
                        dateTime={eventItem.get('created_datetime')}
                        labelFormat={DATETIME_LABEL_FORMAT}
                    />
                </td>
            </tr>
        )
    }
}

export default connect((state) => ({
    agents: getAgents(state),
}))(UserAuditRow)
