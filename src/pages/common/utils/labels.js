import React, {PropTypes} from 'react'
import classNames from 'classnames'
import {merge} from 'lodash'
import {formatDatetime} from '../../../utils'

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
    return (<i className={className} />)
}
PriorityLabel.propTypes = {priority: PropTypes.string.isRequired}


export const StatusLabel = ({status}) => (
    <span className={`ticket-status smaller ticket-details-item ui ${status} label`}>
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
            return null
        }

        const labelDatetime = formatDatetime(dateTime, timezone)
        const tooltipDatetime = formatDatetime(dateTime, timezone, 'L LT')

        return (
            <span ref="tooltip"
                  data-html={tooltipDatetime}
            >
                {labelDatetime}
            </span>
        )
    }
}

export const RenderLabel = (field, value, timezone = null) => {
    if (!value) {
        return null
    }

    switch (field.type) {
        case 'address':
        case 'plain':
        case 'composite':
            return value
        case 'tags':
            return <TagLabel tag={value} />
        case 'datetime':
            return <DatetimeLabel dateTime={value} timezone={timezone} />
        case 'status':
            return <StatusLabel status={value} />
        case 'priority':
            return <PriorityLabel priority={value} />
        case 'agent':
            return <AgentLabel agent={value} />
        case 'user':
            return <UserLabel user={value} />
        case 'channel':
            return <ChannelLabel channel={value} />
        default:
            console.error('Invalid field type', field.type)
            return null
    }
}
