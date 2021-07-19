import React, {Component, ReactNode} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List, Map} from 'immutable'

import {
    AgentLabel,
    DatetimeLabel,
    TagLabel,
    TeamLabel,
} from '../../../common/utils/labels'
import {
    TAGS_ADDED_KEY,
    TAGS_REMOVED_KEY,
} from '../../../../models/event/constants'
import {AuditLogEventType} from '../../../../models/event/types'
import {
    isRuleExecutedType,
    isSystemRuleEvent,
    isViaRuleEvent,
} from '../../../../models/event/predicates'
import {getAgents} from '../../../../state/agents/selectors'
import {getTeams} from '../../../../state/teams/selectors'
import {getEvents} from '../../../../state/ticket/selectors'
import {RootState} from '../../../../state/types'
import {eventNameToLabel} from '../../../../config/rules'

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
        [AuditLogEventType.RuleExecuted]: ['settings'],
        [AuditLogEventType.TicketAssigned]: ['person_add'],
        [AuditLogEventType.TicketClosed]: ['done', css.success],
        [AuditLogEventType.TicketCreated]: ['add'],
        [AuditLogEventType.TicketCustomerUpdated]: ['people'],
        [AuditLogEventType.TicketMarkedSpam]: ['flag', css.warning],
        [AuditLogEventType.TicketMerged]: ['call_merge'],
        [AuditLogEventType.TicketReopened]: ['loop'],
        [AuditLogEventType.TicketSnoozed]: ['timer'],
        [AuditLogEventType.TicketSelfUnsnoozed]: ['timer_off'],
        [AuditLogEventType.TicketTagsAdded]: ['local_offer'],
        [AuditLogEventType.TicketTagsRemoved]: ['local_offer'],
        [AuditLogEventType.TicketTeamAssigned]: ['group_add'],
        [AuditLogEventType.TicketTeamUnassigned]: ['person_add_disabled'],
        [AuditLogEventType.TicketTrashed]: ['delete', css.danger],
        [AuditLogEventType.TicketUnassigned]: ['person_add_disabled'],
        [AuditLogEventType.TicketUnmarkedSpam]: ['undo'],
        [AuditLogEventType.TicketUntrashed]: ['undo'],
        [AuditLogEventType.TicketMessageSummaryCreated]: ['email'],
        [AuditLogEventType.TicketSubjectUpdated]: ['mode'],
    }

    _CONTENT_RENDERERS: Partial<Record<AuditLogEventType, () => ReactNode>> = {
        [AuditLogEventType.RuleExecuted]: () => this._renderRuleExecutedEvent(),
        [AuditLogEventType.TicketAssigned]: () =>
            this._renderTicketAssignedEvent(),
        [AuditLogEventType.TicketClosed]: () => <ActionName>Closed</ActionName>,
        [AuditLogEventType.TicketCreated]: () => (
            <ActionName>Created</ActionName>
        ),
        [AuditLogEventType.TicketCustomerUpdated]: () =>
            this._renderCustomerUpdated(),
        [AuditLogEventType.TicketMarkedSpam]: () => (
            <ActionName>Marked as spam</ActionName>
        ),
        [AuditLogEventType.TicketMerged]: () => <ActionName>Merged</ActionName>,
        [AuditLogEventType.TicketReopened]: () => (
            <ActionName>Reopened</ActionName>
        ),
        [AuditLogEventType.TicketSnoozed]: () => (
            <ActionName>Snoozed</ActionName>
        ),
        [AuditLogEventType.TicketSelfUnsnoozed]: () => (
            <ActionName>Snooze delay ended</ActionName>
        ),
        [AuditLogEventType.TicketTagsAdded]: () =>
            this._renderTagsEvent(TAGS_ADDED_KEY),
        [AuditLogEventType.TicketTagsRemoved]: () =>
            this._renderTagsEvent(TAGS_REMOVED_KEY),
        [AuditLogEventType.TicketTeamAssigned]: () =>
            this._renderTicketTeamAssignedEvent(),
        [AuditLogEventType.TicketTeamUnassigned]: () => (
            <ActionName>Unassigned from team</ActionName>
        ),
        [AuditLogEventType.TicketTrashed]: () => (
            <ActionName>Deleted</ActionName>
        ),
        [AuditLogEventType.TicketUnassigned]: () => (
            <ActionName>Unassigned from user</ActionName>
        ),
        [AuditLogEventType.TicketUnmarkedSpam]: () => (
            <ActionName>Unmarked as spam</ActionName>
        ),
        [AuditLogEventType.TicketUntrashed]: () => (
            <ActionName>Undeleted</ActionName>
        ),
        [AuditLogEventType.TicketMessageSummaryCreated]: () =>
            this._renderTicketMessageSummaryCreatedEvent(),
        [AuditLogEventType.TicketSubjectUpdated]: () =>
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
        const type = event.get('type') as AuditLogEventType
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

        return (
            <>
                <ActionName>
                    Rule "
                    <a
                        href={`/app/settings/rules?ruleId=${
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

    render() {
        const icon = this._getIcon()
        const content = this._getContent()

        if (!content) {
            return null
        }

        const {event, isLast, users, events} = this.props
        const viaRule = isViaRuleEvent(event, events)
        const user = users.find(
            (user: Map<any, any>) => user.get('id') === event.get('user_id')
        ) as Map<any, any>
        const shouldRenderViaRule = viaRule && !isRuleExecutedType(event)
        const shouldRenderByUser =
            !shouldRenderViaRule && user && !isRuleExecutedType(event)

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

                        {shouldRenderViaRule && <Filler>via rule</Filler>}

                        {shouldRenderByUser && <Filler>by</Filler>}
                        {shouldRenderByUser && (
                            <AgentLabel name={user.get('name')} />
                        )}
                    </div>

                    <DatetimeLabel
                        dateTime={event.get('created_datetime')}
                        className={classnames(css.date, 'text-faded')}
                    />
                </div>
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
