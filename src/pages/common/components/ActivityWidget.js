import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'
import {truncate} from '../../../utils'
import {ACTIVITY_DISPLAY_COUNT} from '../../../config'

const ActivityWidgetItem = ({object, count}) => {
    // Is the current link active or not?
    const objectURL = `/app/ticket/${object.get('id')}`
    const linkClasses = classNames('item', {
        active: window.location.pathname === objectURL
    })

    // figure out what icon to show based on ticket message source
    const messages = object.get('messages')
    let chanType = ''
    if (messages) {
        chanType = messages.last().getIn(['source', 'type'])
    }

    // if the source didn't give us anything fallback to the channel
    if (!chanType) {
        chanType = object.get('channel')
    }

    const iconClasses = classNames('action icon', {
        mail: chanType === 'email',
        comments: chanType === 'chat',
        facebook: chanType === 'facebook' || chanType === 'facebook-post',
        comment: chanType === 'internal-note',
        'facebook-messenger': chanType === 'facebook-message'
    })

    // The text of the link should try to use the `ticket.requester` or `ticket.subject` or finally `Ticket 123`
    let text = object.get('subject') || `Ticket ${object.get('id')}`
    const title = text

    if (object.getIn(['requester', 'name'])) {
        text = object.getIn(['requester', 'name'])
    }
    text = truncate(text, 20)

    let counterLabel = null
    if (count) {
        counterLabel = (<div className="ui mini red circular label">{count}</div>)
        text = (<strong title={title}>{text}</strong>)
    }

    return (
        <Link to={objectURL} className={linkClasses} title={title}>
            <i className={iconClasses}/>
            {text}
            {counterLabel}
        </Link>
    )
}
ActivityWidgetItem.propTypes = {
    object: PropTypes.object,
    user: PropTypes.object,
    count: PropTypes.number
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
                        {events.slice(0, ACTIVITY_DISPLAY_COUNT).map(e => (
                            <ActivityWidgetItem
                                key={e.get('object_id')}
                                object={e.get('object')}
                                count={counter.getIn([e.get('object_id'), 'count'])}
                                user={e.get('user')}
                            />
                        )).toList()}
                    </div>
                </div>
            </div>
        )
    }
}
