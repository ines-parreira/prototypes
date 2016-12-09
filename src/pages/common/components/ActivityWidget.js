import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router'
import classNames from 'classnames'
import {isCurrentlyOnTicket} from '../../../utils'

const ActivityWidgetItem = ({recentTicket, position}) => {
    const channel = recentTicket.get('channel')

    const iconClasses = classNames('action icon', {
        mail: channel === 'email',
        comments: channel === 'chat',
        facebook: channel === 'facebook' || channel === 'facebook-post',
        comment: channel === 'internal-note',
        'facebook-messenger': channel === 'facebook-message',
        help: channel === 'unknown',
    })

    const text = recentTicket.get('subject')

    // track on click
    const _onClick = () => {
        amplitude.getInstance().logEvent('Clicked on recent activity item', {
            position,
            ticket: recentTicket.toJS(),
        })
    }

    // is the current link active or not?
    const isActive = isCurrentlyOnTicket(recentTicket.get('id'))
    const linkClasses = classNames('item', {
        active: isActive,
        'has-something-new': recentTicket.get('has_something_new') && !isActive,
    })

    return (
        <Link
            onClick={_onClick}
            to={`/app/ticket/${recentTicket.get('id')}`}
            className={linkClasses}
            title={text}
        >
            <i className={iconClasses} />
            <span>{text}</span>
        </Link>
    )
}

ActivityWidgetItem.propTypes = {
    recentTicket: PropTypes.object.isRequired,
    position: PropTypes.number.isRequired
}

class ActivityWidget extends React.Component {
    static propTypes = {
        activity: PropTypes.object,
        router: PropTypes.object,
    }

    componentDidMount() {
        // force redraw on page change, since we care about window.location in ActivityWidgetItem
        this.unlisten = this.props.router.listen(() => this.forceUpdate())
    }

    componentWillUnmount() {
        // unlisten router changes
        if (this.unlisten) {
            this.unlisten()
        }
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

const mapStateToProps = (state) => ({
    activity: state.activity,
})

export default withRouter(connect(mapStateToProps)(ActivityWidget))
