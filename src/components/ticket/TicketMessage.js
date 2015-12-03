import React, {PropTypes} from 'react'
import moment from 'moment'

export default class TicketMessage extends React.Component {
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
                    <div className="message-body" dangerouslySetInnerHTML={{__html: message.body}}/>
                </div>
            </div>
        )
    }
}

TicketMessage.propTypes = {
    message: PropTypes.object.isRequired
}
