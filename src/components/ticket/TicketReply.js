import React, {PropTypes} from 'react'

export default class TicketReply extends React.Component {
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
                    <div className="ui green button">Send &amp; Close</div>
                    <div className="ui button">Send</div>
                </form>
            </div>
        )
    }
}

TicketReply.propTypes = {
    ticket: PropTypes.object.isRequired
}
