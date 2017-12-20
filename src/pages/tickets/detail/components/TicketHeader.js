import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
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

import shortcutManager from '../../../../services/shortcutManager'
import EditableTitle from '../../../common/components/EditableTitle'
import TicketTags from './ticketdetails/TicketTags'
import TicketCategory from './ticketdetails/TicketCategory'
import TicketStatus from './ticketdetails/TicketStatus'
import TicketAssignee from './ticketdetails/TicketAssignee'
import TicketSpam from './ticketdetails/TicketSpam'
import TicketTrash from './ticketdetails/TicketTrash'

import * as ticketActions from '../../../../state/ticket/actions'

@connect(null, {
    setTrashed: ticketActions.setTrashed,
    setSpam: ticketActions.setSpam,
})
export default class TicketHeader extends React.Component {
    static propTypes = {
        ticket: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired,
        setTrashed: PropTypes.func.isRequired,
        setSpam: PropTypes.func.isRequired,

        computeNextUrl: PropTypes.func.isRequired,
        hideTicket: PropTypes.func.isRequired,
    }

    state = {
        askTrashConfirmation: false,
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
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

    _toggleTrashConfirmation = (state = !this.state.askTrashConfirmation) => {
        this.setState({askTrashConfirmation: state})
    }

    _trashTicket = () => {
        this._toggleTrashConfirmation(false)
        return this.props.setTrashed(moment.utc(), () => {
            this._goToNextUrl()
        })
    }

    _unTrashTicket = () => {
        return this.props.setTrashed(null)
    }

    _toggleSpam = () => {
        const spam = !this.props.ticket.get('spam')
        return this.props.setSpam(spam, () => {
            if (spam) {
                this._goToNextUrl()
            }
        })
    }

    _bindKeys() {
        shortcutManager.bind('TicketDetailContainer', {
            CLOSE_TICKET: {
                action: () => {
                    this._setStatus('closed')
                }
            },
            OPEN_TICKET: {
                action: () => {
                    this._setStatus('open')
                }
            },
            DELETE_TICKET: {
                action: () => {
                    this._toggleTrashConfirmation()
                }
            },
            HIDE_POPOVER: {
                key: 'esc',
                action: () => this._toggleTrashConfirmation(false)
            },
        })
    }

    render() {
        const {ticket, actions} = this.props
        const isUpdate = !!ticket.get('id')
        const isTrashed = !!ticket.get('trashed_datetime')

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
                                    <i className="fa fa-fw fa-caret-down" />
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
                                    {
                                        isTrashed ? (
                                            <DropdownItem
                                                type="button"
                                                onClick={this._unTrashTicket}
                                            >
                                                Undelete
                                            </DropdownItem>
                                        ) : (
                                            <DropdownItem
                                                type="button"
                                                onClick={() => this._toggleTrashConfirmation()}
                                            >
                                                <div className="text-danger">
                                                    Delete
                                                </div>
                                                <Popover
                                                    placement="bottom"
                                                    isOpen={this.state.askTrashConfirmation}
                                                    target="ticket-actions-button"
                                                    toggle={() => this._toggleTrashConfirmation()}
                                                >
                                                    <PopoverTitle>Are you sure?</PopoverTitle>
                                                    <PopoverContent>
                                                        <p>
                                                            You are about to <b>delete</b> this ticket.
                                                        </p>
                                                        <Button
                                                            type="submit"
                                                            color="success"
                                                            onClick={this._trashTicket}
                                                            autoFocus
                                                        >
                                                            Confirm
                                                        </Button>
                                                    </PopoverContent>
                                                </Popover>
                                            </DropdownItem>
                                        )}
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

                        <TicketCategory
                            category={ticket.get('category')}
                            removeCategory={actions.ticket.removeCategory}
                        />

                        <TicketTags
                            ticketTags={ticket.get('tags')}
                            addTags={actions.ticket.addTags}
                            removeTag={actions.ticket.removeTag}
                        />
                    </div>
                    <div className="d-inline-flex">
                        <TicketTrash trashed={isTrashed} />
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
