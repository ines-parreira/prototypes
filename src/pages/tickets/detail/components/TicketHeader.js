import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'

import shortcutManager from '../../../common/utils/shortcutManager'
import EditableTitle from '../../../common/components/EditableTitle'
import TicketTags from './ticketdetails/TicketTags'
import TicketStatus from './ticketdetails/TicketStatus'
import TicketAssignee from './ticketdetails/TicketAssignee'
import TicketSpam from './ticketdetails/TicketSpam'

import * as ticketActions from '../../../../state/ticket/actions'

@connect(null, {
    deleteTicket: ticketActions.deleteTicket,
    setSpam: ticketActions.setSpam,
})
export default class TicketHeader extends React.Component {
    static propTypes = {
        ticket: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired,
        deleteTicket: PropTypes.func.isRequired,
        setSpam: PropTypes.func.isRequired,

        computeNextUrl: PropTypes.func.isRequired,
        hideTicket: PropTypes.func.isRequired,
    }

    state = {
        askDeleteConfirmation: false,
    }

    componentDidMount() {
        this._bindKeys()
    }

    _toggleStatus = (status) => {
        const newStatus = status === 'closed' ? 'open' : 'closed'
        return this._setStatus(newStatus)
    }

    _goToNextUrl = () => {
        const {computeNextUrl, hideTicket} = this.props
        const nextUrl = computeNextUrl(true)
        // redirect to the next ticket after the transition is done.
        if (nextUrl) {
            hideTicket()
            // delay redirect to let the hiding animation appear
            setTimeout(() => browserHistory.push(nextUrl), 300)
        }
    }

    _setStatus = (status) => {
        return this.props.actions.ticket.setStatus(status, () => {
            this._goToNextUrl()
        })
    }

    _toggleDeleteConfirmation = () => {
        this.setState({askDeleteConfirmation: !this.state.askDeleteConfirmation})
    }

    _deleteTicket = () => {
        this._toggleDeleteConfirmation()
        return this.props.deleteTicket(this.props.ticket.get('id')).then(() => {
            this._goToNextUrl()
        })
    }

    _toggleSpam = () => {
        return this.props.setSpam(!this.props.ticket.get('spam'))
    }

    _bindKeys() {
        shortcutManager.bind('TicketHeader', {
            CLOSE_TICKET: {
                action: () => {
                    this._setStatus('closed')
                }
            },
        })
    }

    render() {
        const {ticket, actions} = this.props

        const isUpdate = !!ticket.get('id')

        return (
            <div className="ticket-header mb-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <EditableTitle
                        title={ticket.get('subject')}
                        placeholder="Subject"
                        update={actions.ticket.setSubject}
                        focus={!ticket.get('id')}
                    />

                    {
                        isUpdate && (
                            <UncontrolledDropdown className="ml-2">
                                <DropdownToggle
                                    color="secondary"
                                    type="button"
                                    size="sm"
                                    id="ticket-actions-button"
                                >
                                    <i className="fa fa-fw fa-caret-down"/>
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            // setTimeout allows React to complete the current JS click event triggers
                                            // before printing the page
                                            setTimeout(() => {
                                                window.print()
                                            }, 1)
                                        }}
                                    >
                                        Print ticket
                                    </DropdownItem>
                                    <DropdownItem
                                        type="button"
                                        onClick={this._toggleSpam}
                                    >
                                        {ticket.get('spam') ? 'Unmark as spam' : 'Mark as spam'}
                                    </DropdownItem>
                                    <DropdownItem
                                        type="button"
                                        onClick={this._toggleDeleteConfirmation}
                                    >
                                        <div className="text-danger">
                                            Delete ticket
                                        </div>
                                        <Popover
                                            placement="bottom"
                                            isOpen={this.state.askDeleteConfirmation}
                                            target="ticket-actions-button"
                                            toggle={this._toggleDeleteConfirmation}
                                        >
                                            <PopoverTitle>Are you sure?</PopoverTitle>
                                            <PopoverContent>
                                                <p>
                                                    You are about to <b>delete</b> this ticket.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="success"
                                                    onClick={this._deleteTicket}
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverContent>
                                        </Popover>
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        )
                    }
                </div>

                <div className="d-flex justify-content-between">
                    <div className="d-inline-flex">
                        {
                            isUpdate && (
                                <TicketStatus
                                    currentStatus={ticket.get('status')}
                                    setQuickStatus={this._toggleStatus}
                                />
                            )
                        }

                        <TicketTags
                            ticketTags={ticket.get('tags')}
                            addTags={actions.ticket.addTags}
                            removeTag={actions.ticket.removeTag}
                        />
                    </div>
                    <div className="d-inline-flex">
                        <TicketSpam spam={ticket.get('spam')} />
                        <TicketAssignee
                            direction="right"
                            currentAssignee={ticket.getIn(['assignee_user', 'name'])}
                            setAgent={actions.ticket.setAgent}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
