// @flow
import React, {type Node} from 'react'
import {connect} from 'react-redux'
import {fromJS, type Map} from 'immutable'
import classnames from 'classnames'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import _capitalize from 'lodash/capitalize'
import {Badge} from 'reactstrap'

import {EMAIL_INTEGRATION_TYPES} from '../../../constants/integration'

import {ADMIN_ROLE, AGENT_ROLE, BASIC_AGENT_ROLE, LITE_AGENT_ROLE, OBSERVER_AGENT_ROLE, STAFF_ROLE} from '../../../config/user'
import Tooltip from '../components/Tooltip'
import Avatar from '../components/Avatar'
import {formatDatetime, toJS, isImmutable, humanizeString} from '../../../utils'

import * as customersHelpers from '../../../state/customers/helpers'
import {DEFAULT_TAG_COLOR} from '../../../config'
import SourceIcon from '../components/SourceIcon'

import type {SourceType} from '../../../models/ticket/types'

import css from './labels.less'


/**
 * AGENT
 */
type AgentLabelProps = {
    name?: string,
    maxWidth?: string,
    email?: string,
    className?: string,
    profilePictureUrl?: string,
    avatar?: boolean,
}

export class AgentLabel extends React.Component<AgentLabelProps> {
    static defaultProps = {
        name: '',
        email: '',
        className: '',
        profilePictureUrl: '',
        avatar: false,
    }

    render() {
        const {
            name,
            maxWidth,
            email,
            className,
            profilePictureUrl,
            avatar,
        } = this.props
        const showAvatar = avatar || profilePictureUrl || email
        const style = {}
        if (maxWidth) {
            style.maxWidth = `${maxWidth}px`
        }

        return (
            <div className={classnames(css.AgentLabel, 'd-inline-flex align-items-center', className)}>
                {
                    showAvatar ? (
                        <Avatar
                            email={email}
                            name={name}
                            url={profilePictureUrl}
                            size="26"
                            className={css.avatar}
                        />
                    ) : (
                        <span className="material-icons md-2">
                            account_circle
                        </span>
                    )
                }


                {
                    name && (
                        <span
                            className={classnames(css.name, 'font-weight-medium')}
                            style={style}
                        >
                            {name}
                        </span>
                    )
                }
            </div>
        )
    }
}

/**
 * USER
 */
type CustomerLabelParamType = {
    customer: {
        name: string,
        id: string
    }
}
export const CustomerLabel = ({customer}: CustomerLabelParamType) => {
    if (_isString(customer)) {
        // flow discourages type detection
        // $FlowFixMe
        return (<span>{customer}</span>)
    }

    return (
        <span>{customersHelpers.getDisplayName(customer)}</span>
    )
}
CustomerLabel.displayName = 'CustomerLabel'

/**
 * TAG
 */
type TagLabelParamType = {
    style: {
        color?: string
    },
    decoration?: Map<*, *>,
    children?: Node,
}
export const TagLabel = ({decoration, children}: TagLabelParamType) => {
    const color = (decoration || fromJS({})).get('color') || DEFAULT_TAG_COLOR

    return (
        <Badge
            className="badge-tag"
            style={{color}}
        >
            {children}
        </Badge>
    )
}
TagLabel.defaultProps = {
    style: {},
}
TagLabel.displayName = 'TagLabel'

/**
 * STATUS
 */
type StatusLabelParam = {
    status: string
}
export const StatusLabel = ({status, ...rest}: StatusLabelParam) => {
    let color = 'info'

    switch (status) {
        case 'open':
            color = 'primary'
            break
        case 'closed':
            color = 'secondary'
            break
        default:
    }

    return (
        <Badge
            className="text-center"
            color={color}
            pill
            {...rest}
        >
            {status}
        </Badge>
    )
}
StatusLabel.displayName = 'StatusLabel'

/**
 * CHANNEL
 */

export const ChannelLabel = ({channel}: { channel: SourceType }) => (
    <SourceIcon
        type={channel}
        className="text-secondary"
    />
)

/**
 *  Source DETAIL
 */
export const IntegrationsDetailLabel = ({integration}: { integration: Map<*, *> }) => {
    const type = integration.get('type')
    let label = integration.get('name', integration.get('address'))
    let address = integration.get('address') || integration.getIn(['meta', 'address'])

    if (EMAIL_INTEGRATION_TYPES.includes(type) && address) {
        label = `${integration.get('name')} <${address}>`
    } else if (type === 'aircall' && address) {
        label = `${integration.get('name')} (${address})`
    }

    return (
        <span>
            <SourceIcon
                type={integration.get('type')}
                className="mr-2"
            />
            {label}
        </span>
    )
}
IntegrationsDetailLabel.displayName = 'IntegrationsDetailLabel'

/**
 * ROLE
 */
export const RoleLabel = ({roles = 'user'}: { roles: string }) => {
    roles = toJS(roles)

    if (!_isArray(roles)) {
        // flow discourages type detection
        // $FlowFixMe
        roles = [roles]
    }

    // if there are roles in the incoming array
    if (roles.length) {
        // if roles are objects (like {name: 'refund'})
        if (_isObject(roles[0])) {
            if (roles[0].name) {
                // $FlowFixMe
                roles = roles.map((v) => v.name)
            }
        }
    }

    let color = null
    let role = null

    if (roles.includes(STAFF_ROLE)) {
        color = 'dark'
        role = _capitalize(STAFF_ROLE)
    } else if (roles.includes(ADMIN_ROLE)) {
        color = 'danger'
        role = _capitalize(ADMIN_ROLE)
    } else if (roles.includes(AGENT_ROLE)) {
        color = 'warning'
        role = 'Lead agent'
    } else if (roles.includes(BASIC_AGENT_ROLE)) {
        color = 'info'
        role = _capitalize(humanizeString(BASIC_AGENT_ROLE))
    } else if (roles.includes(LITE_AGENT_ROLE)) {
        color = 'primary'
        role = _capitalize(humanizeString(LITE_AGENT_ROLE))
    } else if (roles.includes(OBSERVER_AGENT_ROLE)) {
        color = 'success'
        role = _capitalize(humanizeString(OBSERVER_AGENT_ROLE))
    }

    return (
        <Badge
            color={color}
            className="badge-pill"
        >
            {role}
        </Badge>
    )
}
RoleLabel.displayName = 'RoleLabel'

/**
 * DATETIME
 */
type DatetimeLabelProps = {
    dateTime?: string,
    labelFormat?: string,
    timezone?: string,
}

export class DatetimeLabel extends React.Component<DatetimeLabelProps> {
    id: string

    constructor(props: DatetimeLabelProps) {
        super(props)
        this.id = `datetime-tooltip-${Math.random().toString(36).slice(2)}` // generates a random unique id
    }

    render() {
        const {dateTime, labelFormat, timezone, ...rest} = this.props

        if (!dateTime) {
            return null
        }

        const labelDatetime = formatDatetime(dateTime, timezone, labelFormat)
        const tooltipDatetime = formatDatetime(dateTime, timezone, 'L LT')

        return (
            <span {...rest}>
                <span id={this.id}>
                    {labelDatetime}
                </span>
                <Tooltip
                    placement="top"
                    target={this.id}
                    delay={{show: 200, hide: 0}}
                >
                    {tooltipDatetime}
                </Tooltip>
            </span>
        )
    }
}

const mapStateToProps = (state) => ({
    timezone: state.currentUser.get('timezone'),
})
connect(mapStateToProps)(DatetimeLabel)

type RenderLabelProps = {
    field: Map<*, *>,
    value?: any,
}

export class RenderLabel extends React.Component<RenderLabelProps> {
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
                return (
                    <DatetimeLabel
                        dateTime={value}
                    />
                )
            case 'status':
                return <StatusLabel status={value}/>
            case 'assignee':
                return value.isEmpty() ? null : (
                    <div>
                        <Avatar
                            email={value.get('email')}
                            name={value.get('name')}
                            url={value.getIn(['meta', 'profile_picture_url'])}
                            size={26}
                            className="d-inline-block mr-2"
                        />
                        <div className="d-inline-block">{value.get('name')}</div>
                    </div>

                )
            case 'integrations':
                return typeof value === 'string' ? <span>{value}</span> :
                    <IntegrationsDetailLabel integration={value}/>
            case 'customer':
                return <CustomerLabel customer={value}/>
            case 'roles':
                return <RoleLabel roles={isImmutable(value) ? value.toJS() : value}/>
            case 'via':
            case 'channel':
                return <ChannelLabel channel={value}/>
            default:
                return <span>{value}</span>
        }
    }
}
