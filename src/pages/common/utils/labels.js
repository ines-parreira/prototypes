import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import {fromJS} from 'immutable'
import {Badge, UncontrolledTooltip} from 'reactstrap'
import {formatDatetime, toJS, isImmutable} from '../../../utils'
import {sourceTypeToIcon} from '../../../config/ticket'

/**
 * AGENT
 */
export const AgentLabel = ({name = ''}) => {
    return (
        <span className="agent-label d-inline-flex align-items-center">
            <Badge
                className="agent-id-label"
                color="warning"
            >
                A
            </Badge>
            {
                name && (
                    <span className="secondary-action">
                        {name}
                    </span>
                )
            }
        </span>
    )
}
AgentLabel.propTypes = {name: PropTypes.string}

/**
 * USER
 */
export const UserLabel = ({name = ''}) => <span>{name}</span>
UserLabel.propTypes = {name: PropTypes.string}

/**
 * TAG
 */
export const TagLabel = ({decoration, children, style}) => {
    style.color = (decoration || fromJS({})).get('color') || '#0275d8'

    return (
        <Badge
            className="tag"
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
    let color = 'primary'

    switch (status) {
        case 'open':
            color = 'secondary'
            break
        case 'new':
            color = 'info'
            break
        case 'closed':
            color = 'success'
            break
        default:
    }

    return (
        <Badge
            className="text-center"
            color={color}
            style={{width: '56px'}}
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
    <Badge color="secondary">
        {channel}
    </Badge>
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
    }

    return (
        <span>
            <i className={classnames('mr-2', sourceTypeToIcon(integration.get('type')))} />
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
        const {dateTime, timezone} = this.props

        if (!dateTime) {
            return null
        }

        const labelDatetime = formatDatetime(dateTime, timezone)
        const tooltipDatetime = formatDatetime(dateTime, timezone, 'L LT')

        return (
            <span>
                <span id={this.id}>
                    {labelDatetime}
                </span>
                <UncontrolledTooltip
                    placement="top"
                    target={this.id}
                    delay={{show: 200, hide: 0}}
                >
                    {tooltipDatetime}
                </UncontrolledTooltip>
            </span>
        )
    }
}
const mapStateToProps = (state) => ({
    timezone: state.currentUser.get('timezone'),
})
connect(mapStateToProps)(DatetimeLabel)

export const RenderLabel = ({field, value}) => {
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
            return (
                <DatetimeLabel
                    dateTime={value}
                />
            )
        case 'status':
            return <StatusLabel status={value} />
        case 'assignee':
            return value.get('name') ? <AgentLabel name={value.get('name')} /> : null
        case 'integrations':
            return typeof value === 'string' ? <span>{value}</span> : <IntegrationsDetailLabel integration={value} />
        case 'requester':
            return <UserLabel name={value.get('name')} />
        case 'roles':
            return <RoleLabel roles={isImmutable(value) ? value.toJS() : value} />
        case 'via':
        case 'channel':
            return <ChannelLabel channel={value} />
        default:
            return <span>{value}</span>
    }
}
RenderLabel.propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
}
