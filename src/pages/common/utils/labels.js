// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import {Badge} from 'reactstrap'

import Tooltip from '../components/Tooltip'
import Avatar from '../components/Avatar'
import {formatDatetime, toJS, isImmutable} from '../../../utils'

import * as customersHelpers from '../../../state/customers/helpers'
import {DEFAULT_TAG_COLOR} from '../../../config'
import SourceIcon from '../components/SourceIcon'

import css from './labels.less'

import type {Node} from 'react'
import type {Map} from 'immutable'

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
export const TagLabel = ({decoration, children, style}: TagLabelParamType) => {
    style.color = (decoration || fromJS({})).get('color') || DEFAULT_TAG_COLOR

    return (
        <Badge
            className="badge-tag"
            style={style}
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
export const ChannelLabel = ({channel}: { channel: string }) => (
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

    if (['email', 'gmail'].includes(type) && address) {
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
                roles = roles.map(v => v.name)
            }
        }
    }

    let color = 'secondary'
    let role = 'User'

    if (roles.includes('staff')) {
        color = 'danger'
        role = 'Staff'
    } else if (roles.includes('admin')) {
        color = 'info'
        role = 'Admin'
    } else if (roles.includes('agent')) {
        color = 'warning'
        role = 'Agent'
    }

    return (
        <Badge color={color}>
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
