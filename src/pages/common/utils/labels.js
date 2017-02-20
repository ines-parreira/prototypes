import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import {merge} from 'lodash'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import {fromJS} from 'immutable'
import {formatDatetime, isImmutable} from '../../../utils'

/**
 * AGENT
 */
export const AgentLabel = ({name = ''}) => {
    return (
        <span className="agent-label">
            <span className="agent-id-label ui medium yellow label">A</span>
            {name && <span className="secondary-action">{name.toUpperCase()}</span>}
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
export const TagLabel = ({name = '', decoration, className, children}) => {
    const color = (decoration || fromJS({})).get('color')
    const labelClassName = classNames('ui light basic label', className, {
        blue: !color
    })

    const labelStyle = {
        color,
        borderColor: color
    }

    return (
        <div className={labelClassName} style={labelStyle}>
            {name}
            {children}
        </div>
    )
}
TagLabel.propTypes = {
    name: PropTypes.string,
    decoration: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.object
}

/**
 * PRIORITY
 */
export const PriorityLabel = ({priority}) => {
    const className = classNames('ticket-priority flag icon', priority, {
        outline: priority !== 'high'
    })
    return <i className={className} />
}
PriorityLabel.propTypes = {priority: PropTypes.string.isRequired}

/**
 * STATUS
 */
export const StatusLabel = ({status}) => (
    <span className={`ticket-status smaller ticket-details-item ui label ${status}`}>
        {status}
    </span>
)
StatusLabel.propTypes = {status: PropTypes.string.isRequired}

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
 * CHANNEL DETAIL
 */
export const ChannelDetailLabel = ({channel}) => (
    <span>
        {channel.get('user') ? `
            ${channel.getIn(['user', 'name'])}
            <${channel.get('address')}>
        ` : channel.get('address')}
    </span>
)
ChannelDetailLabel.propTypes = {
    channel: PropTypes.object.isRequired
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
        settings: PropTypes.object,
        timezone: PropTypes.string
    }

    componentDidMount() {
        let settings = {
            hoverable: true,
            variation: 'tiny inverted',
            delay: {
                show: 200,
                hide: 100
            }
        }

        if (this.props.settings) {
            settings = merge(settings, this.props.settings)
        }

        $(this.refs.tooltip).popup(settings)
    }

    componentWillUnmount() {
        $(this.refs.tooltip).popup('destroy')
    }

    render() {
        const {dateTime, timezone} = this.props

        if (!dateTime) {
            return
        }

        const labelDatetime = formatDatetime(dateTime, timezone)
        const tooltipDatetime = formatDatetime(dateTime, timezone, 'L LT')

        return (
            <span
                ref="tooltip"
                data-html={tooltipDatetime}
            >
                {labelDatetime}
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
            return <TagLabel name={value} />
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
        case 'to':
            return <ChannelDetailLabel channel={value} />
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
