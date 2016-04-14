import React, { PropTypes } from 'react'


export default class NextMessageChannel extends React.Component {
    componentDidMount() {
        $('#popup-message-channel').popup({ inline: true, position: 'bottom left', hoverable: true, on: 'hover' })
    }

    render() {
        const { ticket, actions } = this.props
        const channel = this.props.ticket.get('channel')
        let display = <span>Person</span>

        if (channel === 'email') {
            display = (
                <span id="popup-message-channel">
                    <i id="popup-message-channel" className="icon mail blue"/>
                    <span className="label">To: </span>
                    <b>{ticket.getIn(['requester', 'email'])}</b>
                </span>
            )
        } else if (channel === 'facebook') {
            display = (
                <span id="popup-message-channel">
                    <i className="icon facebook blue"/>
                    <span className="label">To: </span>
                    <b>{ticket.getIn(['requester', 'name'])}</b>
                </span>
            )
        }

        return (
            <div className="recipient-data">
                {display}

                <div className="ui popup">
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

NextMessageChannel.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
