import React, { PropTypes } from 'react'

export default class TicketSubject extends React.Component {
    onKeyDown(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    onKeyUp(e) {
        if (e.keyCode === 13 || e.keyCode === 27) {
            e.preventDefault()

            const subjectObject = this.refs.ticketSubject
            this.reinitSubject(subjectObject)

            if (e.keyCode === 13) {
                this.props.actions.setSubject(subjectObject.innerText)
            } else {
                subjectObject.innerText = this.props.ticket.get('subject')
            }
        }
    }

    onBlur() {
        const subjectObject = this.refs.ticketSubject
        this.reinitSubject(subjectObject)
        this.props.actions.setSubject(subjectObject.innerText)
    }

    reinitSubject(subjectObject) {
        subjectObject.classList.remove('edit-mode')
        subjectObject.setAttribute('contentEditable', 'false')
    }

    toggleSubjectEditMode = () => {
        const subjectObject = this.refs.ticketSubject

        subjectObject.classList.add('edit-mode')
        subjectObject.setAttribute('contentEditable', 'true')
        subjectObject.focus()
    }

    render() {
        const { ticket } = this.props
        return (
            <h1
                id="ticket-subject"
                ref="ticketSubject"
                placeholder="Subject"
                className="ui header"
                onClick={() => this.toggleSubjectEditMode()}
                onKeyDown={(e) => this.onKeyDown(e)}
                onKeyUp={(e) => this.onKeyUp(e)}
                onBlur={(e) => this.onBlur(e)}
            >
                {ticket.get('subject')}
            </h1>
        )
    }

}

TicketSubject.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
