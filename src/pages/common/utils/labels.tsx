import React, {CSSProperties, Component, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import _omit from 'lodash/omit'
import {Badge as ReactstrapBadge, UncontrolledTooltipProps} from 'reactstrap'
import {Emoji} from 'emoji-mart'
import moment from 'moment-timezone'

import {DEFAULT_TAG_COLOR} from 'config'
import {UserRole} from 'config/types/user'
import {
    EMAIL_INTEGRATION_TYPES,
    RECHARGE_INTEGRATION_TYPE,
} from 'constants/integration'
import {SourceType} from 'models/ticket/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import SourceIcon from 'pages/common/components/SourceIcon'
import {getAgents} from 'state/agents/selectors'
import * as currentUserSelectors from 'state/currentUser/selectors'
import * as customersHelpers from 'state/customers/helpers'
import {getTeams} from 'state/teams/selectors'
import {parseTimedelta} from 'state/ticket/utils'
import {RootState} from 'state/types'
import {formatDatetime, humanizeString, isImmutable} from 'utils'

import css from './labels.less'

/**
 * AGENT
 */
type AgentLabelProps = {
    name?: string
    maxWidth?: string
    className?: string
    profilePictureUrl?: string
    shouldDisplayAvatar?: boolean
}

export class AgentLabel extends Component<AgentLabelProps> {
    static defaultProps = {
        name: '',
        className: '',
        profilePictureUrl: '',
        shouldDisplayAvatar: false,
    }

    render() {
        const {
            name,
            maxWidth,
            className,
            profilePictureUrl,
            shouldDisplayAvatar,
        } = this.props
        const showAvatar = shouldDisplayAvatar || profilePictureUrl
        const style: CSSProperties = {}
        if (maxWidth) {
            style.maxWidth = `${maxWidth}px`
        }

        return (
            <div className={classnames(css.AgentLabel, className)}>
                {showAvatar ? (
                    <Avatar
                        name={name}
                        url={profilePictureUrl}
                        size={26}
                        className={css.avatar}
                    />
                ) : (
                    <span className="material-icons md-2">account_circle</span>
                )}

                {name && (
                    <span className={css.name} style={style}>
                        {name}
                    </span>
                )}
            </div>
        )
    }
}

/**
 * TEAM
 */
type TeamLabelProps = {
    name: string
    maxWidth?: number
    className?: string
    emoji?: Map<any, any>
    shouldDisplayAvatar?: boolean
    shouldDisplayTeamIcon?: boolean
}

export class TeamLabel extends Component<TeamLabelProps> {
    static defaultProps = {
        name: '',
        className: '',
        shouldDisplayAvatar: false,
        shouldDisplayTeamIcon: false,
    }

    _renderAvatar() {
        const {name, emoji, shouldDisplayAvatar} = this.props

        if (shouldDisplayAvatar) {
            return emoji ? (
                <span className={css.avatar}>
                    <Emoji
                        emoji={emoji.toJS()}
                        size={26}
                        sheetSize={32}
                        forceSize
                    />
                </span>
            ) : (
                <Avatar name={name} size={26} className={css.avatar} />
            )
        }

        return <span className="material-icons md-2">people</span>
    }

    render() {
        const {name, maxWidth, className, shouldDisplayTeamIcon} = this.props
        const style: CSSProperties = {}
        if (maxWidth) {
            style.maxWidth = `${maxWidth}px`
        }

        return (
            <div className={classnames(css.TeamLabel, className)}>
                {this._renderAvatar()}
                {name && (
                    <span className={css.name} style={style}>
                        {name}
                        {shouldDisplayTeamIcon && (
                            <span
                                className={classnames(
                                    css.nameIcon,
                                    'material-icons md-2'
                                )}
                            >
                                people
                            </span>
                        )}
                    </span>
                )}
            </div>
        )
    }
}

/**
 * USER
 */
type CustomerLabelParamType = {
    customer:
        | {
              name: string
              id: string
          }
        | string
        | Map<any, any>
}
export const CustomerLabel = ({customer}: CustomerLabelParamType) => {
    if (typeof customer === 'string') {
        return <span>{customer}</span>
    }

    return <span>{customersHelpers.getDisplayName(customer)}</span>
}
CustomerLabel.displayName = 'CustomerLabel'

/**
 * TAG
 */
type TagLabelParamType = {
    className?: string
    style: CSSProperties
    decoration?: Map<any, any>
    children?: ReactNode
}
export const TagLabel = ({
    className,
    decoration,
    children,
}: TagLabelParamType) => {
    const color =
        ((decoration || fromJS({})) as Map<any, any>).get('color') ||
        DEFAULT_TAG_COLOR

    return (
        <ReactstrapBadge
            className={classnames('badge-tag', className)}
            style={{color}}
        >
            {children}
        </ReactstrapBadge>
    )
}

TagLabel.defaultProps = {
    className: null,
    style: {},
}

TagLabel.displayName = 'TagLabel'

/**
 * TIMEDELTA LABEL
 */
type TimedeltaLabelParamType = {
    duration: string
    className?: string
}

export const TimedeltaLabel = ({
    duration,
    className,
}: TimedeltaLabelParamType) => {
    const durationMoment = parseTimedelta(duration)
    const durationArray = []
    durationMoment.days()
        ? durationArray.push(`${durationMoment.days()} day(s)`)
        : null
    durationMoment.hours()
        ? durationArray.push(`${durationMoment.hours()} hour(s)`)
        : null
    durationMoment.minutes()
        ? durationArray.push(`${durationMoment.minutes()} minute(s)`)
        : null

    return (
        <Badge
            className={classnames('text-center', className)}
            type={ColorType.Grey}
        >
            {durationArray.join(',')}
        </Badge>
    )
}

/**
 * STATUS
 */
type StatusLabelParam = {
    status: string
    className?: string
}

export const StatusLabel = ({status, ...rest}: StatusLabelParam) => {
    let color: ColorType = ColorType.Modern

    switch (status) {
        case 'open':
            color = ColorType.Classic
            break
        case 'closed':
            color = ColorType.Grey
            break
        default:
    }

    return (
        <Badge className="text-center" type={color} {...rest}>
            {status}
        </Badge>
    )
}

StatusLabel.displayName = 'StatusLabel'

/**
 * CHANNEL
 */

export const ChannelLabel = ({channel}: {channel: SourceType}) => (
    <SourceIcon type={channel} className="text-secondary" />
)

/**
 *  Source DETAIL
 */
export const IntegrationsDetailLabel = ({
    integration,
}: {
    integration: Map<any, any>
}) => {
    const type = integration.get('type')
    let label = integration.get('name', integration.get('address'))
    const address = (integration.get('address') ||
        integration.getIn(['meta', 'address'])) as string

    if (EMAIL_INTEGRATION_TYPES.includes(type) && address) {
        label = `${integration.get('name') as string} <${address}>`
    } else if (type === 'aircall' && address) {
        label = `${integration.get('name') as string} (${address})`
    }

    return (
        <span>
            <SourceIcon type={integration.get('type')} className="mr-2" />
            {label}
        </span>
    )
}

IntegrationsDetailLabel.displayName = 'IntegrationsDetailLabel'

type Role = {
    id?: number
    name: UserRole
}

/**
 * ROLE
 */
export class RoleLabel extends Component<{
    role: Role
}> {
    render() {
        const {role} = this.props
        let color: ColorType | undefined
        let label = null

        if (role.name === UserRole.Admin) {
            color = ColorType.Error
            label = _capitalize(UserRole.Admin)
        } else if (role.name === UserRole.Agent) {
            color = ColorType.Warning
            label = 'Lead agent'
        } else if (role.name === UserRole.BasicAgent) {
            color = ColorType.DarkGrey
            label = _capitalize(humanizeString(UserRole.BasicAgent))
        } else if (role.name === UserRole.LiteAgent) {
            color = ColorType.Classic
            label = _capitalize(humanizeString(UserRole.LiteAgent))
        } else if (role.name === UserRole.ObserverAgent) {
            color = ColorType.Grey
            label = _capitalize(humanizeString(UserRole.ObserverAgent))
        }

        return <Badge type={color}>{label}</Badge>
    }
}

/**
 * DATETIME
 */
type DatetimeLabelOwnProps = {
    breakDate?: boolean
    className?: string
    dateTime?: string
    labelFormat?: string
    hasTooltip?: boolean
    placement?: UncontrolledTooltipProps['placement']
    integrationType?: string
}

type DatetimeLabelProps = DatetimeLabelOwnProps &
    ConnectedProps<typeof datetimeLabelConnector>

class DatetimeLabelContainer extends React.PureComponent<DatetimeLabelProps> {
    id: string

    static defaultProps = {
        hasTooltip: true,
    }

    constructor(props: DatetimeLabelProps) {
        super(props)
        this.id = `datetime-tooltip-${Math.random().toString(36).slice(2)}` // generates a random unique id
    }

    render() {
        const {
            breakDate,
            className,
            hasTooltip,
            labelFormat,
            placement = 'top',
            timezone,
            integrationType,
        } = _omit(this.props, 'dispatch')
        let {dateTime} = this.props

        if (!dateTime) {
            return null
        }

        if (integrationType === RECHARGE_INTEGRATION_TYPE) {
            dateTime = moment(dateTime).tz('US/Eastern', true).toISOString(true)
        }

        const labelDatetime = formatDatetime(dateTime, timezone, labelFormat)
        const tooltipDatetime = formatDatetime(dateTime, timezone, 'L LT')

        return (
            <span className={className}>
                <span id={this.id}>
                    {breakDate
                        ? // u200B is the unicode character for 'ZERO WIDTH SPACE'
                          // it is intended for invisible word separation and line break control
                          // in this case it allows us to break the date at forward slashes
                          labelDatetime.toString().split('/').join('/\u200B')
                        : labelDatetime}
                </span>
                {hasTooltip && (
                    <Tooltip
                        placement={placement}
                        target={this.id}
                        delay={{show: 200, hide: 0}}
                        className={classnames(css.datetimeTooltip)}
                    >
                        {tooltipDatetime.toString()}
                    </Tooltip>
                )}
            </span>
        )
    }
}

const datetimeLabelConnector = connect((state: RootState) => {
    return {
        timezone: currentUserSelectors.getTimezone(state),
    }
})

export const DatetimeLabel = datetimeLabelConnector(DatetimeLabelContainer)

const UserAssigneeLabelComponent = ({
    assigneeUser,
    agents,
}: {
    assigneeUser: Map<any, any>
    agents: List<Map<any, any>>
}) => {
    const agent = agents.find(
        (agent) => agent!.get('id') === assigneeUser.get('id')
    )
    const avatarUrl =
        assigneeUser.getIn(['meta', 'profile_picture_url']) ||
        (agent && agent.getIn(['meta', 'profile_picture_url']))
    return assigneeUser.isEmpty() ? null : (
        <div className={css.assigneeLabelContainer}>
            <Avatar
                name={assigneeUser.get('name')}
                url={avatarUrl}
                size={26}
                className={css.assigneeLabelAvatar}
            />
            <div className="d-inline-block">{assigneeUser.get('name')}</div>
        </div>
    )
}

export const UserAssigneeLabel = connect((state: RootState) => ({
    agents: getAgents(state),
}))(UserAssigneeLabelComponent)

type TeamAssigneeLabelProps = {assigneeTeam: Map<any, any>} & ConnectedProps<
    typeof teamAssigneeLabelConnector
>

const TeamAssigneeLabelComponent = ({
    assigneeTeam,
    teams,
}: TeamAssigneeLabelProps) => {
    const team = teams.find(
        (team) => team!.get('id') === assigneeTeam.get('id')
    )
    const emoji = team && (team.getIn(['decoration', 'emoji']) as Map<any, any>)

    return assigneeTeam.isEmpty() ? null : (
        <div className={css.assigneeLabelContainer}>
            {emoji ? (
                <span className={css.assigneeLabelAvatar}>
                    <Emoji
                        emoji={emoji.toJS()}
                        size={26}
                        sheetSize={32}
                        forceSize
                    />
                </span>
            ) : (
                <Avatar
                    name={assigneeTeam.get('name')}
                    size={26}
                    className={css.assigneeLabelAvatar}
                />
            )}
            <div className="d-inline-block">{assigneeTeam.get('name')}</div>
        </div>
    )
}

const teamAssigneeLabelConnector = connect((state: RootState) => ({
    teams: getTeams(state),
}))

export const TeamAssigneeLabel = teamAssigneeLabelConnector(
    TeamAssigneeLabelComponent
)

type RenderLabelProps = {
    field: Map<any, any>
    value?: any
}

export class RenderLabel extends Component<RenderLabelProps> {
    render() {
        const {field, value} = this.props

        if (!value) {
            return null
        }

        if (React.isValidElement(value)) {
            return value
        }

        switch (field.get('name')) {
            case 'tags':
                return <TagLabel>{value}</TagLabel>
            case 'created':
            case 'updated':
            case 'last_message':
            case 'last_received_message':
            case 'snooze':
            case 'closed':
                return <DatetimeLabel dateTime={value} />
            case 'status':
                return <StatusLabel status={value} />
            case 'assignee':
                return <UserAssigneeLabel assigneeUser={value} />
            case 'assignee_team':
                return <TeamAssigneeLabel assigneeTeam={value} />
            case 'integrations':
                return typeof value === 'string' ? (
                    <span>{value}</span>
                ) : (
                    <IntegrationsDetailLabel integration={value} />
                )
            case 'customer':
                return <CustomerLabel customer={value} />
            case 'role':
                return (
                    <RoleLabel
                        role={
                            isImmutable(value)
                                ? (value as Map<any, any>).toJS()
                                : value
                        }
                    />
                )
            case 'via':
            case 'channel':
                return <ChannelLabel channel={value} />
            default:
                return <span>{value}</span>
        }
    }
}
