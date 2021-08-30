import React, {Component} from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

import Avatar from '../../common/components/Avatar/Avatar'
import {DatetimeLabel} from '../../common/utils/labels'
import {getAgents} from '../../../state/agents/selectors'
import {RootState} from '../../../state/types'

import {DATETIME_LABEL_FORMAT} from './constants.js'

type Props = {
    eventItem: Map<any, any>
} & ConnectedProps<typeof connector>

export class UserAuditRowContainer extends Component<Props> {
    _renderUser = (item: Map<any, any>) => {
        const {agents} = this.props
        if (!agents) {
            return null
        }

        const user: Map<any, any> | undefined = agents.find(
            (u: Map<any, any>) => u.get('id') === item.get('user_id')
        )
        if (!user) {
            return null
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

    _renderObject = (item: Map<any, any>) => {
        const objectTypeRoutes = {
            Ticket: `/app/ticket/${item.get('object_id') as number}/`,
            Customer: `/app/customer/${item.get('object_id') as number}/`,
            // TODO(customers-migration): remove this when we updated the object type for customers-related events
            User: `/app/customer/${item.get('object_id') as number}/`,
        }
        const objectType = item.get(
            'object_type'
        ) as keyof typeof objectTypeRoutes
        const text = `${objectType} #${item.get('object_id') as number}`
        if (objectTypeRoutes[objectType]) {
            return <Link to={objectTypeRoutes[objectType]}>{text}</Link>
        }
        return text
    }

    _renderEventType = (item: Map<any, any>) => {
        return (item.get('type') as string).split('-').slice(1).join(' ')
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

const connector = connect((state: RootState) => ({
    agents: getAgents(state),
}))

export default connector(UserAuditRowContainer)
