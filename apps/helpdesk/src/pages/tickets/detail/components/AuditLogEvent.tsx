import React, { Component, ReactNode } from 'react'

import classnames from 'classnames'
import { fromJS, List, Map } from 'immutable'
import _omit from 'lodash/omit'
import _truncate from 'lodash/truncate'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import { Card, CardBody } from 'reactstrap'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { eventNameToLabel } from 'config/rules'
import { TAGS_ADDED_KEY, TAGS_REMOVED_KEY } from 'models/event/constants'
import {
    isRuleExecutedType,
    isSystemRuleEvent,
    isViaRuleEvent,
} from 'models/event/predicates'
import {
    EventType,
    rulesActionsFailures,
    SATISFACTION_SURVEY_EVENT_TYPES,
    SatisfactionSurveyEventType,
    TICKET_EVENT_TYPES,
    TicketEventType,
} from 'models/event/types'
import { actionsConfigWithManagedRules } from 'pages/common/components/ast/actions/config'
import TicketTag from 'pages/common/components/TicketTag'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { AgentLabel, TeamLabel } from 'pages/common/utils/labels'
import { getHumanAgents } from 'state/agents/selectors'
import { useRuleRecipes } from 'state/entities/ruleRecipes/hooks'
import { getTeams } from 'state/teams/selectors'
import { getEvents } from 'state/ticket/selectors'
import { RootState } from 'state/types'

import IconButton from '../../../common/components/button/IconButton'

import css from './Event.less'

type Props = {
    event: Map<any, any>
    isLast: boolean
    setHighlightedElements: (highlightedElements: HighlightedElements) => void
} & ConnectedProps<typeof connector>

type State = {
    showDetails: boolean
}

export type HighlightedElements = {
    first: number
    last: number
}

const CONTENTFUL_EVENT_TYPES = Object.freeze({
    ..._omit(TICKET_EVENT_TYPES, ['TicketMessageCreated', 'TicketUpdated']),
    ...SATISFACTION_SURVEY_EVENT_TYPES,
})

export const contentfulEventTypesValues = Object.freeze(
    Object.values(CONTENTFUL_EVENT_TYPES),
)

const RuleSuggestionEvent = ({
    slug,
    eventType,
}: {
    slug: string
    eventType:
        | typeof TICKET_EVENT_TYPES.RuleExecuted
        | EventType.RuleSuggestionSuggested
}) => {
    const recipes = useRuleRecipes()
    const ruleName = recipes?.[slug]?.rule?.name ?? slug

    return (
        <ActionName>
            {eventType === EventType.RuleSuggestionSuggested
                ? 'Gorgias Tip suggested rule'
                : 'Rule'}
            {' "'}
            <Link
                to={`/app/settings/rules/library?${slug}`}
                title="Rule"
                target="_blank"
                rel="noreferrer"
            >
                {ruleName}
            </Link>
            {'" '}
            {eventType === EventType.RuleSuggestionSuggested
                ? 'to ticket'
                : 'applied to ticket manually'}
        </ActionName>
    )
}

const RuleActionName = ({
    rule_id,
    context,
    data,
    triggeringEventType,
}: {
    rule_id: string
    context: string
    data: Map<any, any>
    triggeringEventType: string
}) => {
    return (
        <div id={`rule-code-${rule_id}-${context}`}>
            <ActionName>
                {`Rule "`}
                <a
                    href={`/app/settings/rules/${data.get('id') as number}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    {data.get('name')}
                </a>
                {`" executed`}
            </ActionName>
            {triggeringEventType && (
                <Filler>
                    {`on "${eventNameToLabel[triggeringEventType]}"`}
                </Filler>
            )}
        </div>
    )
}

export class AuditLogEventContainer extends Component<Props, State> {
    static defaultProps = {
        isLast: false,
    }

    static _ICONS = {
        [CONTENTFUL_EVENT_TYPES.RuleExecuted]: ['settings'],
        [CONTENTFUL_EVENT_TYPES.RuleSuggestionSuggested]: ['lightbulb'],
        [CONTENTFUL_EVENT_TYPES.TicketAssigned]: ['person_add'],
        [CONTENTFUL_EVENT_TYPES.TicketClosed]: ['done', css.success],
        [CONTENTFUL_EVENT_TYPES.TicketCreated]: ['add'],
        [CONTENTFUL_EVENT_TYPES.TicketSplit]: ['call_split'],
        [CONTENTFUL_EVENT_TYPES.TicketCustomerUpdated]: ['people'],
        [CONTENTFUL_EVENT_TYPES.TicketMarkedSpam]: ['flag', css.warning],
        [CONTENTFUL_EVENT_TYPES.TicketMerged]: ['call_merge'],
        [CONTENTFUL_EVENT_TYPES.TicketReopened]: ['loop'],
        [CONTENTFUL_EVENT_TYPES.TicketSnoozed]: ['timer'],
        [CONTENTFUL_EVENT_TYPES.TicketSelfUnsnoozed]: ['timer_off'],
        [CONTENTFUL_EVENT_TYPES.TicketTagsAdded]: ['local_offer'],
        [CONTENTFUL_EVENT_TYPES.TicketTagsRemoved]: ['local_offer'],
        [CONTENTFUL_EVENT_TYPES.TicketTeamAssigned]: ['group_add'],
        [CONTENTFUL_EVENT_TYPES.TicketTeamUnassigned]: ['person_add_disabled'],
        [CONTENTFUL_EVENT_TYPES.TicketTrashed]: ['delete', css.danger],
        [CONTENTFUL_EVENT_TYPES.TicketUnassigned]: ['person_add_disabled'],
        [CONTENTFUL_EVENT_TYPES.TicketUnmarkedSpam]: ['undo'],
        [CONTENTFUL_EVENT_TYPES.TicketUntrashed]: ['undo'],
        [CONTENTFUL_EVENT_TYPES.TicketMessageSummaryCreated]: ['email'],
        [CONTENTFUL_EVENT_TYPES.TicketSubjectUpdated]: ['mode'],
        [CONTENTFUL_EVENT_TYPES.TicketExcludedFromAutoMerge]: ['close'],
        [CONTENTFUL_EVENT_TYPES.TicketExcludedFromCSAT]: ['star'],
        [CONTENTFUL_EVENT_TYPES.TicketSatisfactionSurveySkipped]: ['star'],
        [CONTENTFUL_EVENT_TYPES.SatisfactionSurveySent]: ['star'],
    }

    state: State = {
        showDetails: false,
    }

    _CONTENT_RENDERERS: Partial<
        Record<TicketEventType | SatisfactionSurveyEventType, () => ReactNode>
    > = {
        [CONTENTFUL_EVENT_TYPES.RuleExecuted]: () => {
            const { event } = this.props
            const hasManagedRuleSlug = event.hasIn(['data', 'slug'])
            if (hasManagedRuleSlug)
                return this._renderRuleSuggestionEvent(
                    CONTENTFUL_EVENT_TYPES.RuleExecuted,
                )
            return this._renderRuleExecutedEvent()
        },
        [CONTENTFUL_EVENT_TYPES.RuleSuggestionSuggested]: () =>
            this._renderRuleSuggestionEvent(
                CONTENTFUL_EVENT_TYPES.RuleSuggestionSuggested,
            ),
        [CONTENTFUL_EVENT_TYPES.TicketAssigned]: () =>
            this._renderTicketAssignedEvent(),
        [CONTENTFUL_EVENT_TYPES.TicketClosed]: () => (
            <ActionName>Closed</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketCreated]: () =>
            this._renderTicketCreatedEvent(),
        [CONTENTFUL_EVENT_TYPES.TicketSplit]: () =>
            this._renderTicketSplitEvent(),
        [CONTENTFUL_EVENT_TYPES.TicketCustomerUpdated]: () =>
            this._renderCustomerUpdated(),
        [CONTENTFUL_EVENT_TYPES.TicketMarkedSpam]: () => (
            <ActionName>Marked as spam</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketMerged]: () => (
            <ActionName>Merged</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketReopened]: () => (
            <ActionName>Reopened</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketSnoozed]: () => (
            <ActionName>Snoozed</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketSelfUnsnoozed]: () => (
            <ActionName>Snooze delay ended</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketTagsAdded]: () =>
            this._renderTagsEvent(TAGS_ADDED_KEY),
        [CONTENTFUL_EVENT_TYPES.TicketTagsRemoved]: () =>
            this._renderTagsEvent(TAGS_REMOVED_KEY),
        [CONTENTFUL_EVENT_TYPES.TicketTeamAssigned]: () =>
            this._renderTicketTeamAssignedEvent(),
        [CONTENTFUL_EVENT_TYPES.TicketTeamUnassigned]: () => (
            <ActionName>Unassigned from team</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketTrashed]: () => (
            <ActionName>Deleted</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketUnassigned]: () => (
            <ActionName>Unassigned from user</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketUnmarkedSpam]: () => (
            <ActionName>Unmarked as spam</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketUntrashed]: () => (
            <ActionName>Undeleted</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketMessageSummaryCreated]: () =>
            this._renderTicketMessageSummaryCreatedEvent(),
        [CONTENTFUL_EVENT_TYPES.TicketSubjectUpdated]: () =>
            this._renderTicketSubjectUpdated(),
        [CONTENTFUL_EVENT_TYPES.TicketExcludedFromAutoMerge]: () => (
            <ActionName>Excluded from Auto-Merge</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketExcludedFromCSAT]: () => (
            <ActionName>Ticket excluded from CSAT</ActionName>
        ),
        [CONTENTFUL_EVENT_TYPES.TicketSatisfactionSurveySkipped]: () =>
            this._renderTicketSatisfactionSurveySkipped(),
        [CONTENTFUL_EVENT_TYPES.SatisfactionSurveySent]: () => (
            <ActionName>CSAT survey sent</ActionName>
        ),
    }

    _DETAILS_RENDERERS: Partial<Record<TicketEventType, () => ReactNode>> = {
        [CONTENTFUL_EVENT_TYPES.TicketSatisfactionSurveySkipped]: () =>
            this._renderTicketSatisfactionSurveySkippedDetails(),
    }

    _getExpandDetailsButton(): ReactNode {
        return (
            <IconButton
                fillStyle="ghost"
                intent="secondary"
                className={css.arrow}
                onClick={() =>
                    this.setState({
                        showDetails: !this.state.showDetails,
                    })
                }
                title="More details"
            >
                {this.state.showDetails ? 'expand_less' : 'expand_more'}
            </IconButton>
        )
    }

    _getIcon() {
        const { event } = this.props
        const type = event.get(
            'type',
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
        const { event } = this.props
        const type = event.get('type') as TicketEventType
        const contentRenderer = this._CONTENT_RENDERERS[type]

        return contentRenderer ? contentRenderer() : null
    }

    _getDetails() {
        const { event } = this.props
        const type = event.get('type') as TicketEventType
        const detailsRenderer = this._DETAILS_RENDERERS[type]

        return detailsRenderer ? detailsRenderer() : null
    }

    _renderRuleExecutedEvent() {
        const { event } = this.props

        if (isSystemRuleEvent(event)) {
            return null
        }

        const data = event.get('data') as Map<any, any>
        const triggeringEventType = data.get('triggering_event_type') as string
        const rule_id = data.get('id') as string
        const context = event.get('context') as string

        return (
            <>
                <RuleActionName
                    data={data}
                    triggeringEventType={triggeringEventType}
                    rule_id={rule_id}
                    context={context}
                />

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

    _renderRuleSuggestionEvent(
        eventType:
            | EventType.RuleSuggestionSuggested
            | typeof TICKET_EVENT_TYPES.RuleExecuted,
    ) {
        const { event } = this.props
        const slug = event.getIn(['data', 'slug']) as string
        return slug ? (
            <RuleSuggestionEvent eventType={eventType} slug={slug} />
        ) : null
    }

    _renderTicketAssignedEvent() {
        const { event, users } = this.props
        const assigneeUserId = event.getIn(['data', 'assignee_user_id'])
        const assigneeUser = users.find(
            (user: Map<any, any>) => user.get('id') === assigneeUserId,
        ) as Map<any, any>
        const elements = [<ActionName key="action-name">Assigned</ActionName>]

        if (assigneeUser) {
            elements.push(
                <Filler key="to">to</Filler>,
                <AgentLabel
                    key="assign-label"
                    name={assigneeUser.get('name')}
                    className={css.assigneeLabel}
                />,
            )
        }

        return elements
    }

    _renderTicketTeamAssignedEvent() {
        const { event, teams } = this.props
        const assigneeTeamId = event.getIn(['data', 'assignee_team_id'])
        const assigneeTeam = teams.find(
            (team) => team!.get('id') === assigneeTeamId,
        )
        const elements = [<ActionName key="action-name">Assigned</ActionName>]

        if (assigneeTeam) {
            elements.push(
                <Filler key="to">to</Filler>,
                <TeamLabel
                    key="team-label"
                    name={assigneeTeam.get('name')}
                    className={css.assigneeLabel}
                />,
            )
        }

        return elements
    }

    _renderTicketCreatedEvent() {
        const { event } = this.props
        const splitFromTicketId = event.getIn([
            'data',
            'split_from_ticket',
            'id',
        ])
        const splitFromTicketClosedDatetime = event.getIn([
            'data',
            'split_from_ticket',
            'closed_datetime',
        ]) as string

        let elements = [<ActionName key="action-name">Created</ActionName>]

        if (splitFromTicketId) {
            elements = [
                <ActionName key="action-name">
                    Created from{' '}
                    <i className={`material-icons ${css.eventDetailsGreyIcon}`}>
                        email
                    </i>{' '}
                    <a href={`/app/ticket/${splitFromTicketId}`}>ticket</a>
                </ActionName>,
                <Filler key="closed-on">
                    closed on{' '}
                    {new Date(splitFromTicketClosedDatetime).toLocaleDateString(
                        'en-US',
                    )}
                </Filler>,
            ]
        }

        return elements
    }

    _renderTicketSplitEvent() {
        const { event } = this.props
        const splitIntoTicketId = event.getIn([
            'data',
            'split_into_ticket',
            'id',
        ])
        const splitAfterDays = event.getIn(['data', 'after_days']) ?? 10

        let elements = [<ActionName key="action-name">Split</ActionName>]

        if (splitIntoTicketId) {
            elements = [
                <Filler key="ticket-closed-for">
                    {`Ticket closed for ${splitAfterDays}+ days.`}
                </Filler>,
                <ActionName key="action-name">
                    New{' '}
                    <i className={`material-icons ${css.eventDetailsGreyIcon}`}>
                        email
                    </i>{' '}
                    <a href={`/app/ticket/${splitIntoTicketId}`}>ticket</a>{' '}
                    created{' '}
                </ActionName>,
                <Filler key="for-follow-up">for the follow up message.</Filler>,
            ]
        }

        return elements
    }

    _renderTagsEvent(
        tagsIdsKey: typeof TAGS_ADDED_KEY | typeof TAGS_REMOVED_KEY,
    ) {
        const { event, tags } = this.props
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
                    <TicketTag
                        key={tag.get('id')}
                        text={tag.get('name')}
                        decoration={tag.get('decoration')?.toJS()}
                        className={css.equalFiller}
                    />,
                )
            })
        }

        return elements
    }

    _renderTicketSubjectUpdated() {
        const { event } = this.props
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
                </span>,
            )
        }
        if (newSubject) {
            elements.push(
                <span className={css.equalFiller} key="to">
                    to
                </span>,
                <span className={css.actionName} key="new">
                    {newSubject}
                </span>,
            )
        }
        return elements
    }

    _renderCustomerUpdated() {
        const { event } = this.props

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
        const { event } = this.props

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
                        this.props.setHighlightedElements({ first, last })
                    }}
                >
                    <u>Unseen chat messages</u>
                </a>{' '}
                were sent by email{' '}
            </ActionName>
        )
    }

    _renderFailedRuleActions() {
        const { event } = this.props
        const failedActions = (
            (event.getIn(['data', 'failed_actions']) as List<any>) || []
        ).filter((action: Map<any, any>) => {
            return action.get('failure_reason') in rulesActionsFailures
        })

        if (!failedActions || failedActions.size === 0) {
            return null
        }

        const normalizedFailedActions = List.isList(failedActions)
            ? failedActions
            : List(failedActions)

        const failures = normalizedFailedActions.map(
            (action: Map<any, any>, index = 0) => {
                const failure_reason =
                    rulesActionsFailures[action.get('failure_reason') as string]
                const action_name =
                    actionsConfigWithManagedRules[
                        action.get('action_name') as string
                    ].name
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
            },
        )

        return <div className={css.failedActions}>{failures.toArray()}</div>
    }

    _getTicketSatisfactionSurveySkippedReasons(): List<string> {
        const { event } = this.props
        const data: Map<any, any> | null = event.get('data')
        if (!data) {
            return List<string>()
        }
        const reasons: List<string> | null = data.get('reasons')
        if (!reasons) {
            return List<string>()
        }
        return reasons
    }

    _renderTicketSatisfactionSurveySkipped() {
        const expandButton =
            this._getTicketSatisfactionSurveySkippedReasons().isEmpty()
                ? null
                : this._getExpandDetailsButton()
        return (
            <>
                <ActionName>Ticket not eligible for CSAT</ActionName>
                {expandButton}
            </>
        )
    }

    _renderTicketSatisfactionSurveySkippedDetails() {
        const { event } = this.props
        const data: Map<any, any> = event.get('data')
        if (!data) {
            return null
        }
        const reasons: List<string> =
            this._getTicketSatisfactionSurveySkippedReasons()
        if (reasons.isEmpty()) {
            return null
        }
        return (
            <>
                <span>
                    <b>Missing requirements:</b>
                </span>
                <ul>
                    {reasons.toArray().map((reason, index) => (
                        <li key={index}>{reason}</li>
                    ))}
                </ul>
            </>
        )
    }

    render() {
        const { event, isLast, users, events } = this.props
        const type = event.get('type') as TicketEventType
        const isRuleExecuted = isRuleExecutedType(event)
        const isSuggestion =
            type === EventType.RuleSuggestionSuggested ||
            event.hasIn(['data', 'slug'])
        const icon = this._getIcon()
        const content = this._getContent()

        if (!content) {
            return null
        }

        const user = users.find(
            (user: Map<any, any>) => user.get('id') === event.get('user_id'),
        ) as Map<any, any>

        const isSystemEvent = !event.get('user_id')

        const details = this._getDetails()

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

                        {isRuleExecuted || isSuggestion ? null : isViaRuleEvent(
                              event,
                              events,
                          ) ? (
                            <Filler>via rule</Filler>
                        ) : type === CONTENTFUL_EVENT_TYPES.TicketMerged &&
                          isSystemEvent ? (
                            <Filler>by auto-merge service</Filler>
                        ) : type === CONTENTFUL_EVENT_TYPES.TicketMerged &&
                          !user ? (
                            <Filler>by deleted user</Filler>
                        ) : user ? (
                            <>
                                <Filler>by</Filler>
                                <AgentLabel
                                    name={user.get('name') || user.get('email')}
                                />
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
                {isRuleExecuted &&
                    !isSuggestion &&
                    this._renderFailedRuleActions()}
                {details && (
                    <Card
                        className={classnames(css.details, {
                            'd-none': !this.state.showDetails,
                        })}
                    >
                        <CardBody>{details}</CardBody>
                    </Card>
                )}
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    users: getHumanAgents(state),
    teams: getTeams(state),
    tags: state.entities.tags,
    events: getEvents(state),
}))

export default connector(AuditLogEventContainer)

// Internal helper components
type HelperProps = {
    children: ReactNode
}

export const ActionName = ({ children }: HelperProps) => (
    <span className={css.actionName}>{children}</span>
)
const Filler = ({ children }: HelperProps) => (
    <span className={css.filler}>{children}</span>
)
