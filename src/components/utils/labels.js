import React, {PropTypes} from 'react'
import {formatDatetime} from '../../utils'
import classNames from 'classnames'

export const AgentLabel = ({agent}) => (
    <span>
        <span className="agent-label ui mini yellow label">A</span>
        <span className="secondary-action">{agent.name}</span>
    </span>
)
AgentLabel.propTypes = {agent: PropTypes.object.isRequired}

export const UserLabel = ({user}) => (
    <span>{user.name}</span>
)
UserLabel.propTypes = {user: PropTypes.object.isRequired}

export const TagLabel = ({tag}) => (
    <button className="ui light blue mini basic label">{tag.name}</button>
)
TagLabel.propTypes = {tag: PropTypes.object.isRequired}


export const PriorityLabel = ({priority}) => {
    const className = classNames(
        'ticket-priority', priority, 'flag', 'icon',
        {outline: priority !== 'high'},
    )
    return (<i className={className}/>)
}
PriorityLabel.propTypes = {priority: PropTypes.string.isRequired}


export const StatusLabel = ({status}) => (
    <span className={`ticket-status ticket-details-item ui ${status} label`}>
        {status}
    </span>
)
StatusLabel.propTypes = {status: PropTypes.string.isRequired}

export const ChannelLabel = ({channel}) => (
    <span className={`ticket-channel ui ${channel} label`}>
        {channel}
    </span>
)
ChannelLabel.propTypes = {channel: PropTypes.string.isRequired}


export const RenderLabel = (field, value) => {
    if (!value) {
        return null
    }

    switch (field.type) {
        case 'plain':
        case 'composite':
        case 'tags':
            return value
        case 'datetime':
            return formatDatetime(value)
        case 'status':
            return <StatusLabel status={value}/>
        case 'priority':
            return (<PriorityLabel priority={value}/>)
        case 'agent':
            return (<AgentLabel agent={value}/>)
        case 'user':
            return (<UserLabel user={value}/>)
        case 'channel':
            return <ChannelLabel channel={value}/>
        default:
            console.error('Invalid field type', field.type)
    }
}


