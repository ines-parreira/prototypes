import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'
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
            console.error(`Failed stripHTML: ${e}`, text)
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
            formatted = moment(datetime).tz(this.props.currentUser.get('timezone') || 'UTC').calendar()
        }
        return formatted
    }

    handleClick = () => {
        this.props.saveIndex(this.props.curIndex)
        browserHistory.push(`/app/ticket/${this.props.ticket.id}`)
    }

    stopPropagation = (ev) => {
        // TODO: Do we want to keep :checked state in the DOM?
        ev.stopPropagation()
    }

    renderFieldContent = (column) => {
        const { ticket } = this.props
        switch (column.name) {
            case 'assignee':
                if (!ticket.assignee_user)
                    return null
                return ticket.assignee_user.name
            case 'channel':
                return ticket.channel
            case 'status':
                return (
                    <span className={`ticket-status ticket-details-item ui ${ticket.status} label`}>
                        {ticket.status}
                    </span>
                )
            case 'created':
                return this.formatDatetime(ticket.created_datetime)
            case 'updated':
                return this.formatDatetime(ticket.updated_datetime)
            case 'details':
                const firstMessage = ticket.messages[0]
                return (
                    <div className="ui header">
                        <span
                            className="subject"
                        >{this.trim(ticket.subject, 50)}</span>
                        <div className="body sub header">
                            {this.trim(firstMessage.body_html ? firstMessage.body_html : firstMessage.body_text, 100)}
                        </div>
                    </div>
                )
            case 'priority':
                const className = classNames(
                    'ticket-priority', ticket.priority, 'flag', 'icon',
                    { outline: ticket.priority !== 'high' },
                )
                return <i className={className}></i>
            case 'requester':
                return ticket.requester.name
            case 'tags':
                return ticket.tags.map((tag) => {
                    return <button key={tag.id} className="ui light blue mini basic label">{tag.name}</button>
                })
            default:
                console.error('Do not know how to render column ', column.name)
        }
    }

    renderField = (column) => {
        const style = { minWidth: column.width }
        const className = classNames(column.name, 'wide', 'column')

        return (
            <div style={style} className={className} key={column.name}>
                {this.renderFieldContent(column)}
            </div>
        )
    }

    render = () => {
        const { columns } = this.props
        const style = { maxWidth: this.props.width }

        // Unfortunately need to render a new .ui.grid for every row since
        // semantic needs .rows to be a direct child of them, which react-infinite
        // doesn't allow
        return (
            <div style={style} className="ui grid">
                <div className="ticket-item row body-row"
                    onClick={this.handleClick}
                >
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
    view: PropTypes.string,
    page: PropTypes.number,
    currentUser: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    columns: PropTypes.array.isRequired,
    curIndex: PropTypes.number.isRequired,
    saveIndex: PropTypes.func.isRequired
}
