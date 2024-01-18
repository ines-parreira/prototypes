import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import moment, {Moment} from 'moment-timezone'
import classnames from 'classnames'
import {Map} from 'immutable'

import {withAppNode, WithAppNodeProps} from 'appNode'
import {TicketStatus as TicketStatusEnum} from 'business/types/ticket'
import {logEvent, SegmentEvent} from 'common/segment'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import MergeTicketsContainer from 'pages/common/components/MergeTickets/MergeTicketsContainer'
import EditableTitle from 'pages/common/components/EditableTitle'
import {
    addTags,
    clearTicket,
    displayAuditLogEvents,
    goToNextTicket,
    hideAuditLogEvents,
    removeTag,
    setAgent,
    setSpam,
    setSubject,
    setTeam,
    setTrashed,
    snoozeTicket,
    ticketPartialUpdate,
} from 'state/ticket/actions'
import {notify} from 'state/notifications/actions'
import {shouldDisplayAuditLogEvents} from 'state/ticket/selectors'
import {getTimezone} from 'state/currentUser/selectors'
import {RootState} from 'state/types'
import {NotificationStatus} from 'state/notifications/types'
import {UserRole} from 'config/types/user'
import shortcutManager from 'services/shortcutManager'
import {hasRole} from 'utils'

import Snooze from './Snooze'
import TicketActions, {Action} from './TicketActions'
import TicketTags from './TicketDetails/TicketTags'
import TicketStatus from './TicketDetails/TicketStatus'
import TicketAssignee from './TicketDetails/TicketAssignee/TicketAssignee'
import TicketSpam from './TicketDetails/TicketSpam'
import TicketSnooze from './TicketDetails/TicketSnooze'
import TicketTrash from './TicketDetails/TicketTrash'
import TicketNavigationArrowPagination from './TicketNavigation/TicketNavigationArrowPagination'
import css from './TicketHeader.less'

type Props = {
    ticket: Map<any, any>
    className: string
    hideTicket: () => Promise<void>
    setStatus: (status: string) => any
} & ConnectedProps<typeof connector> &
    WithAppNodeProps

type State = {
    askTrashConfirmation: boolean
    isMergeTicketModalOpen: boolean
}

export class TicketHeaderContainer extends React.Component<Props, State> {
    state = {
        askTrashConfirmation: false,
        isMergeTicketModalOpen: false,
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _toggleStatus = (status: string) => {
        const newStatus =
            status === TicketStatusEnum.Closed
                ? TicketStatusEnum.Open
                : TicketStatusEnum.Closed

        this.props.setStatus(newStatus)
    }

    _goToNextTicket = () => {
        const {hideTicket, goToNextTicket, clearTicket, ticket} = this.props

        // If the history is open, we don't want to go to the next ticket
        if (ticket.getIn(['_internal', 'displayHistory'])) {
            return
        }

        const promise = hideTicket().then(clearTicket)

        void goToNextTicket(this.props.ticket.get('id'), promise)
    }

    _toggleTrashConfirmation = (status = !this.state.askTrashConfirmation) => {
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

    _snoozeTicket = (datetime: Moment | null) => {
        const {snoozeTicket} = this.props

        if (datetime) {
            return this.props.snoozeTicket(datetime.format(), () => {
                this._goToNextTicket()
            })
        }
        void snoozeTicket(null)
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
        const shouldDisplayAuditLogEvents =
            !this.props.shouldDisplayAuditLogEvents

        if (shouldDisplayAuditLogEvents) {
            void displayAuditLogEvents(ticket.get('id'))
        } else {
            hideAuditLogEvents()
        }
    }

    _bindKeys() {
        const {currentUser} = this.props
        shortcutManager.bind('TicketDetailContainer', {
            CLOSE_TICKET: {
                action: () => {
                    void this.props.setStatus(TicketStatusEnum.Closed)
                },
            },
            OPEN_TICKET: {
                action: () => {
                    void this.props.setStatus(TicketStatusEnum.Open)
                },
            },
            MARK_TICKET_SPAM: {
                action: () => {
                    void this._toggleSpam()
                },
            },
            DELETE_TICKET: {
                action: () => {
                    if (!hasRole(currentUser, UserRole.Agent)) {
                        return
                    }
                    this._toggleTrashConfirmation()
                },
            },
            HIDE_POPOVER: {
                key: 'esc',
                action: () => this._toggleTrashConfirmation(false),
            },
        })
    }

    render() {
        const {
            addTags,
            className,
            currentUser,
            removeTag,
            setAgent,
            setSubject,
            setTeam,
            shouldDisplayAuditLogEvents,
            ticket,
            timezone,
            notify,
            ticketPartialUpdate,
            appNode,
        } = this.props
        const {askTrashConfirmation} = this.state
        const isUpdate = !!ticket.get('id')
        const isTrashed = !!ticket.get('trashed_datetime')
        const snoozedUntil = ticket.get('snooze_datetime')

        const handlePrint = () => {
            logEvent(SegmentEvent.PrintTicketClicked)
            // setTimeout allows React to complete the current JS click event triggers
            // before printing the page
            setTimeout(() => {
                window.open(`/app/ticket/${ticket.get('id') as number}/print`)
            }, 1)
        }

        const markUnread = async () => {
            await ticketPartialUpdate({
                is_unread: true,
            })
            void notify({
                status: NotificationStatus.Success,
                message: 'Ticket has been marked as unread',
            })
        }

        const createActions = (onDisplayConfirmation: () => void) => {
            const actions: Action[] = []
            actions.push([
                'Merge ticket',
                'call_merge',
                this._toggleMergeTicketModal,
            ])

            if (!ticket.get('is_unread'))
                actions.push([
                    'Mark as unread',
                    'markunread_mailbox',
                    markUnread,
                ])

            if (shouldDisplayAuditLogEvents) {
                actions.push([
                    'Hide all events',
                    'event_note',
                    this._toggleAuditLogEvents,
                ])
            } else {
                actions.push([
                    'Show all events',
                    'event_note',
                    this._toggleAuditLogEvents,
                ])
            }

            actions.push(['Print ticket', 'print', handlePrint])

            if (ticket.get('spam')) {
                actions.push(['Unmark as spam', 'undo', this._toggleSpam])
            } else {
                actions.push([
                    'Mark as spam',
                    'not_interested',
                    this._toggleSpam,
                ])
            }

            if (hasRole(currentUser, UserRole.Agent)) {
                if (isTrashed) {
                    actions.push(['Undelete', 'undo', this._unTrashTicket])
                } else {
                    actions.push([
                        'Delete',
                        'delete',
                        onDisplayConfirmation,
                        'delete',
                    ])
                }
            }

            return actions
        }

        return (
            <div
                className={classnames(css.component, className)}
                id="TicketHeader"
            >
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <EditableTitle
                        className="mr-2"
                        title={ticket.get('subject')}
                        placeholder="Subject"
                        update={setSubject}
                        focus={!ticket.get('id')}
                    />

                    <div className="d-flex justify-content-between align-items-center ml-3">
                        <TicketSnooze
                            datetime={snoozedUntil}
                            timezone={timezone}
                        />

                        <TicketNavigationArrowPagination
                            ticketId={ticket.get('id')}
                        />

                        <TicketTrash
                            className={css.headerIcon}
                            trashed={
                                isTrashed &&
                                !ticket.getIn([
                                    '_internal',
                                    'loading',
                                    'setTrash',
                                ])
                            }
                        />

                        <TicketSpam
                            className={css.headerIcon}
                            spam={
                                ticket.get('spam') &&
                                !ticket.getIn([
                                    '_internal',
                                    'loading',
                                    'setSpam',
                                ])
                            }
                        />

                        {isUpdate && (
                            <>
                                <Snooze
                                    until={snoozedUntil}
                                    onUpdate={this._snoozeTicket}
                                />
                                <ConfirmationPopover
                                    buttonProps={{
                                        autoFocus: true,
                                        intent: 'destructive',
                                    }}
                                    content={
                                        <>
                                            You are about to <b>delete</b> this
                                            ticket.
                                        </>
                                    }
                                    fade={false}
                                    id="ticket-actions-button"
                                    isOpen={askTrashConfirmation}
                                    onConfirm={this._trashTicket}
                                    toggle={() =>
                                        this.setState({
                                            askTrashConfirmation: false,
                                        })
                                    }
                                >
                                    {({onDisplayConfirmation}) => (
                                        <TicketActions
                                            actions={createActions(
                                                onDisplayConfirmation
                                            )}
                                        />
                                    )}
                                </ConfirmationPopover>
                            </>
                        )}
                    </div>
                </div>

                <div className="d-flex justify-content-between">
                    <div
                        className={classnames(
                            css.statusAndTags,
                            'd-inline-flex'
                        )}
                    >
                        {isUpdate && (
                            <TicketStatus
                                currentStatus={ticket.get('status')}
                                setQuickStatus={this._toggleStatus}
                            />
                        )}

                        <TicketTags
                            ticketTags={ticket.get('tags')}
                            addTag={addTags}
                            removeTag={removeTag}
                            transparent
                            bindKeys
                        />
                    </div>
                    <div className="d-inline-flex align-items-top">
                        <TicketAssignee
                            menuDirection="right"
                            direction="down"
                            currentAssigneeUser={ticket.get('assignee_user')}
                            currentAssigneeTeam={ticket.get('assignee_team')}
                            profilePictureUrl={ticket.getIn([
                                'assignee_user',
                                'meta',
                                'profile_picture_url',
                            ])}
                            setUser={setAgent}
                            setTeam={setTeam}
                            transparent
                            bindKeys
                            dropdownContainer={appNode ?? undefined}
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
    (state: RootState) => ({
        currentUser: state.currentUser,
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
        setSubject,
        setTeam,
        setTrashed,
        snoozeTicket,
        ticketPartialUpdate,
    }
)

export default connector(withAppNode(TicketHeaderContainer))
