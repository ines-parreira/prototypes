import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Badge} from 'reactstrap'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import {fromJS} from 'immutable'
import {UncontrolledTooltip} from 'reactstrap'
import {formatDatetime, isImmutable} from '../../../utils'
import {USER_CHANNEL_CLASS} from '../../../config'

/**
 * AGENT
 */
export const AgentLabel = ({name = ''}) => {
    return (
        <div className="agent-label d-inline-flex align-items-center">
            <span className="agent-id-label ui medium yellow label">A</span>
            {
                name && (
                    <span className="secondary-action">
                        {name}
                    </span>
                )
            }
        </div>
    )
}
AgentLabel.propTypes = {name: PropTypes.string}

/**
 * USER
 */
export const UserLabel = ({name = ''}) => <div>{name}</div>
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
 * PRIORITY
 */
export const PriorityLabel = ({priority}) => {
    const className = classnames('ticket-priority flag icon', priority, {
        outline: priority !== 'high'
    })
    return <i className={className} />
}
PriorityLabel.propTypes = {priority: PropTypes.string.isRequired}

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
    <span className={`ticket-channel ui label ${channel}`}>
        {channel}
    </span>
)
ChannelLabel.propTypes = {channel: PropTypes.string.isRequired}

/**
 *  Source DETAIL
 */
export const SourceDetailLabel = ({value}) => (
    <div>
        <i className={USER_CHANNEL_CLASS[value.get('type')]} />
        {value.get('name') ? `${value.get('name')} <${value.get('address')}>` : value.get('address')}
    </div>
)
SourceDetailLabel.propTypes = {
    value: PropTypes.object.isRequired
}

/**
 * ROLE
 */
export const RoleLabel = ({roles = 'user'}) => {
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

    if (roles.includes('staff')) {
        return <div className="ui red smaller label">Staff</div>
    } else if (roles.includes('admin')) {
        return <div className="ui blue smaller label">Admin</div>
    } else if (roles.includes('agent')) {
        return <div className="ui yellow smaller label">Agent</div>
    }

    return <div className="ui grey smaller label">User</div>
}
RoleLabel.propTypes = {roles: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]).isRequired}

/**
 * DATETIME
 */
export class DatetimeLabel extends React.Component {
    static propTypes = {
        dateTime: PropTypes.string,
        timezone: PropTypes.string
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
        case 'priority':
            return <PriorityLabel priority={value} />
        case 'assignee':
            return value.get('name') ? <AgentLabel name={value.get('name')} /> : null
        case 'source':
            return typeof value === 'string' ? <div>{value}</div> : <SourceDetailLabel value={value} />
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
