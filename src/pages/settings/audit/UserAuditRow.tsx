import React, {useCallback, useMemo} from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import _startCase from 'lodash/startCase'

import Avatar from 'pages/common/components/Avatar/Avatar'
import {DatetimeLabel} from 'pages/common/utils/labels'
import {Event} from 'models/event/types'
import {getAgents} from 'state/agents/selectors'
import {humanizeString} from 'utils'
import useAppSelector from 'hooks/useAppSelector'

import {DATETIME_LABEL_FORMAT} from './constants'
import css from './UserAuditRow.less'

type Props = {
    eventItem: Event
}

const UserAuditRow = ({eventItem}: Props) => {
    const agents = useAppSelector(getAgents)

    const renderUser = useCallback(() => {
        const user: Map<any, any> | undefined = agents.find(
            (u: Map<any, any>) => u.get('id') === eventItem.user_id
        )
        if (!user) {
            return <span className={css.emptyUser}>No user</span>
        }

        return (
            <div>
                <Link to={`/app/settings/users/${user.get('id') as number}`}>
                    <Avatar
                        name={user.get('name') || user.get('email')}
                        url={user.getIn(['meta', 'profile_picture_url'])}
                        size={26}
                        className="d-inline-block"
                    />{' '}
                    {user.get('name') || user.get('email')}
                </Link>
            </div>
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventItem])

    const renderObject = useCallback(() => {
        const objectTypeRoutes = {
            Ticket: `/app/ticket/${eventItem.object_id}/`,
            Customer: `/app/customer/${eventItem.object_id}/`,
            // TODO(customers-migration): remove this when we updated the object type for customers-related events
            User: `/app/customer/${eventItem.object_id}/`,
        }
        const objectType =
            eventItem.object_type as keyof typeof objectTypeRoutes
        const text = `${objectType} #${eventItem.object_id}`
        if (objectTypeRoutes[objectType]) {
            return <Link to={objectTypeRoutes[objectType]}>{text}</Link>
        }
        return `${_startCase(objectType)} #${eventItem.object_id}`
    }, [eventItem])

    const eventType = useMemo(() => {
        return humanizeString(eventItem.type)
    }, [eventItem])

    return (
        <tr>
            <td className="align-middle">{renderUser()}</td>
            <td className="link-full-td align-middle">
                <div className="cell-content">{eventType}</div>
            </td>
            <td className="link-full-td align-middle">
                <div className="cell-content">{renderObject()}</div>
            </td>
            <td className="smallest link-full-td">
                <div className="cell-content">
                    <DatetimeLabel
                        dateTime={eventItem.created_datetime}
                        labelFormat={DATETIME_LABEL_FORMAT}
                    />
                </div>
            </td>
        </tr>
    )
}

export default UserAuditRow
