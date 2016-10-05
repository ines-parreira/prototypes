import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'

const ActivityWidgetItem = ({recentTicket, position}) => {
    // Is the current link active or not?
    const objectURL = `/app/ticket/${recentTicket.get('id')}`
    const isActive = window.location.pathname === objectURL
    const linkClasses = classNames('item', {
        active: isActive
    })

    const chanType = recentTicket.get('channel')

    const iconClasses = classNames('action icon', {
        mail: chanType === 'email',
        comments: chanType === 'chat',
        facebook: chanType === 'facebook' || chanType === 'facebook-post',
        comment: chanType === 'internal-note',
        'facebook-messenger': chanType === 'facebook-message'
    })

    let text = recentTicket.get('subject')

    // counter of activity / new messages
    let counterLabel = null
    if (recentTicket.get('has_something_new') && !isActive) {
        counterLabel = <div className="ui tiny red circular label"/>
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
            ticket: recentTicket.toJS()
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
    recentTicket: PropTypes.object.isRequired,
    position: PropTypes.number.isRequired
}

export default class ActivityWidget extends React.Component {
    static propTypes = {
        activity: PropTypes.object
    }

    render() {
        const tickets = this.props.activity.get('tickets')

        if (!tickets || tickets.isEmpty()) {
            return null
        }

        return (
            <div className="ActivityWidget">
                <div className="item">
                    <h4>RECENT ACTIVITY</h4>
                    <div className="menu">
                        {
                            tickets.map((e, index) => (
                                <ActivityWidgetItem
                                    key={e.get('id')}
                                    recentTicket={e}
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
