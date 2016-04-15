import React, { PropTypes } from 'react'


export default class ReplyMessageChannel extends React.Component {
    componentDidMount() {
        $('#popup-message-channel').popup({ popup: '#next-message-channel-popup', position: 'bottom left', hoverable: true, on: 'click' })
    }

    render() {
        const { ticket, actions } = this.props
        const channel = this.props.ticket.get('channel')
        let display = <span>Person</span>

        if (!this.props.ticket.getIn(['newMessage', 'public'])) {
            display = (
                <span>
                    <i id="popup-message-channel" className="action icon comment yellow"/>
                    <span className="label">To: </span>
                    <b>your team</b>
                </span>
            )
        } else if (channel === 'email') {
            display = (
                <span>
                    <i id="popup-message-channel" className="action icon mail blue"/>
                    <span className="label">To: </span>
                    <b>{ticket.getIn(['requester', 'email'])}</b>
                </span>
            )
        } else if (channel === 'facebook') {
            display = (
                <span>
                    <i id="popup-message-channel" className="action icon facebook blue"/>
                    <span className="label">To: </span>
                    <b>{ticket.getIn(['requester', 'name'])}</b>
                </span>
            )
        }

        return (
            <div className="ReplyMessageChannel">
                {display}

                <div id="next-message-channel-popup" className="ui popup">
                    <div
                        className="ui vertical menu"
                        style={{ textAlign: 'left', border: 'none', width: 'inherit' }}
                    >
                        <div className="item" onClick={() => actions.setPublic(true)}>
                            Send as email
                        </div>
                        <div className="item" onClick={() => actions.setPublic(false)}>
                            Send as internal note
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

ReplyMessageChannel.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
