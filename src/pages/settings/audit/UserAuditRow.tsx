import React, {Component} from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import _startCase from 'lodash/startCase'

import {Event} from '../../../models/event/types'
import Avatar from '../../common/components/Avatar/Avatar'
import {DatetimeLabel} from '../../common/utils/labels'
import {getAgents} from '../../../state/agents/selectors'
import {RootState} from '../../../state/types'
import {humanizeString} from '../../../utils'

import {DATETIME_LABEL_FORMAT} from './constants'
import css from './UserAuditRow.less'

type Props = {
    eventItem: Event
} & ConnectedProps<typeof connector>

export class UserAuditRowContainer extends Component<Props> {
    _renderUser = (item: Event) => {
        const {agents} = this.props
        if (!agents) {
            return null
        }

        const user: Map<any, any> | undefined = agents.find(
            (u: Map<any, any>) => u.get('id') === item.user_id
        )
        if (!user) {
            return <span className={css.emptyUser}>No user</span>
        }

        return (
            <div>
                <Link to={`/app/settings/users/${user.get('id') as number}`}>
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

    _renderObject = (item: Event) => {
        const objectTypeRoutes = {
            Ticket: `/app/ticket/${item.object_id}/`,
            Customer: `/app/customer/${item.object_id}/`,
            // TODO(customers-migration): remove this when we updated the object type for customers-related events
            User: `/app/customer/${item.object_id}/`,
        }
        const objectType = item.object_type as keyof typeof objectTypeRoutes
        const text = `${objectType} #${item.object_id}`
        if (objectTypeRoutes[objectType]) {
            return <Link to={objectTypeRoutes[objectType]}>{text}</Link>
        }
        return `${_startCase(objectType)} #${item.object_id}`
    }

    _renderEventType = (item: Event) => {
        return humanizeString(item.type)
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
                        dateTime={eventItem.created_datetime}
                        labelFormat={DATETIME_LABEL_FORMAT}
                    />
                </td>
            </tr>
        )
    }
}

const connector = connect((state: RootState) => ({
    agents: getAgents(state),
}))

export default connector(UserAuditRowContainer)
