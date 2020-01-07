// @flow

import React, {type Node} from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'

import type {List, Record} from 'immutable'

import {AgentLabel, DatetimeLabel, TagLabel, TeamLabel} from '../../../common/utils/labels'
import * as constants from '../../../../constants/event'
import {
    type AuditLogEvent as AuditLogEventType,
    isRuleExecutedType,
    isSystemRuleEvent,
    isViaRuleEvent,
    TAGS_ADDED_KEY,
    TAGS_REMOVED_KEY,
} from '../../../../models/event'
import {getAgents} from '../../../../state/agents/selectors'
import {getTeams} from '../../../../state/teams/selectors'
import {getTags} from '../../../../state/tags/selectors'
import {getEvents} from '../../../../state/ticket/selectors'

import type {agentType} from '../../../../state/agents/types'
import type {teamType} from '../../../../state/teams/types'

import css from './Event.less'

type Props = {
    event: Record<AuditLogEventType>,
    isLast: boolean,
    users: List<agentType>,
    teams: List<teamType>,
    tags: List<*>,
    events: List<AuditLogEventType>,
}

class AuditLogEventComponent extends React.Component<Props> {
    static defaultProps = {
        isLast: false,
    }

    static _ICONS = {
        [constants.RULE_EXECUTED]: ['settings'],
        [constants.TICKET_ASSIGNED]: ['person_add'],
        [constants.TICKET_CLOSED]: ['done', css.success],
        [constants.TICKET_CREATED]: ['add'],
        [constants.TICKET_CUSTOMER_UPDATED]: ['people'],
        [constants.TICKET_MARKED_SPAM]: ['flag', css.warning],
        [constants.TICKET_MERGED]: ['call_merge'],
        [constants.TICKET_REOPENED]: ['loop'],
        [constants.TICKET_SNOOZED]: ['timer'],
        [constants.TICKET_TAGS_ADDED]: ['local_offer'],
        [constants.TICKET_TAGS_REMOVED]: ['local_offer'],
        [constants.TICKET_TEAM_ASSIGNED]: ['group_add'],
        [constants.TICKET_TEAM_UNASSIGNED]: ['person_add_disabled'],
        [constants.TICKET_TRASHED]: ['delete', css.danger],
        [constants.TICKET_UNASSIGNED]: ['person_add_disabled'],
        [constants.TICKET_UNMARKED_SPAM]: ['undo'],
        [constants.TICKET_UNTRASHED]: ['undo'],
    }

    _CONTENT_RENDERERS = {
        [constants.RULE_EXECUTED]: () => this._renderRuleExecutedEvent(),
        [constants.TICKET_ASSIGNED]: () => this._renderTicketAssignedEvent(),
        [constants.TICKET_CLOSED]: () => <ActionName>Closed</ActionName>,
        [constants.TICKET_CREATED]: () => <ActionName>Created</ActionName>,
        [constants.TICKET_CUSTOMER_UPDATED]: () => this._renderCustomerUpdated(),
        [constants.TICKET_MARKED_SPAM]: () => <ActionName>Marked as spam</ActionName>,
        [constants.TICKET_MERGED]: () => <ActionName>Merged</ActionName>,
        [constants.TICKET_REOPENED]: () => <ActionName>Reopened</ActionName>,
        [constants.TICKET_SNOOZED]: () => <ActionName>Snoozed</ActionName>,
        [constants.TICKET_TAGS_ADDED]: () => this._renderTagsEvent(TAGS_ADDED_KEY),
        [constants.TICKET_TAGS_REMOVED]: () => this._renderTagsEvent(TAGS_REMOVED_KEY),
        [constants.TICKET_TEAM_ASSIGNED]: () => this._renderTicketTeamAssignedEvent(),
        [constants.TICKET_TEAM_UNASSIGNED]: () => <ActionName>Unassigned from team</ActionName>,
        [constants.TICKET_TRASHED]: () => <ActionName>Deleted</ActionName>,
        [constants.TICKET_UNASSIGNED]: () => <ActionName>Unassigned from user</ActionName>,
        [constants.TICKET_UNMARKED_SPAM]: () => <ActionName>Unmarked as spam</ActionName>,
        [constants.TICKET_UNTRASHED]: () => <ActionName>Undeleted</ActionName>,
    }

    _getIcon() {
        const {event} = this.props
        const type = event.get('type')
        const iconConfig = AuditLogEventComponent._ICONS[type] || ['info']
        const [icon, className] = iconConfig

        return (
            <div className={classnames(css.icon, className)}>
                <i className="material-icons">
                    {icon}
                </i>
            </div>
        )
    }

    _getContent() {
        const {event} = this.props
        const type = event.get('type')
        const contentRenderer = this._CONTENT_RENDERERS[type]

        return contentRenderer ? contentRenderer() : null
    }

    _renderRuleExecutedEvent() {
        const {event} = this.props

        if (isSystemRuleEvent(event)) {
            return null
        }

        const data = event.get('data')

        return (
            <ActionName>
                Rule "<a href={`/app/settings/rules?ruleId=${data.get('id')}`}>{data.get('name')}</a>" executed
            </ActionName>
        )
    }

    _renderTicketAssignedEvent() {
        const {event, users} = this.props
        const assigneeUserId = event.getIn(['data', 'assignee_user_id'])
        const assigneeUser = users.find((user) => user.get('id') === assigneeUserId)
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
        const {event, teams} = this.props
        const assigneeTeamId = event.getIn(['data', 'assignee_team_id'])
        const assigneeTeam = teams.find((team) => team.get('id') === assigneeTeamId)
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

    _renderTagsEvent(tagsIdsKey: TAGS_ADDED_KEY | TAGS_REMOVED_KEY) {
        const {event, tags} = this.props
        const tagsIds = event.getIn(['data', tagsIdsKey])
        const eventTags = tags.filter((tag) => tagsIds.includes(tag.get('id')))

        if (!eventTags.size) {
            return null
        }

        const elements = [
            <ActionName key="action-name-left">{tagsIdsKey === TAGS_ADDED_KEY ? 'Tagged' : 'Untagged'}</ActionName>
        ]

        {
            eventTags.forEach((tag) => {
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

    _renderCustomerUpdated() {
        const {event} = this.props

        const oldCustomer = event.getIn(['data', 'old_customer'])
        const newCustomer = event.getIn(['data', 'new_customer'])

        if (!(oldCustomer && newCustomer)) {
            return null
        }

        const oldCustomerName = oldCustomer.get('name') || `Customer #${oldCustomer.get('id')}`
        const newCustomerName = newCustomer.get('name') || `Customer #${newCustomer.get('id')}`

        return (
            <ActionName>
                Customer changed from <a
                    href={`/app/customer/${oldCustomer.get('id')}`}>{oldCustomerName}</a> to <a
                    href={`/app/customer/${newCustomer.get('id')}`}>{newCustomerName}</a>
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
        const user = users.find((user) => user.get('id') === event.get('user_id'))
        const shouldRenderViaRule = viaRule && !isRuleExecutedType(event)
        const shouldRenderByUser = !shouldRenderViaRule && user && !isRuleExecutedType(event)

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
                            <AgentLabel
                                name={user.get('name')}
                                className={css.assigneeLabel}
                            />
                        )}
                    </div>

                    <DatetimeLabel
                        dateTime={event.get('created_datetime')}
                        settings={{
                            position: 'top left'
                        }}
                        className={classnames(css.date, 'text-faded')}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    users: getAgents(state),
    teams: getTeams(state),
    tags: getTags(state),
    events: getEvents(state),
})

export default connect(mapStateToProps)(AuditLogEventComponent)

// Internal helper components
type HelperProps = { children: Node }
const ActionName = ({children}: HelperProps) => <span className={css.actionName}>{children}</span>
const Filler = ({children}: HelperProps) => <span className={css.filler}>{children}</span>
