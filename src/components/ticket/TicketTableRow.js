import React, {PropTypes} from 'react'
import moment from 'moment'
import 'moment-timezone'
import classNames from 'classnames'

export default class TicketTableRow extends React.Component {
    stripHTML = (text) => {
        try {
            const doc = document.implementation.createHTMLDocument()
            const body = doc.createElement('div')
            body.innerHTML = text

            const removeElements = body.querySelectorAll('style,script')
            for (let i = 0; i < removeElements.length; i++) {
                removeElements[i].remove()
            }
            return body.textContent || body.innerText
        } catch (e) {
            console.error('Failed stripHTML: ' + e, text)
            return text
        }
    }

    trim = (text, length) => {
        text = this.stripHTML(text)
        const slice = text.slice(0, length)
        return slice !== text ? slice + ' ...' : text
    }

    formatDatetime = (datetime) => {
        let formatted = ''
        if (datetime) {
            formatted = moment(datetime).tz(this.props.currentUser.get('timezone', 'UTC')).fromNow()
        }
        return formatted
    }

    renderFieldContent = (column) => {
        const {ticket} = this.props
        switch (column.name) {
            case "assignee":
                if (!ticket.assignee_user)
                    return null
                return ticket.assignee_user.name
            case "channel":
                return ticket.channel
            case "status":
                return ticket.status
            case "created":
                return this.formatDatetime(ticket.created_datetime)
            case "updated":
                return this.formatDatetime(ticket.updated_datetime)
            case "details":
                return (
                    <div className="ui header">
                        <span
                            className="subject">{this.trim(ticket.subject, 50)}</span>
                        <div className="body sub header">
                            {this.trim(ticket.body_html ? ticket.body_html : ticket.body_text, 100)}
                        </div>
                    </div>
                )
            case "priority":
                const className = classNames(
                    "ticket-priority", ticket.priority, "flag", "icon",
                    { outline: ticket.priority !== 'high' },
                )
                return <i className={className}></i>
            case "requester":
                return ticket.requester.name
            case "tags":
                return ticket.tags.map((tag) => {
                    return <button key={tag.id} className="ui teal mini basic button tag">{tag.name}</button>
                })
            default:
                console.error("Do not know how to render column", column.name)
        }
    }

    renderField = (column) => {
        const style = {width: column.width}
        const className = classNames(column.name, "wide", "column")

        return (
            <div style={style} className={className} key={column.name}>
                {this.renderFieldContent(column)}
            </div>
        )
    }

    stopPropagation = (ev) => {
        // TODO: Do we want to keep :checked state in the DOM?
        ev.stopPropagation()
    }

    handleClick = (ev) => {
        this.props.pushState(`/ticket/${this.props.ticket.id}`)
    }

    render = () => {
        const {currentUser, ticket, pushState, columns, key} = this.props
        const style = {width: this.props.width}

        // Unfortunately need to render a new .ui.grid for every row since
        // semantic needs .rows to be a direct child of them, which react-infinite
        // doesn't allow
        return (
            <div style={style} className="ui grid" key={key}>
                <div className="ticket-item row body-row" key={ticket.id}
                    onClick={this.handleClick}>
                    <div className="one-fixed wide column">
                        <span className="ui checkbox" onClick={this.stopPropagation}>
                            <input type="checkbox" />
                            <label></label>
                        </span>
                    </div>
                    {
                        columns.map(this.renderField)
                    }
                </div>
            </div>
        )
    }
}

TicketTableRow.propTypes = {
    ticket: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    pushState: PropTypes.func.isRequired,
}
