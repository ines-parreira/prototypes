import React, {PropTypes} from 'react'
import linkifyStr from 'linkifyjs/string'
import moment from 'moment'

export default class TicketMessage extends React.Component {

    renderBody(message) {
        if (message.body_html) {
            return (
                <div className="message-body"
                     dangerouslySetInnerHTML={{__html: message.body_html}}></div>
            )
        }
        return (
            <div className="message-body">
                <pre dangerouslySetInnerHTML={{__html: linkifyStr(message.body_text)}} />
            </div>
        )
    }

    render() {
        const { message } = this.props
        return (
            <div className="TicketMessage item">
                <div className="content">
                    <div className="message-header">
                        <div className="ui left floated header">
                            <span>{message.sender.name || '(no name)'}</span>
                           <span className="ui label">
                               <i className="dollar icon"/>
                                Startup Plan
                           </span>
                            <div className="sub header">
                                {message.sender.address}
                            </div>
                        </div>
                        <div className="ui right floated header">
                            {message.created_datetime ? moment(message.created_datetime).fromNow() : ''}
                        </div>
                    </div>
                    <div className="clearfix"></div>
                    {this.renderBody(message)}
                </div>
            </div>
        )
    }
}

TicketMessage.propTypes = {
    message: PropTypes.shape({
        sender: PropTypes.shape({
            address: PropTypes.string.isRequired,
            name: PropTypes.string
        }),
        created_datetime: PropTypes.string.isRequired,
        body_text: PropTypes.string.isRequired,
        body_html: PropTypes.string.isRequired
    }).isRequired
}
