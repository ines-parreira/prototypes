import { useCallback, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useTitle } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageTranslationDisplay,
    useTicketsTranslatedProperties,
} from '@repo/tickets'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { useShortcuts } from '@repo/utils'
import classnames from 'classnames'
import type { Map } from 'immutable'
import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'

import { LegacyIconButton, LegacyTooltip as Tooltip } from '@gorgias/axiom'
import type { Language, TicketPriority } from '@gorgias/helpdesk-types'

import { useAppNode } from 'appNode'
import { TicketStatus as TicketStatusEnum } from 'business/types/ticket'
import { UserRole } from 'config/types/user'
import { IntlDisplayNames } from 'constants/languages'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
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
    setShouldDisplayAllFollowUps,
    setSpam,
    setSubject,
    setTeam,
    setTrashed,
    snoozeTicket,
    ticketPartialUpdate,
} from 'state/ticket/actions'
import {
    getShouldDisplayAllFollowUps,
    shouldDisplayAuditLogEvents as getShouldDisplayAuditLogEvents,
} from 'state/ticket/selectors'
import type { OnToggleUnreadFn } from 'tickets/dtp'
import { hasRole } from 'utils'

import Snooze from './Snooze'
import type { Action } from './TicketActions'
import TicketActions from './TicketActions'
import TicketAssignee from './TicketDetails/TicketAssignee/TicketAssignee'
import TicketSnooze from './TicketDetails/TicketSnooze'
import TicketSpam from './TicketDetails/TicketSpam'
import TicketStatus from './TicketDetails/TicketStatus'
import TicketTags from './TicketDetails/TicketTags'
import TicketTrash from './TicketDetails/TicketTrash'
import { TicketHeaderToggle } from './TicketHeaderToggle'
import TicketNavigationArrowPagination from './TicketNavigation/TicketNavigationArrowPagination'
import TicketPriorityDropdown from './TicketPriorityDropdown'
import { TicketSubjectLoadingState } from './TicketSubjectLoadingState'
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
    const translateIconRef = useRef<HTMLButtonElement>(null)

    const [askTrashConfirmation, setAskTrashConfirmation] = useState(false)
    const [isMergeTicketModalOpen, setIsMergeTicketModalOpen] = useState(false)
    const appNode = useAppNode()
    const currentUser = useAppSelector((state) => state.currentUser)
    const timezone = useAppSelector(getTimezone)
    const shouldDisplayAuditLogEvents = useAppSelector(
        getShouldDisplayAuditLogEvents,
    )
    const enableAITicketSummary = useFlag(FeatureFlagKey.AITicketSummary)
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
    const smartFollowUpsEnabled = useFlag(FeatureFlagKey.SmartFollowUps)
    const {
        setAllTicketMessagesToOriginal,
        setAllTicketMessagesToTranslated,
        allMessageDisplayState,
    } = useTicketMessageTranslationDisplay()

    const { primary, shouldShowTranslatedContent } =
        useCurrentUserLanguagePreferences()
    const { translationMap, updateTicketTranslatedSubject, isInitialLoading } =
        useTicketsTranslatedProperties({
            ticket_ids: [ticket.get('id')],
            ticketsRequiresTranslations: shouldShowTranslatedContent(
                ticket.get('language') as Language,
            ),
        })

    const isSubjectLoading = useMemo(() => {
        if (
            !shouldShowTranslatedContent(ticket.get('language')) ||
            !ticket.get('id')
        )
            return false
        return isInitialLoading
    }, [shouldShowTranslatedContent, isInitialLoading, ticket])

    const shouldDisplayAllFollowUps = useAppSelector(
        getShouldDisplayAllFollowUps,
    )

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

    const toggleFollowUps = () => {
        logEvent(SegmentEvent.SmartFollowUpsVisibilityControlClicked, {
            // Propagating the next visibility state after the toggle.
            visibility: shouldDisplayAllFollowUps ? 'hidden' : 'visible',
        })
        dispatch(setShouldDisplayAllFollowUps(!shouldDisplayAllFollowUps))
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

        if (smartFollowUpsEnabled) {
            const actionLabel = shouldDisplayAllFollowUps
                ? 'Hide all quick-replies'
                : 'Show all quick-replies'
            actions.push([actionLabel, 'assistant', toggleFollowUps])
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

    const handlePriorityChange = async (priority: TicketPriority) => {
        await dispatch(
            ticketPartialUpdate({
                priority,
            }),
        )
    }

    const handleSubjectChange = (subject: string) => {
        dispatch(setSubject(subject))
        updateTicketTranslatedSubject(ticket.get('id'), subject)
    }

    const handleTranslateAllMessages = useCallback(() => {
        if (allMessageDisplayState === DisplayedContent.Translated) {
            setAllTicketMessagesToOriginal()
        } else {
            setAllTicketMessagesToTranslated()
        }
    }, [
        allMessageDisplayState,
        setAllTicketMessagesToOriginal,
        setAllTicketMessagesToTranslated,
    ])

    const translatedSubject = translationMap[ticket.get('id')]?.subject
    const title = useMemo(() => {
        if (!shouldShowTranslatedContent(ticket.get('language') as Language)) {
            return ticket.get('subject') ?? 'New ticket'
        }

        if (translatedSubject) {
            return allMessageDisplayState === DisplayedContent.Translated
                ? translatedSubject
                : ticket.get('subject')
        }
        return ticket.get('subject') ?? 'New ticket'
    }, [
        translatedSubject,
        allMessageDisplayState,
        ticket,
        shouldShowTranslatedContent,
    ])

    useTitle(title)

    return (
        <div className={classnames(css.component, className)} id="TicketHeader">
            <div className={css.title}>
                <TicketHeaderToggle />
                <TicketSubjectLoadingState isInitialLoading={isSubjectLoading}>
                    <EditableTitle
                        className={css.editableTitleWrapper}
                        inputClassName={css.editableTitle}
                        title={title}
                        placeholder="Subject"
                        update={handleSubjectChange}
                        focus={!ticket.get('id')}
                        maxLength={998}
                    />
                </TicketSubjectLoadingState>
                <div className={css.actions}>
                    <>
                        {shouldShowTranslatedContent(
                            ticket.get('language') as Language,
                        ) &&
                            translationMap[ticket.get('id')]?.subject && (
                                <div className={css.translateIcon}>
                                    <LegacyIconButton
                                        ref={translateIconRef}
                                        icon="translate"
                                        fillStyle="ghost"
                                        intent="secondary"
                                        size="small"
                                        onClick={handleTranslateAllMessages}
                                    />

                                    <Tooltip
                                        target={translateIconRef}
                                        boundariesElement="viewport"
                                        offset="0, 8"
                                        placement="bottom"
                                        trigger={['hover']}
                                    >
                                        {allMessageDisplayState ===
                                        DisplayedContent.Translated ? (
                                            <>{`Ticket translated from ${IntlDisplayNames.of(ticket.get('language')) as string}. Click to revert to original.`}</>
                                        ) : (
                                            <>
                                                {`Click to translate ticket to ${IntlDisplayNames.of(primary as Language) as string}`}
                                            </>
                                        )}
                                    </Tooltip>
                                </div>
                            )}
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
                        <TicketSnooze
                            datetime={snoozedUntil}
                            timezone={timezone}
                        />
                        <TicketPriorityDropdown
                            priority={ticket.get('priority') as TicketPriority}
                            onPriorityChange={handlePriorityChange}
                        />
                        {isUpdate && (
                            <Snooze
                                until={snoozedUntil}
                                onUpdate={handleSnoozeTicket}
                            />
                        )}
                        {!hasUIVisionMS1 && enableAITicketSummary && (
                            <TicketSummaryPopover displayLabel={false} />
                        )}
                        {isUpdate && (
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
                        )}
                        <TicketNavigationArrowPagination
                            ticketId={ticket.get('id')}
                        />
                    </>
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
