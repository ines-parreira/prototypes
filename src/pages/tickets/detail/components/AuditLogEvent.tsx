import React, {Component, ReactNode} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List, Map} from 'immutable'
import _truncate from 'lodash/truncate'

import {
    AgentLabel,
    DatetimeLabel,
    TagLabel,
    TeamLabel,
} from 'pages/common/utils/labels'
import Tooltip from 'pages/common/components/Tooltip'
import {actionsConfig} from 'pages/common/components/ast/actions/Action'
import {TAGS_ADDED_KEY, TAGS_REMOVED_KEY} from 'models/event/constants'
import {
    TicketEventType,
    TICKET_EVENT_TYPES,
    rulesActionsFailures,
} from 'models/event/types'
import {
    isRuleExecutedType,
    isSystemRuleEvent,
    isViaRuleEvent,
} from 'models/event/predicates'
import {getAgents} from 'state/agents/selectors'
import {getTeams} from 'state/teams/selectors'
import {getEvents} from 'state/ticket/selectors'
import {RootState} from 'state/types'
import {eventNameToLabel} from 'config/rules'

import css from './Event.less'

type Props = {
    event: Map<any, any>
    isLast: boolean
    setHighlightedElements: (highlightedElements: HighlightedElements) => void
} & ConnectedProps<typeof connector>

export type HighlightedElements = {
    first: number
    last: number
}

export class AuditLogEventContainer extends Component<Props> {
    static defaultProps = {
        isLast: false,
    }

    static _ICONS = {
        [TICKET_EVENT_TYPES.RuleExecuted]: ['settings'],
        [TICKET_EVENT_TYPES.TicketAssigned]: ['person_add'],
        [TICKET_EVENT_TYPES.TicketClosed]: ['done', css.success],
        [TICKET_EVENT_TYPES.TicketCreated]: ['add'],
        [TICKET_EVENT_TYPES.TicketCustomerUpdated]: ['people'],
        [TICKET_EVENT_TYPES.TicketMarkedSpam]: ['flag', css.warning],
        [TICKET_EVENT_TYPES.TicketMerged]: ['call_merge'],
        [TICKET_EVENT_TYPES.TicketReopened]: ['loop'],
        [TICKET_EVENT_TYPES.TicketSnoozed]: ['timer'],
        [TICKET_EVENT_TYPES.TicketSelfUnsnoozed]: ['timer_off'],
        [TICKET_EVENT_TYPES.TicketTagsAdded]: ['local_offer'],
        [TICKET_EVENT_TYPES.TicketTagsRemoved]: ['local_offer'],
        [TICKET_EVENT_TYPES.TicketTeamAssigned]: ['group_add'],
        [TICKET_EVENT_TYPES.TicketTeamUnassigned]: ['person_add_disabled'],
        [TICKET_EVENT_TYPES.TicketTrashed]: ['delete', css.danger],
        [TICKET_EVENT_TYPES.TicketUnassigned]: ['person_add_disabled'],
        [TICKET_EVENT_TYPES.TicketUnmarkedSpam]: ['undo'],
        [TICKET_EVENT_TYPES.TicketUntrashed]: ['undo'],
        [TICKET_EVENT_TYPES.TicketMessageSummaryCreated]: ['email'],
        [TICKET_EVENT_TYPES.TicketSubjectUpdated]: ['mode'],
    }

    _CONTENT_RENDERERS: Partial<Record<TicketEventType, () => ReactNode>> = {
        [TICKET_EVENT_TYPES.RuleExecuted]: () =>
            this._renderRuleExecutedEvent(),
        [TICKET_EVENT_TYPES.TicketAssigned]: () =>
            this._renderTicketAssignedEvent(),
        [TICKET_EVENT_TYPES.TicketClosed]: () => (
            <ActionName>Closed</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketCreated]: () => (
            <ActionName>Created</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketCustomerUpdated]: () =>
            this._renderCustomerUpdated(),
        [TICKET_EVENT_TYPES.TicketMarkedSpam]: () => (
            <ActionName>Marked as spam</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketMerged]: () => (
            <ActionName>Merged</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketReopened]: () => (
            <ActionName>Reopened</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketSnoozed]: () => (
            <ActionName>Snoozed</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketSelfUnsnoozed]: () => (
            <ActionName>Snooze delay ended</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketTagsAdded]: () =>
            this._renderTagsEvent(TAGS_ADDED_KEY),
        [TICKET_EVENT_TYPES.TicketTagsRemoved]: () =>
            this._renderTagsEvent(TAGS_REMOVED_KEY),
        [TICKET_EVENT_TYPES.TicketTeamAssigned]: () =>
            this._renderTicketTeamAssignedEvent(),
        [TICKET_EVENT_TYPES.TicketTeamUnassigned]: () => (
            <ActionName>Unassigned from team</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketTrashed]: () => (
            <ActionName>Deleted</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketUnassigned]: () => (
            <ActionName>Unassigned from user</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketUnmarkedSpam]: () => (
            <ActionName>Unmarked as spam</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketUntrashed]: () => (
            <ActionName>Undeleted</ActionName>
        ),
        [TICKET_EVENT_TYPES.TicketMessageSummaryCreated]: () =>
            this._renderTicketMessageSummaryCreatedEvent(),
        [TICKET_EVENT_TYPES.TicketSubjectUpdated]: () =>
            this._renderTicketSubjectUpdated(),
    }

    _getIcon() {
        const {event} = this.props
        const type = event.get(
            'type'
        ) as keyof typeof AuditLogEventContainer._ICONS
        const iconConfig = AuditLogEventContainer._ICONS[type] || ['info']
        const [icon, className] = iconConfig

        return (
            <div className={classnames(css.icon, className)}>
                <i className="material-icons">{icon}</i>
            </div>
        )
    }

    _getContent() {
        const {event} = this.props
        const type = event.get('type') as TicketEventType
        const contentRenderer = this._CONTENT_RENDERERS[type]

        return contentRenderer ? contentRenderer() : null
    }

    _renderRuleExecutedEvent() {
        const {event} = this.props

        if (isSystemRuleEvent(event)) {
            return null
        }

        const data = event.get('data') as Map<any, any>
        const triggeringEventType = data.get('triggering_event_type') as string
        const rule_id = data.get('id') as string
        const context = event.get('context') as string

        return (
            <>
                <div id={`rule-code-${rule_id}-${context}`}>
                    <ActionName>
                        Rule "
                        <a
                            href={`/app/settings/rules/${
                                data.get('id') as number
                            }`}
                        >
                            {data.get('name')}
                        </a>
                        " executed
                    </ActionName>
                    {triggeringEventType && (
                        <Filler>
                            on "{eventNameToLabel[triggeringEventType]}"
                        </Filler>
                    )}
                </div>
                <Tooltip
                    placement="top"
                    target={`rule-code-${rule_id}-${context}`}
                >
                    {_truncate(data.get('code'), {
                        length: 500,
                        omission:
                            '... [see the rest of the rule in the settings]',
                    })}
                </Tooltip>
            </>
        )
    }

    _renderTicketAssignedEvent() {
        const {event, users} = this.props
        const assigneeUserId = event.getIn(['data', 'assignee_user_id'])
        const assigneeUser = users.find(
            (user: Map<any, any>) => user.get('id') === assigneeUserId
        ) as Map<any, any>
        const elements = [<ActionName key="action-name">Assigned</ActionName>]

        if (assigneeUser) {
            elements.push(
                <Filler key="to">to</Filler>,
                <AgentLabel
                    key="assign-label"
                    name={assigneeUser.get('name')}
                    className={css.assigneeLabel}
                />
            )
        }

        return elements
    }

    _renderTicketTeamAssignedEvent() {
        const {event, teams} = this.props
        const assigneeTeamId = event.getIn(['data', 'assignee_team_id'])
        const assigneeTeam = teams.find(
            (team) => team!.get('id') === assigneeTeamId
        )
        const elements = [<ActionName key="action-name">Assigned</ActionName>]

        if (assigneeTeam) {
            elements.push(
                <Filler key="to">to</Filler>,
                <TeamLabel
                    key="team-label"
                    name={assigneeTeam.get('name')}
                    className={css.assigneeLabel}
                />
            )
        }

        return elements
    }

    _renderTagsEvent(
        tagsIdsKey: typeof TAGS_ADDED_KEY | typeof TAGS_REMOVED_KEY
    ) {
        const {event, tags} = this.props
        const tagsIds = event.getIn(['data', tagsIdsKey]) as List<any>
        const eventTags = tagsIds
            .map((tagId: number) => fromJS(tags[tagId]) as Map<any, any>)
            .filter((event) => !!event) as List<any>

        if (!eventTags.size) {
            return null
        }

        const elements = [
            <ActionName key="action-name-left">
                {tagsIdsKey === TAGS_ADDED_KEY ? 'Tagged' : 'Untagged'}
            </ActionName>,
        ]

        {
            eventTags.forEach((tag: Map<any, any>) => {
                elements.push(
                    <TagLabel
                        key={tag.get('id')}
                        decoration={tag.get('decoration')}
                        className={css.equalFiller}
                    >
                        {tag.get('name')}
                    </TagLabel>
                )
            })
        }

        return elements
    }

    _renderTicketSubjectUpdated() {
        const {event} = this.props
        const oldSubject = event.getIn(['data', 'old_subject'])
        const newSubject = event.getIn(['data', 'new_subject'])

        const elements = [<ActionName key="name">Subject updated</ActionName>]
        if (oldSubject) {
            elements.push(
                <span className={css.equalFiller} key="from">
                    from
                </span>,
                <span className={css.actionName} key="old">
                    {oldSubject}
                </span>
            )
        }
        if (newSubject) {
            elements.push(
                <span className={css.equalFiller} key="to">
                    to
                </span>,
                <span className={css.actionName} key="new">
                    {newSubject}
                </span>
            )
        }
        return elements
    }

    _renderCustomerUpdated() {
        const {event} = this.props

        const oldCustomer = event.getIn(['data', 'old_customer']) as Map<
            any,
            any
        >
        const newCustomer = event.getIn(['data', 'new_customer']) as Map<
            any,
            any
        >

        if (!(oldCustomer && newCustomer)) {
            return null
        }

        const oldCustomerName =
            oldCustomer.get('name') ||
            `Customer #${oldCustomer.get('id') as number}`
        const newCustomerName =
            newCustomer.get('name') ||
            `Customer #${newCustomer.get('id') as number}`

        return (
            <ActionName>
                Customer changed from{' '}
                <a href={`/app/customer/${oldCustomer.get('id') as number}`}>
                    {oldCustomerName}
                </a>{' '}
                to{' '}
                <a href={`/app/customer/${newCustomer.get('id') as number}`}>
                    {newCustomerName}
                </a>
            </ActionName>
        )
    }

    _renderTicketMessageSummaryCreatedEvent() {
        const {event} = this.props

        if (isSystemRuleEvent(event)) {
            return null
        }

        const first = event.getIn(['data', 'first_unseen_id'])
        const last = event.getIn(['data', 'last_unseen_id'])

        if (!first && !last) {
            return (
                <ActionName>
                    <b>Chat summarized</b> - <u>Unseen chat messages</u> were
                    sent by email{' '}
                </ActionName>
            )
        }

        return (
            <ActionName>
                <b>Chat summarized</b> -{' '}
                <a
                    href={'#'}
                    onClick={() => {
                        this.props.setHighlightedElements({first, last})
                    }}
                >
                    <u>Unseen chat messages</u>
                </a>{' '}
                were sent by email{' '}
            </ActionName>
        )
    }

    _renderFailedRuleActions() {
        const {event} = this.props
        const failedActions = (
            (event.getIn(['data', 'failed_actions']) as List<any>) || []
        ).filter((action: Map<any, any>) => {
            return action.get('failure_reason') in rulesActionsFailures
        })

        if (!failedActions || failedActions.size === 0) {
            return null
        }

        const failures = failedActions.map(
            (action: Map<any, any>, index = 0) => {
                const failure_reason =
                    rulesActionsFailures[action.get('failure_reason') as string]
                const action_name =
                    actionsConfig[action.get('action_name') as string].name
                return (
                    <div className={css.failedAction} key={`action-${index}`}>
                        <span className={css.failureName}>{action_name} </span>
                        failed:
                        <span
                            className={
                                failure_reason.severity === 'warning'
                                    ? css.failureReasonWarning
                                    : css.failureReasonError
                            }
                        >
                            {failure_reason.description}
                        </span>
                    </div>
                )
            }
        )

        return <div className={css.failedActions}>{failures}</div>
    }

    render() {
        const {event, isLast, users, events} = this.props
        const isRuleExecuted = isRuleExecutedType(event)
        const icon = this._getIcon()
        const content = this._getContent()

        if (!content) {
            return null
        }

        const user = users.find(
            (user: Map<any, any>) => user.get('id') === event.get('user_id')
        ) as Map<any, any>

        return (
            <div
                className={classnames(css.component, {
                    [css.last]: isLast,
                })}
            >
                <div className={css.event}>
                    <div className={css.content}>
                        {icon}
                        {content}

                        {isRuleExecuted ? null : isViaRuleEvent(
                              event,
                              events
                          ) ? (
                            <Filler>via rule</Filler>
                        ) : user ? (
                            <>
                                <Filler>by</Filler>
                                <AgentLabel name={user.get('name')} />
                            </>
                        ) : !!event.getIn(['data', 'auto_assigned']) ? (
                            <Filler>via Team auto-assignment</Filler>
                        ) : null}
                    </div>

                    <DatetimeLabel
                        dateTime={event.get('created_datetime')}
                        className={classnames(css.date, 'text-faded')}
                    />
                </div>
                {isRuleExecuted && this._renderFailedRuleActions()}
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    users: getAgents(state),
    teams: getTeams(state),
    tags: state.entities.tags,
    events: getEvents(state),
}))

export default connector(AuditLogEventContainer)

// Internal helper components
type HelperProps = {
    children: ReactNode
}

const ActionName = ({children}: HelperProps) => (
    <span className={css.actionName}>{children}</span>
)
const Filler = ({children}: HelperProps) => (
    <span className={css.filler}>{children}</span>
)
