import React, {PropTypes} from 'react'

export default class TicketReply extends React.Component {
    send(extra) {
        return (e) => {
            e.preventDefault()
            this.props.send(extra)
        }
    }

    render() {
        return (
            <div className="TicketReply">
                <div className="ui header author">
                    <span className="ui mini yellow author-label label">A</span> Avi Davis
                </div>
                <form className="ui reply form">
                    <div className="field">
                        <textarea></textarea>
                    </div>
                    <button className="ui green button" onClick={this.send('close')}>Send &amp; Close</button>
                    <button className="ui button" onClick={this.send()}>Send</button>
                </form>
            </div>
        )
    }
}

TicketReply.propTypes = {
    ticket: PropTypes.object.isRequired,
    send: PropTypes.func.isRequired
}
