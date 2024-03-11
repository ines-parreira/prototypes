import React, {ReactNode} from 'react'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import {Badge as ReactstrapBadge} from 'reactstrap'
import {Emoji} from 'emoji-mart'

import {isImmutable} from 'common/utils'
import {DEFAULT_TAG_COLOR} from 'config'
import {UserRole} from 'config/types/user'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'

import {SourceType} from 'models/ticket/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import SourceIcon from 'pages/common/components/SourceIcon'
import {getAgents} from 'state/agents/selectors'
import {getDisplayName} from 'state/customers/helpers'
import {getIntegrationChannel} from 'state/integrations/selectors'
import {getTeams} from 'state/teams/selectors'
import {Theme, useTheme} from 'theme'
import {parseTimeDelta} from 'tickets/common/utils'
import {getTextColorBasedOnBackground} from 'utils/colors'

import DatetimeLabel from './DatetimeLabel'
import css from './labels.less'

export const RecipientsLabel = ({recipients}: {recipients: string}) => (
    <>
        {recipients.split(',').map((recipient) => (
            <div key={recipient} className={css.recipientLabel}>
                {recipient}
            </div>
        ))}
    </>
)

export function AgentLabel({
    name = '',
    className = '',
    maxWidth,
    profilePictureUrl = '',
    shouldDisplayAvatar = false,
}: {
    name?: string
    maxWidth?: string
    className?: string
    profilePictureUrl?: string | null
    shouldDisplayAvatar?: boolean
}) {
    const showAvatar = shouldDisplayAvatar || profilePictureUrl

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
                <span
                    className="material-icons md-2"
                    data-testid="accountCircle"
                >
                    account_circle
                </span>
            )}

            {name && (
                <span
                    className={css.name}
                    {...(typeof maxWidth !== 'undefined'
                        ? {style: {maxWidth: `${maxWidth}px`}}
                        : {})}
                >
                    {name}
                </span>
            )}
        </div>
    )
}

export const TeamLabel = ({
    name = '',
    maxWidth,
    className,
    emoji,
    shouldDisplayAvatar = false,
    shouldDisplayTeamIcon = false,
}: {
    name: string
    maxWidth?: number
    className?: string
    emoji?: Map<any, any>
    shouldDisplayAvatar?: boolean
    shouldDisplayTeamIcon?: boolean
}) => (
    <div className={classnames(css.TeamLabel, className)}>
        {shouldDisplayAvatar ? (
            emoji ? (
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
        ) : (
            <span className="material-icons md-2">people</span>
        )}
        {name && (
            <span
                className={css.name}
                {...(typeof maxWidth !== 'undefined'
                    ? {style: {maxWidth: `${maxWidth}px`}}
                    : {})}
            >
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

export const CustomerLabel = ({
    customer,
}: {
    customer:
        | {
              name: string
              id: string
          }
        | string
        | Map<any, any>
}) =>
    typeof customer === 'string' ? (
        <span>{customer}</span>
    ) : (
        <span>{getDisplayName(customer)}</span>
    )

export const TagLabel = ({
    className,
    decoration,
    children,
}: {
    className?: string
    decoration?: Map<any, any>
    children?: ReactNode
}) => {
    const color =
        ((decoration || fromJS({})) as Map<any, any>).get('color') ||
        DEFAULT_TAG_COLOR

    const theme = useTheme()
    const textColor = getTextColorBasedOnBackground(color)

    return (
        <ReactstrapBadge
            className={classnames('badge-tag', className)}
            style={
                theme === Theme.Dark
                    ? {
                          backgroundColor: color,
                          color: textColor,
                      }
                    : {color}
            }
        >
            {children}
        </ReactstrapBadge>
    )
}

export const TimedeltaLabel = ({
    duration,
    className,
}: {
    duration: string
    className?: string
}) => {
    const durationMoment = parseTimeDelta(duration)
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

export const StatusLabel = ({
    className,
    status,
}: {
    className?: string
    status: string
}) => {
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
        <Badge className={className ?? 'text-center'} type={color}>
            {status}
        </Badge>
    )
}

export const ChannelLabel = ({channel}: {channel: SourceType}) => (
    <SourceIcon type={channel} variant="secondary" />
)

export const IntegrationsDetailLabel = ({
    integration,
}: {
    integration: Map<any, any>
}) => {
    const type = integration.get('type')
    const channel =
        useAppSelector((state) => {
            const id = integration.get('id')
            if (!id) {
                return
            }

            const channel = getIntegrationChannel(id)(state)
            if (!channel) {
                return
            }

            return channel?.slug
        }) ?? type

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
            <SourceIcon type={channel} className="mr-2" />
            {label}
        </span>
    )
}

export const RoleLabel = ({role}: {role: {id?: number; name: UserRole}}) => {
    let color: ColorType | undefined
    let label = null

    if (role.name === UserRole.Admin) {
        color = ColorType.LightError
        label = 'Admin'
    } else if (role.name === UserRole.Agent) {
        color = ColorType.LightWarning
        label = 'Lead'
    } else if (role.name === UserRole.BasicAgent) {
        color = ColorType.Teal
        label = 'Basic'
    } else if (role.name === UserRole.LiteAgent) {
        color = ColorType.LightPurple
        label = 'Lite'
    } else if (role.name === UserRole.ObserverAgent) {
        color = ColorType.LightGrey
        label = 'Observer'
    }

    return <Badge type={color}>{label}</Badge>
}

export const UserAssigneeLabel = ({
    assigneeUser,
    size,
}: {
    assigneeUser: Map<any, any>
    size?: number
}) => {
    const agents = useAppSelector(getAgents)

    const agent = agents.find(
        (agent: Map<any, any>) => agent.get('id') === assigneeUser.get('id')
    ) as Map<any, any>
    const avatarUrl =
        assigneeUser.getIn(['meta', 'profile_picture_url']) ||
        (agent && agent.getIn(['meta', 'profile_picture_url']))
    return assigneeUser.isEmpty() ? null : (
        <div className={css.assigneeLabelContainer}>
            <Avatar
                name={assigneeUser.get('name')}
                url={avatarUrl}
                size={size || 26}
                className={css.assigneeLabelAvatar}
            />
            <div className="d-inline-block">{assigneeUser.get('name')}</div>
        </div>
    )
}

export const TeamAssigneeLabel = ({
    assigneeTeam,
}: {
    assigneeTeam: Map<any, any>
}) => {
    const teams = useAppSelector(getTeams)

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

export const RenderLabel = ({
    field,
    value,
}: {
    field: Map<any, any>
    value?: any
}) => {
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
