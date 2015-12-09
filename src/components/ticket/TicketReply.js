import React, {PropTypes} from 'react'
import moment from 'moment'

export default class TicketReply extends React.Component {
    constructor() {
        super()
        this.update.bind(this)
    }

    submit(status) {
        return (e) => {
            e.preventDefault()
            this.props.submit({
                status: status
            })
        }
    }

    update() {
        return () => {

            const messages = this.props.ticket.get('messages')
            let lastMessage = messages[0]
            for (const m of messages) {
                if (moment(lastMessage.created_datetime) > moment(m.created_datetime)) {
                    lastMessage = m
                }
            }

            this.props.update({
                message: {
                    sender: this.props.currentUser.toJS(),
                    receivers: [lastMessage.sender],
                    body_text: this.refs.body_text.value
                }
            })
        }
    }

    render() {
        const {currentUser} = this.props

        return (
            <div className="TicketReply">
                <div className="ui left floated header sender">
                    <span className="name">
                        <span className="ui mini yellow author-label label">A</span>
                        {currentUser.get('first_name')} {currentUser.get('last_name')}
                    </span>
                    <div className="sub header email">{currentUser.get('email')}</div>
                </div>
                <form className="ui reply form">
                    <div className="field">
                        <textarea
                            ref="body_text"
                            onChange={this.update()}
                        />
                    </div>
                    <button className="ui green button" onClick={this.submit('closed')}>Send &amp; Close</button>
                    <button className="ui button" onClick={this.submit()}>Send</button>
                </form>
            </div>
        )
    }
}

TicketReply.propTypes = {
    ticket: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    update: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired
}
