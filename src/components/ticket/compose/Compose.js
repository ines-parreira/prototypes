import React from 'react'

const Compose = React.createClass({
    render() {
        return (
            <div className="TicketCompose">
                <textarea name="compose-box" id="" cols="30" rows="10"></textarea>
            </div>
        )
    }
})

export default Compose