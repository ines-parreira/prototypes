import React, {PropTypes} from 'react'
import linkifyStr from 'linkifyjs/string'
import moment from 'moment'
import 'moment-timezone'

export default class TicketMessage extends React.Component {
    render() {
        const { message, currentUser } = this.props

        let createdDatetime = ''
        if (message.created_datetime) {
            createdDatetime = moment(message.created_datetime).tz(currentUser.get('timezone', 'UTC')).fromNow()
        }
        return (
            <div className="TicketMessage item">
                <div className="content">
                    <div className="message-header">
                        <div className="ui left floated header sender">
                            {(() => {
                                if (message.from_agent) {
                                    return (<span className="ui mini yellow author-label label">A</span>)
                                }
                            })()}
                            <span className="name">{`${message.sender.first_name} ${message.sender.last_name}`}</span>
                            {(() => {
                                if (!message.from_agent) {
                                    return (
                                        <span className="ui label">
                                            <i className="dollar icon"/>Startup Plan
                                        </span>
                                    )
                                }
                            })()}
                            <div className="sub header">
                                {message.sender.email}
                            </div>
                        </div>
                        <div className="ui right floated header">{createdDatetime}</div>
                    </div>
                    <div className="clearfix"></div>
                    {(() => {
                        if (message.body_html) {
                            return (
                                <div className="message-body"
                                     dangerouslySetInnerHTML={{__html: message.body_html}}></div>
                            )
                        }
                        return (
                            <div className="message-body">
                                <pre dangerouslySetInnerHTML={{__html: linkifyStr(message.body_text)}}/>
                            </div>
                        )
                    })()}
                </div>
            </div>
        )
    }
}

TicketMessage.propTypes = {
    message: PropTypes.shape({
        sender: PropTypes.shape({
            id: PropTypes.number,
            first_name: PropTypes.string,
            last_name: PropTypes.string,
            email: PropTypes.string
        }),
        from_agent: PropTypes.bool.isRequired,
        body_text: PropTypes.string.isRequired,
        body_html: PropTypes.string.isRequired,
        created_datetime: PropTypes.string.isRequired,
    }).isRequired,
    currentUser: PropTypes.object.isRequired
}
