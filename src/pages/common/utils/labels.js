import React, {PropTypes} from 'react'
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
import {sourceTypeToIcon} from '../../../config/ticket'

import * as usersHelpers from '../../../state/users/helpers'
import {DEFAULT_TAG_COLOR} from '../../../config'
import SourceIcon from '../components/SourceIcon'

/**
 * AGENT
 */
export class AgentLabel extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        maxWidth: PropTypes.string,
        email: PropTypes.string,
        className: PropTypes.string,
        profilePictureUrl: PropTypes.string
    }

    render() {
        const {name = '', maxWidth, email = '', className = '', profilePictureUrl = ''} = this.props
        const style = {}

        if (maxWidth) {
            style.maxWidth = `${maxWidth}px`
        }

        return (
            <div className={classnames('agent-label d-inline-flex align-items-center', className)}>
                {
                    email ? (
                        <Avatar
                            email={email}
                            name={name}
                            url={profilePictureUrl}
                            size="26"
                            className="agent-avatar"
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
                            className="agent-name font-weight-medium"
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
export const UserLabel = ({user}) => {
    if (_isString(user)) {
        return <span>{user}</span>
    }

    return (
        <span>{usersHelpers.getDisplayName(user)}</span>
    )
}
UserLabel.propTypes = {
    user: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
}

/**
 * TAG
 */
export const TagLabel = ({decoration, children, style}) => {
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
TagLabel.propTypes = {
    children: PropTypes.node,
    decoration: PropTypes.object,
    style: PropTypes.object.isRequired,
}
TagLabel.defaultProps = {
    style: {},
}

/**
 * STATUS
 */
export const StatusLabel = ({status, ...rest}) => {
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
StatusLabel.propTypes = {
    status: PropTypes.string.isRequired,
}

/**
 * CHANNEL
 */
export const ChannelLabel = ({channel}) => (
    <SourceIcon type={channel} className="text-secondary"/>
)
ChannelLabel.propTypes = {channel: PropTypes.string.isRequired}

/**
 *  Source DETAIL
 */
export const IntegrationsDetailLabel = ({integration}) => {
    const type = integration.get('type')
    let label = integration.get('name', integration.get('address'))

    if (['email', 'gmail'].includes(type) && integration.get('address')) {
        label = `${integration.get('name')} <${integration.get('address')}>`
    } else if (type === 'aircall' && integration.get('address')) {
        label = `${integration.get('name')} (${integration.get('address')})`
    }

    return (
        <span>
            <i className={classnames('mr-2', sourceTypeToIcon(integration.get('type')))}/>
            {label}
        </span>
    )
}
IntegrationsDetailLabel.propTypes = {
    integration: PropTypes.object.isRequired
}

/**
 * ROLE
 */
export const RoleLabel = ({roles = 'user'}) => {
    roles = toJS(roles)

    if (!_isArray(roles)) {
        roles = [roles]
    }

    // if there are roles in the incoming array
    if (roles.length) {
        // if roles are objects (like {name: 'refund'})
        if (_isObject(roles[0])) {
            if (roles[0].name) {
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
RoleLabel.propTypes = {roles: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]).isRequired}

/**
 * DATETIME
 */
export class DatetimeLabel extends React.Component {
    static propTypes = {
        dateTime: PropTypes.string,
        timezone: PropTypes.string,
    }

    constructor(props) {
        super(props)
        this.id = `datetime-tooltip-${Math.random().toString(36).slice(2)}` // generates a random unique id
    }

    render() {
        const {dateTime, timezone, ...rest} = this.props

        if (!dateTime) {
            return null
        }

        const labelDatetime = formatDatetime(dateTime, timezone)
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

export class RenderLabel extends React.Component {
    static propTypes = {
        field: PropTypes.object.isRequired,
        value: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
    }

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
            case 'requester':
                return <UserLabel user={value}/>
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
