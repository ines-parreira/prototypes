// @flow
import React from 'react'
import {connect} from 'react-redux'
import moment, {type Moment} from 'moment-timezone'
import classnames from 'classnames'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Popover,
    PopoverHeader,
    PopoverBody,
} from 'reactstrap'

import type {Map} from 'immutable'

import shortcutManager from '../../../../services/shortcutManager/index.ts'
import EditableTitle from '../../../common/components/EditableTitle.tsx'
import MergeTicketsContainer from '../../../common/components/MergeTickets/MergeTicketsContainer.tsx'
import {notify} from '../../../../state/notifications/actions.ts'
import {
    addTags,
    clearTicket,
    displayAuditLogEvents,
    goToNextTicket,
    hideAuditLogEvents,
    removeTag,
    setAgent,
    setSpam,
    setStatus,
    setSubject,
    setTeam,
    setTrashed,
    snoozeTicket,
    ticketPartialUpdate,
} from '../../../../state/ticket/actions.ts'
import {shouldDisplayAuditLogEvents} from '../../../../state/ticket/selectors.ts'
import {getTimezone} from '../../../../state/currentUser/selectors.ts'
import {NOTIFICATION_STATUS} from '../../../../state/notifications/constants.ts'

import TicketTags from './TicketDetails/TicketTags'
import TicketStatus from './TicketDetails/TicketStatus'
import TicketAssignee from './TicketDetails/TicketAssignee'
import TicketSpam from './TicketDetails/TicketSpam'
import TicketSnooze from './TicketDetails/TicketSnooze.tsx'
import TicketSnoozePicker from './TicketDetails/TicketSnoozePicker.tsx'
import TicketTrash from './TicketDetails/TicketTrash'

import css from './TicketHeader.less'

type Props = {
    ticket: Map<any, any>,
    timezone: string,
    addTags: typeof addTags,
    className: string,
    clearTicket: typeof clearTicket,
    displayAuditLogEvents: typeof displayAuditLogEvents,
    goToNextTicket: typeof goToNextTicket,
    hideAuditLogEvents: typeof hideAuditLogEvents,
    hideTicket: () => Promise<*>,
    notify: typeof notify,
    removeTag: typeof removeTag,
    setAgent: typeof setAgent,
    setSpam: typeof setSpam,
    setStatus: typeof setStatus,
    setSubject: typeof setSubject,
    setTeam: typeof setTeam,
    setTrashed: typeof setTrashed,
    shouldDisplayAuditLogEvents: boolean,
    snoozeTicket: typeof snoozeTicket,
    ticketPartialUpdate: typeof ticketPartialUpdate,
}

type State = {
    askTrashConfirmation: boolean,
    showSnoozePicker: boolean,
    isMergeTicketModalOpen: boolean,
}

export class TicketHeaderContainer extends React.Component<Props, State> {
    state = {
        askTrashConfirmation: false,
        showSnoozePicker: false,
        isMergeTicketModalOpen: false,
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _toggleStatus = (status: string) => {
        const newStatus = status === 'closed' ? 'open' : 'closed'
        return this._setStatus(newStatus)
    }

    _goToNextTicket = () => {
        const {hideTicket, goToNextTicket, clearTicket, ticket} = this.props

        // If the history is open, we don't want to go to the next ticket
        if (ticket.getIn(['_internal', 'displayHistory'])) {
            return
        }

        const promise = hideTicket().then(clearTicket)

        goToNextTicket(this.props.ticket.get('id'), promise)
    }

    _setStatus = (status: string) => {
        const {notify, setStatus} = this.props

        return setStatus(status, () => {
            notify({
                status: 'success',
                message: 'Ticket has been closed',
            })
            this._goToNextTicket()
        })
    }

    _toggleTrashConfirmation = (
        status: boolean = !this.state.askTrashConfirmation
    ) => {
        this.setState({askTrashConfirmation: status})
    }

    _trashTicket = () => {
        this._toggleTrashConfirmation(false)
        return this.props.setTrashed(moment.utc(), () => {
            this._goToNextTicket()
        })
    }

    _unTrashTicket = () => {
        return this.props.setTrashed(null)
    }

    _snoozeTicket = (datetime: Moment) => {
        return this.props.snoozeTicket(datetime.format(), () => {
            this._goToNextTicket()
        })
    }

    _toggleSnoozePicker = () => {
        this.setState({showSnoozePicker: !this.state.showSnoozePicker})
    }

    _toggleSpam = () => {
        const spam = !this.props.ticket.get('spam')
        return this.props.setSpam(spam, () => {
            if (spam) {
                this._goToNextTicket()
            }
        })
    }

    _toggleMergeTicketModal = () => {
        this.setState({
            isMergeTicketModalOpen: !this.state.isMergeTicketModalOpen,
        })
    }

    _toggleAuditLogEvents = () => {
        const {displayAuditLogEvents, hideAuditLogEvents, ticket} = this.props
        const shouldDisplayAuditLogEvents = !this.props
            .shouldDisplayAuditLogEvents

        if (shouldDisplayAuditLogEvents) {
            displayAuditLogEvents(ticket.get('id'))
        } else {
            hideAuditLogEvents()
        }
    }

    _bindKeys() {
        shortcutManager.bind('TicketDetailContainer', {
            CLOSE_TICKET: {
                action: () => {
                    this._setStatus('closed')
                },
            },
            OPEN_TICKET: {
                action: () => {
                    this._setStatus('open')
                },
            },
            DELETE_TICKET: {
                action: () => {
                    this._toggleTrashConfirmation()
                },
            },
            HIDE_POPOVER: {
                key: 'esc',
                action: () => this._toggleTrashConfirmation(false),
            },
            OPEN_SNOOZE_TICKET: {
                action: () => {
                    this._toggleSnoozePicker()
                },
            },
            CLOSE_SNOOZE_TICKET: {
                key: 'esc',
                action: () => {
                    if (this.state.showSnoozePicker) {
                        this._toggleSnoozePicker()
                    }
                },
            },
        })
    }

    render() {
        const {
            addTags,
            className,
            removeTag,
            setAgent,
            setSubject,
            setTeam,
            shouldDisplayAuditLogEvents,
            ticket,
            timezone,
            notify,
            ticketPartialUpdate,
        } = this.props
        const {showSnoozePicker} = this.state
        const isUpdate = !!ticket.get('id')
        const isTrashed = !!ticket.get('trashed_datetime')

        return (
            <div className={classnames(css.component, className)}>
                <div className="d-flex justify-content-between mb-2">
                    <EditableTitle
                        className={classnames('mr-2', css.editableTitle)}
                        title={ticket.get('subject')}
                        placeholder="Subject"
                        update={setSubject}
                        focus={!ticket.get('id')}
                    />

                    <TicketSnooze
                        className={css.headerIcon}
                        datetime={ticket.get('snooze_datetime')}
                        timezone={timezone}
                    />

                    <TicketTrash
                        className={css.headerIcon}
                        trashed={
                            isTrashed &&
                            !ticket.getIn(['_internal', 'loading', 'setTrash'])
                        }
                    />

                    <TicketSpam
                        className={css.headerIcon}
                        spam={
                            ticket.get('spam') &&
                            !ticket.getIn(['_internal', 'loading', 'setSpam'])
                        }
                    />

                    {isUpdate && (
                        <UncontrolledDropdown>
                            <DropdownToggle
                                color="secondary"
                                type="button"
                                size="sm"
                                id="ticket-actions-button"
                                className="btn-transparent"
                            >
                                <i className="material-icons md-2">more_vert</i>
                            </DropdownToggle>
                            <TicketSnoozePicker
                                datetime={ticket.get('snooze_datetime')}
                                timezone={timezone}
                                isOpen={showSnoozePicker}
                                toggle={this._toggleSnoozePicker}
                                onSubmit={this._snoozeTicket}
                            />
                            <DropdownMenu right className={css.actionsDropdown}>
                                <DropdownItem
                                    type="button"
                                    onClick={this._toggleSnoozePicker}
                                >
                                    <i className="icon material-icons">
                                        snooze
                                    </i>
                                    Snooze
                                </DropdownItem>
                                <DropdownItem
                                    type="button"
                                    onClick={this._toggleMergeTicketModal}
                                >
                                    <i className="icon material-icons">
                                        call_merge
                                    </i>
                                    Merge ticket
                                </DropdownItem>
                                {!ticket.get('is_unread') && (
                                    <DropdownItem
                                        type="button"
                                        onClick={async () => {
                                            await ticketPartialUpdate({
                                                is_unread: true,
                                            })
                                            void notify({
                                                status:
                                                    NOTIFICATION_STATUS.SUCCESS,
                                                message:
                                                    'Ticket has been marked as unread',
                                            })
                                        }}
                                    >
                                        <i className="icon material-icons">
                                            markunread_mailbox
                                        </i>
                                        Mark as unread
                                    </DropdownItem>
                                )}
                                <DropdownItem
                                    type="button"
                                    onClick={this._toggleAuditLogEvents}
                                >
                                    <i className="icon material-icons">
                                        event_note
                                    </i>
                                    {shouldDisplayAuditLogEvents
                                        ? 'Hide'
                                        : 'Display'}{' '}
                                    all events
                                </DropdownItem>
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
                                    <i className="icon material-icons">print</i>
                                    Print ticket
                                </DropdownItem>
                                <DropdownItem
                                    type="button"
                                    onClick={this._toggleSpam}
                                >
                                    {ticket.get('spam') ? (
                                        <span>
                                            <i className="icon material-icons">
                                                undo
                                            </i>
                                            unmark as spam
                                        </span>
                                    ) : (
                                        <span>
                                            <i className="icon material-icons">
                                                not_interested
                                            </i>
                                            Mark as spam
                                        </span>
                                    )}
                                </DropdownItem>
                                {isTrashed ? (
                                    <DropdownItem
                                        type="button"
                                        onClick={this._unTrashTicket}
                                    >
                                        <i className="icon material-icons">
                                            undo
                                        </i>
                                        Undelete
                                    </DropdownItem>
                                ) : (
                                    <DropdownItem
                                        type="button"
                                        onClick={() =>
                                            this._toggleTrashConfirmation()
                                        }
                                    >
                                        <div className="text-danger">
                                            <i className="icon material-icons">
                                                delete
                                            </i>
                                            Delete
                                        </div>
                                        <Popover
                                            placement="bottom"
                                            isOpen={
                                                this.state.askTrashConfirmation
                                            }
                                            target="ticket-actions-button"
                                            toggle={() =>
                                                this._toggleTrashConfirmation()
                                            }
                                            trigger="legacy"
                                            fade={false}
                                        >
                                            <PopoverHeader>
                                                Are you sure?
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <p>
                                                    You are about to{' '}
                                                    <b>delete</b> this ticket.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="success"
                                                    onClick={this._trashTicket}
                                                    autoFocus
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverBody>
                                        </Popover>
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    )}
                </div>

                <div className="d-flex justify-content-between">
                    <div className="d-inline-flex">
                        {isUpdate && (
                            <TicketStatus
                                currentStatus={ticket.get('status')}
                                setQuickStatus={this._toggleStatus}
                            />
                        )}

                        <TicketTags
                            ticketTags={ticket.get('tags')}
                            addTags={addTags}
                            removeTag={removeTag}
                            transparent
                        />
                    </div>
                    <div className="d-inline-flex align-items-top">
                        <TicketAssignee
                            direction="right"
                            currentAssigneeUser={ticket.get('assignee_user')}
                            currentAssigneeTeam={ticket.get('assignee_team')}
                            profilePictureUrl={ticket.getIn([
                                'assignee_user',
                                'meta',
                                'profile_picture_url',
                            ])}
                            setUser={setAgent}
                            setTeam={setTeam}
                            className={css.assignee}
                            transparent
                        />
                    </div>
                </div>

                <MergeTicketsContainer
                    sourceTicket={ticket}
                    isOpen={this.state.isMergeTicketModalOpen}
                    toggleModal={this._toggleMergeTicketModal}
                />
            </div>
        )
    }
}

const connector = connect(
    (state) => ({
        timezone: getTimezone(state),
        shouldDisplayAuditLogEvents: shouldDisplayAuditLogEvents(state),
    }),
    {
        addTags,
        clearTicket,
        displayAuditLogEvents,
        goToNextTicket,
        hideAuditLogEvents,
        notify,
        removeTag,
        setAgent,
        setSpam,
        setStatus,
        setSubject,
        setTeam,
        setTrashed,
        snoozeTicket,
        ticketPartialUpdate,
    }
)

export default connector(TicketHeaderContainer)
