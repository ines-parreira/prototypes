import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import _ from 'lodash'
import {fromJS} from 'immutable'
import classNames from 'classnames'
import {ACTIVITY_DISPLAY_COUNT} from '../../../config'

const ActivityWidgetItem = ({object, count, position}) => {
    // Is the current link active or not?
    const objectURL = `/app/ticket/${object.get('id')}`
    const linkClasses = classNames('item', {
        active: window.location.pathname === objectURL
    })

    // figure out what icon to show based on ticket message source
    const messages = object.get('messages', fromJS([]))
    let chanType = ''
    if (!messages.isEmpty()) {
        chanType = messages.last().getIn(['source', 'type'])
    }

    // if the source didn't give us anything fallback to the channel
    if (!chanType) {
        chanType = object.get('channel', 'unknown')
    }

    const iconClasses = classNames('action icon', {
        mail: chanType === 'email',
        comments: chanType === 'chat',
        facebook: chanType === 'facebook' || chanType === 'facebook-post',
        comment: chanType === 'internal-note',
        'facebook-messenger': chanType === 'facebook-message',
        help: chanType === 'unknown',
    })

    // the text of the link should try to use the `ticket.requester` or `ticket.subject` or finally `Ticket 123`
    let text = object.getIn(['requester', 'name']) || object.get('subject') || `Ticket ${object.get('id')}`

    // counter of activity / new messages
    let counterLabel = null
    if (count) {
        counterLabel = (
            <div className="ui mini red circular label">
                {count}
            </div>
        )
        text = (
            <strong title={text}>
                {text}
            </strong>
        )
    }

    // track on click
    const _onClick = () => {
        amplitude.getInstance().logEvent('Clicked on recent activity item', {
            position,
            notifications: count,
            ticket: _.pick(object.toJS(), ['channel'])
        })
    }

    return (
        <Link
            onClick={_onClick}
            to={objectURL}
            className={linkClasses}
            title={text}
        >
            <i className={iconClasses} />
            {text}
            {counterLabel}
        </Link>
    )
}

ActivityWidgetItem.propTypes = {
    object: PropTypes.object.isRequired,
    user: PropTypes.object,
    count: PropTypes.number.isRequired,
    position: PropTypes.number.isRequired
}

export default class ActivityWidget extends React.Component {
    static propTypes = {
        activity: PropTypes.object
    }

    render() {
        const events = this.props.activity.get('events')
        const counter = this.props.activity.get('objectsCounter')

        if (!events || events.isEmpty()) {
            return null
        }

        return (
            <div className="ActivityWidget">
                <div className="item">
                    <h4>RECENT ACTIVITY</h4>
                    <div className="menu">
                        {
                            events
                                .slice(0, ACTIVITY_DISPLAY_COUNT)
                                .map((e, index) => (
                                    <ActivityWidgetItem
                                        key={e.get('object_id')}
                                        object={e.get('object')}
                                        count={counter.getIn([e.get('object_id'), 'count']) || 0}
                                        user={e.get('user')}
                                        position={index + 1}
                                    />
                                ))
                        }
                    </div>
                </div>
            </div>
        )
    }
}
