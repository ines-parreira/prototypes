import { isValidElement, ReactNode, useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import classNames from 'classnames'
import { Emoji } from 'emoji-mart'
import { Map } from 'immutable'

import { Badge, ColorType } from '@gorgias/axiom'

import { isImmutable } from 'common/utils'
import { UserRole } from 'config/types/user'
import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { isStoreIntegration } from 'models/integration/types'
import { SourceType } from 'models/ticket/types'
import { ViewField } from 'models/view/types'
import DEPRECATED_Avatar from 'pages/common/components/Avatar/Avatar'
import SourceIcon from 'pages/common/components/SourceIcon'
import TicketTag from 'pages/common/components/TicketTag'
import { PriorityLabel } from 'pages/tickets/common/components/PriorityLabel'
import { Avatar } from 'pages/tickets/detail/components/TicketMessages/Avatar'
import { getHumanAgents } from 'state/agents/selectors'
import { getDisplayName } from 'state/customers/helpers'
import { getIntegrationChannel } from 'state/integrations/selectors'
import { getTeams } from 'state/teams/selectors'
import { parseTimeDelta } from 'tickets/common/utils'
import { sanitizeHtmlDefault } from 'utils/html'

import { IntegrationIcon } from '../components/IntegrationIcon/IntegrationIcon'
import DatetimeLabel from './DatetimeLabel'

import css from './labels.less'

export const RecipientsLabel = ({ recipients }: { recipients: string }) => (
    <>
        {recipients.split(',').map((recipient) => (
            <div key={recipient} className={css.recipientLabel}>
                {recipient}
            </div>
        ))}
    </>
)

export function AgentLabel({
    className = '',
    maxWidth,
    name = '',
    profilePictureUrl = '',
    shouldDisplayAvatar = false,
    size = 26,
    semibold,
    isAIAgent = false,
    badgeColor,
    id,
    status,
}: {
    className?: string
    maxWidth?: string
    name?: string
    profilePictureUrl?: string | null
    shouldDisplayAvatar?: boolean
    size?: number
    semibold?: boolean
    isAIAgent?: boolean
    badgeColor?: string
    id?: string
    status?: 'away' | 'offline' | 'online'
}) {
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const showAvatar = shouldDisplayAvatar || profilePictureUrl

    return (
        <div className={classNames(css.AgentLabel, className)} id={id}>
            {showAvatar ? (
                hasTicketThreadRevamp ? (
                    <Avatar
                        name={name}
                        size="sm"
                        url={profilePictureUrl ?? undefined}
                        status={status}
                    />
                ) : (
                    <DEPRECATED_Avatar
                        name={name}
                        url={profilePictureUrl}
                        size={size}
                        className={css.avatar}
                        badgeColor={badgeColor}
                    />
                )
            ) : (
                !isAIAgent && (
                    <span
                        className={classNames(
                            css.agentIcon,
                            'material-icons md-2',
                        )}
                        aria-label={`${name} icon`}
                    >
                        account_circle
                    </span>
                )
            )}

            {name && (
                <span
                    className={classNames(css.name, {
                        [css.semibold]: semibold,
                        [css.aiAgent]: isAIAgent,
                    })}
                    {...(typeof maxWidth !== 'undefined'
                        ? { style: { maxWidth: `${maxWidth}px` } }
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
    <div className={classNames(css.TeamLabel, className)}>
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
                <DEPRECATED_Avatar
                    name={name}
                    size={26}
                    className={css.avatar}
                />
            )
        ) : (
            <span className="material-icons md-2">people</span>
        )}
        {name && (
            <span
                className={css.name}
                {...(typeof maxWidth !== 'undefined'
                    ? { style: { maxWidth: `${maxWidth}px` } }
                    : {})}
            >
                {name}
                {shouldDisplayTeamIcon && (
                    <span
                        className={classNames(
                            css.nameIcon,
                            'material-icons md-2',
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
        // TODO(React18): Find a solution to casting to ReactNode once we upgrade to React 18 types
        <span>{getDisplayName(customer) as ReactNode}</span>
    )

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
        <Badge className={classNames('text-center', className)} type="grey">
            {durationArray.join(',')}
        </Badge>
    )
}

const STATUS_TO_BADGE: Record<string, ColorType> = {
    open: 'classic',
    snoozed: 'blue',
    closed: 'light-dark',
}

export const StatusLabel = ({
    className,
    status,
}: {
    className?: string
    status: string
}) => {
    const type = STATUS_TO_BADGE[status] || 'modern'

    return (
        <Badge className={className ?? 'text-center'} type={type}>
            {status}
        </Badge>
    )
}

export const ChannelLabel = ({ channel }: { channel: SourceType }) => (
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

    const isStore = useMemo(
        () => isStoreIntegration(integration.toJS()),
        [integration],
    )

    return (
        <span>
            {isStore ? (
                <IntegrationIcon
                    kind={integration.get('type')}
                    className={css.storeIcon}
                />
            ) : (
                <SourceIcon type={channel} className="mr-2" />
            )}

            {label}
        </span>
    )
}

export const RoleLabel = ({
    role,
}: {
    role: { id?: number; name: UserRole }
}) => {
    let color: ColorType | undefined
    let label = null

    if (role.name === UserRole.Admin) {
        color = 'light-error'
        label = 'Admin'
    } else if (role.name === UserRole.Agent) {
        color = 'light-warning'
        label = 'Lead'
    } else if (role.name === UserRole.BasicAgent) {
        color = 'teal'
        label = 'Basic'
    } else if (role.name === UserRole.LiteAgent) {
        color = 'light-purple'
        label = 'Lite'
    } else if (role.name === UserRole.ObserverAgent) {
        color = 'light-grey'
        label = 'Observer'
    } else if (role.name === UserRole.Bot) {
        color = 'blue'
        label = 'Bot'
    } else if (role.name === UserRole.GorgiasAgent) {
        color = 'blue'
        label = 'Gorgias Support'
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
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const agents = useAppSelector(getHumanAgents)

    const agent = agents.find(
        (agent: Map<any, any>) => agent.get('id') === assigneeUser.get('id'),
    ) as Map<any, any>
    const avatarUrl =
        assigneeUser.getIn(['meta', 'profile_picture_url']) ||
        (agent && agent.getIn(['meta', 'profile_picture_url']))

    return assigneeUser.isEmpty() ? null : (
        <div className={css.assigneeLabelContainer}>
            {hasTicketThreadRevamp ? (
                <Avatar
                    isAgent={!!agent}
                    name={assigneeUser.get('name')}
                    url={avatarUrl}
                    size="sm"
                />
            ) : (
                <DEPRECATED_Avatar
                    name={assigneeUser.get('name')}
                    email={assigneeUser.get('email')}
                    url={avatarUrl}
                    size={size || 26}
                    className={css.assigneeLabelAvatar}
                />
            )}
            <div
                className="d-inline-block"
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlDefault(assigneeUser.get('name')),
                }}
            />
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
        (team) => team!.get('id') === assigneeTeam.get('id'),
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
                <DEPRECATED_Avatar
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

    if (isValidElement(value)) {
        return value
    }

    switch (field.get('name')) {
        case ViewField.Tags:
            return <TicketTag text={value} />
        case ViewField.Created:
        case ViewField.Updated:
        case ViewField.LastMessage:
        case ViewField.LastReceivedMessage:
        case ViewField.Snooze:
        case ViewField.Closed:
            return <DatetimeLabel dateTime={value} />
        case ViewField.Status:
            return <StatusLabel status={value} />
        case ViewField.Assignee:
            return (
                <UserAssigneeLabel
                    assigneeUser={value}
                    key={(value as Map<any, any>).get('name')}
                />
            )
        case ViewField.AssigneeTeam:
            return <TeamAssigneeLabel assigneeTeam={value} />
        case ViewField.Integrations:
            return typeof value === 'string' ? (
                <span>{value}</span>
            ) : (
                <IntegrationsDetailLabel integration={value} />
            )
        case ViewField.Store:
            return (
                <IntegrationsDetailLabel
                    integration={value.get('integration')}
                />
            )
        case ViewField.Customer:
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
        case ViewField.Channel:
            return <ChannelLabel channel={value} />
        case ViewField.Priority:
            return <PriorityLabel priority={value} />
        default:
            return <span>{value}</span>
    }
}
