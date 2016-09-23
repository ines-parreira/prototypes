import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import InfobarWidgets from './InfobarWidgets'
import {isTicketDifferent} from './../../../common/utils'
import {canDrop, areSourcesReady} from './utils'
import {USER_CHANNEL_CLASS} from '../../../../../config'

export default class TicketInfobar extends React.Component {
    constructor(props) {
        super(props)

        this.ticketTemplate = fromJS([])
    }

    shouldComponentUpdate(nextProps) {
        return isTicketDifferent(this.props.ticket, nextProps.ticket) || !this.props.widgets.equals(nextProps.widgets)
    }

    componentWillMount() {
        this._initWidgets()
    }

    componentWillReceiveProps(nextProps) {
        this._initWidgets(nextProps)
    }

    componentWillUnmount() {
        this.props.actions.resetWidgets()
    }

    _initWidgets = (props = this.props) => {
        this.ticketTemplate = props.widgets
            .get('items', fromJS([]))
            .find((w) => w.get('context', '') === 'ticket', null, fromJS({}))
            .get('template', fromJS([]))

        if (props.widgets.getIn(['_internal', 'hasFetchedWidgets'])) {
            const shouldGenerateWidgets = areSourcesReady(props.sources)
                && this.ticketTemplate.isEmpty()
                && !props.widgets.getIn(['_internal', 'hasGeneratedWidgets'])

            // if no widgets, generate them from incoming json
            if (shouldGenerateWidgets) {
                props.actions.generateAndSetWidgets(props.sources)
            }
        }
    }

    _renderUserChannels = (ticket) => {
        return ticket
            .getIn(['requester', 'channels'], fromJS([]))
            .map((channel, idx) => {
                let props = null
                let addressComponent = null
                const address = channel.get('address', '')

                if (!address) {
                    return
                }

                switch (channel.get('type')) {
                    case 'email':
                        props = {
                            href: `mailto:${address}`
                        }
                        break
                    case 'twitter':
                        props = {
                            href: `https://twitter.com/${address}`,
                            target: '_blank'
                        }
                        break
                    case 'facebook':
                        props = {
                            href: `https://facebook.com/${address}`,
                            target: '_blank'
                        }
                        break
                    default:
                        props = null
                }

                if (props) {
                    addressComponent = <a {...props}>{address}</a>
                } else {
                    addressComponent = <span>{address}</span>
                }

                const iconClass = USER_CHANNEL_CLASS[channel.get('type')]

                if (!iconClass) {
                    return
                }

                return (
                    <p key={idx} className="user-channel">
                        <i className={iconClass} />
                        {addressComponent}
                    </p>
                )
            })
    }

    render() {
        const {ticket, isEditing} = this.props

        if (!ticket || !ticket.get('requester')) {
            return null
        }

        const isDragging = this.props.widgets.getIn(['_internal', 'drag', 'isDragging'])

        const widgets = isEditing
            ? this.props.widgets.getIn(['_internal', 'editedTemplate'])
            : this.ticketTemplate || fromJS([])

        return (
            <div>
                <div className="infobar-top">
                    <h2>{ticket.getIn(['requester', 'name'])}</h2>
                    {this._renderUserChannels(ticket)}
                </div>
                {
                    areSourcesReady(this.props.sources) && (
                        <div>
                            <div className="infobar-section-separator"></div>
                            <InfobarWidgets
                                source={this.props.sources}
                                widgets={widgets}
                                editing={isEditing ? {
                                    isEditing,
                                    isDragging,
                                    _internal: this.props.widgets.get('_internal', fromJS({})),
                                    actions: this.props.actions,
                                    canDrop: (targetAbsolutePath, targetTemplateParent) => {
                                        const sourceAbsolutePath = this.props.widgets.getIn(['_internal', 'drag', 'absolutePath'])
                                        return isDragging
                                            && canDrop(sourceAbsolutePath, widgets, targetAbsolutePath, targetTemplateParent)
                                    }
                                } : undefined}
                            />
                        </div>
                    )
                }
            </div>
        )
    }
}

TicketInfobar.propTypes = {
    sources: PropTypes.object.isRequired,
    isEditing: PropTypes.bool,
    ticket: PropTypes.object,
    widgets: PropTypes.object,
    actions: PropTypes.object.isRequired
}
