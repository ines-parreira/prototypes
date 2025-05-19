import React, { useState } from 'react'

import classnames from 'classnames'
import { Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import moment, { Moment } from 'moment-timezone'

import { useAppNode } from 'appNode'
import { TicketStatus as TicketStatusEnum } from 'business/types/ticket'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useShortcuts from 'hooks/useShortcuts'
import EditableTitle from 'pages/common/components/EditableTitle/EditableTitle'
import MergeTicketsContainer from 'pages/common/components/MergeTickets/MergeTicketsContainer'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import { getTimezone } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import {
    addTag,
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
import { shouldDisplayAuditLogEvents as getShouldDisplayAuditLogEvents } from 'state/ticket/selectors'
import type { OnToggleUnreadFn } from 'tickets/dtp'
import { hasRole } from 'utils'

import Snooze from './Snooze'
import TicketActions, { Action } from './TicketActions'
import TicketAssignee from './TicketDetails/TicketAssignee/TicketAssignee'
import TicketSnooze from './TicketDetails/TicketSnooze'
import TicketSpam from './TicketDetails/TicketSpam'
import TicketStatus from './TicketDetails/TicketStatus'
import TicketTags from './TicketDetails/TicketTags'
import TicketTrash from './TicketDetails/TicketTrash'
import { TicketHeaderToggle } from './TicketHeaderToggle'
import TicketNavigationArrowPagination from './TicketNavigation/TicketNavigationArrowPagination'
import TicketSummaryPopover from './TicketSummaryPopover'

import css from './TicketHeader.less'

type Props = {
    ticket: Map<any, any>
    className: string
    hideTicket: () => Promise<void>
    setStatus: (status: string) => any
    onGoToNextTicket?: () => void
    onToggleUnread?: OnToggleUnreadFn
}

const TicketHeader = ({
    className,
    hideTicket,
    onGoToNextTicket,
    setStatus,
    ticket,
    onToggleUnread,
}: Props) => {
    const [askTrashConfirmation, setAskTrashConfirmation] = useState(false)
    const [isMergeTicketModalOpen, setIsMergeTicketModalOpen] = useState(false)
    const appNode = useAppNode()
    const currentUser = useAppSelector((state) => state.currentUser)
    const timezone = useAppSelector(getTimezone)
    const shouldDisplayAuditLogEvents = useAppSelector(
        getShouldDisplayAuditLogEvents,
    )
    const enableAITicketSummary = useFlags()[FeatureFlagKey.AITicketSummary]

    const dispatch = useAppDispatch()

    const actions = {
        CLOSE_TICKET: {
            action: () => {
                setStatus(TicketStatusEnum.Closed)
            },
        },
        OPEN_TICKET: {
            action: () => {
                setStatus(TicketStatusEnum.Open)
            },
        },
        MARK_TICKET_SPAM: {
            action: () => {
                toggleSpam()
            },
        },
        DELETE_TICKET: {
            action: () => {
                if (!hasRole(currentUser, UserRole.Agent)) {
                    return
                }
                toggleTrashConfirmation()
            },
        },
        HIDE_POPOVER: {
            key: 'esc',
            action: () => toggleTrashConfirmation(false),
        },
    }

    useShortcuts('TicketDetailContainer', actions)

    const toggleStatus = (status: string) => {
        const newStatus =
            status === TicketStatusEnum.Closed
                ? TicketStatusEnum.Open
                : TicketStatusEnum.Closed

        setStatus(newStatus)
    }

    const handleGoToNextTicket = () => {
        // If the history is open, we don't want to go to the next ticket
        if (ticket.getIn(['_internal', 'displayHistory'])) {
            return
        }

        if (onGoToNextTicket) {
            onGoToNextTicket()
            return
        }
        const promise = hideTicket().then(() => dispatch(clearTicket()))

        void dispatch(goToNextTicket(ticket.get('id'), promise))
    }

    const toggleTrashConfirmation = (status = !askTrashConfirmation) => {
        setAskTrashConfirmation(status)
    }

    const trashTicket = () => {
        toggleTrashConfirmation(false)
        return dispatch(
            setTrashed(moment.utc(), () => {
                handleGoToNextTicket()
            }),
        )
    }

    const unTrashTicket = () => {
        return dispatch(setTrashed(null))
    }

    const handleSnoozeTicket = (datetime: Moment | null) => {
        if (datetime) {
            return dispatch(
                snoozeTicket(datetime.format(), () => {
                    handleGoToNextTicket()
                }),
            )
        }
        void dispatch(snoozeTicket(null))
    }

    const toggleSpam = () => {
        const spam = !ticket.get('spam')
        void dispatch(
            setSpam(spam, () => {
                if (spam) {
                    handleGoToNextTicket()
                }
            }),
        )
    }

    const toggleMergeTicketModal = () => {
        setIsMergeTicketModalOpen(!isMergeTicketModalOpen)
    }

    const toggleAuditLogEvents = () => {
        if (!shouldDisplayAuditLogEvents) {
            void dispatch(
                displayAuditLogEvents(
                    ticket.get('id'),
                    (ticket.get('satisfaction_survey') as Map<any, any>)?.get(
                        'id',
                    ),
                ),
            )
        } else {
            dispatch(hideAuditLogEvents())
        }
    }

    const isUpdate = !!ticket.get('id')
    const isTrashed = !!ticket.get('trashed_datetime')
    const snoozedUntil: string = ticket.get('snooze_datetime')

    const handlePrint = () => {
        logEvent(SegmentEvent.PrintTicketClicked)
        // setTimeout allows React to complete the current JS click event triggers
        // before printing the page
        setTimeout(() => {
            window.open(`/app/ticket/${ticket.get('id') as number}/print`)
        }, 1)
    }

    const markUnread = async () => {
        await dispatch(
            ticketPartialUpdate({
                is_unread: true,
            }),
        )

        onToggleUnread?.(ticket.get('id'), true)
        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: 'Ticket has been marked as unread',
            }),
        )
    }

    const createActions = (onDisplayConfirmation: () => void) => {
        const actions: Action[] = []
        actions.push(['Merge ticket', 'call_merge', toggleMergeTicketModal])

        if (!ticket.get('is_unread'))
            actions.push(['Mark as unread', 'markunread_mailbox', markUnread])

        if (shouldDisplayAuditLogEvents) {
            actions.push([
                'Hide all events',
                'event_note',
                toggleAuditLogEvents,
            ])
        } else {
            actions.push([
                'Show all events',
                'event_note',
                toggleAuditLogEvents,
            ])
        }

        actions.push(['Print ticket', 'print', handlePrint])

        if (ticket.get('spam')) {
            actions.push(['Unmark as spam', 'undo', toggleSpam])
        } else {
            actions.push(['Mark as spam', 'not_interested', toggleSpam])
        }

        if (hasRole(currentUser, UserRole.Agent)) {
            if (isTrashed) {
                actions.push(['Undelete', 'undo', unTrashTicket])
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
        <div className={classnames(css.component, className)} id="TicketHeader">
            <div className={css.title}>
                <TicketHeaderToggle />
                <EditableTitle
                    className={css.editableTitleWrapper}
                    inputClassName={css.editableTitle}
                    title={ticket.get('subject')}
                    placeholder="Subject"
                    update={(subject) => dispatch(setSubject(subject))}
                    focus={!ticket.get('id')}
                    maxLength={998}
                />

                <div className={css.actions}>
                    {enableAITicketSummary && <TicketSummaryPopover />}
                    <TicketSnooze datetime={snoozedUntil} timezone={timezone} />

                    <TicketNavigationArrowPagination
                        ticketId={ticket.get('id')}
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
                        <>
                            <Snooze
                                until={snoozedUntil}
                                onUpdate={handleSnoozeTicket}
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
                                onConfirm={trashTicket}
                                toggle={() => setAskTrashConfirmation(false)}
                            >
                                {({ onDisplayConfirmation }) => (
                                    <TicketActions
                                        actions={createActions(
                                            onDisplayConfirmation,
                                        )}
                                    />
                                )}
                            </ConfirmationPopover>
                        </>
                    )}
                </div>
            </div>

            <div className={css.secondRow}>
                <div className={css.statusAndTags}>
                    {isUpdate && (
                        <TicketStatus
                            currentStatus={ticket.get('status')}
                            setQuickStatus={toggleStatus}
                        />
                    )}

                    <TicketTags
                        className={css.tags}
                        ticketTags={ticket.get('tags')?.toJS() || []}
                        addTag={(tag) => dispatch(addTag(tag))}
                        removeTag={(tag) => dispatch(removeTag(tag))}
                        transparent
                        shouldBindKeys
                    />
                </div>
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
                    setUser={(user) => void dispatch(setAgent(user))}
                    setTeam={(team) => void dispatch(setTeam(team))}
                    transparent
                    bindKeys
                    dropdownContainer={appNode ?? undefined}
                />
            </div>

            <MergeTicketsContainer
                sourceTicket={ticket}
                isOpen={isMergeTicketModalOpen}
                toggleModal={toggleMergeTicketModal}
            />
        </div>
    )
}

export default TicketHeader
