import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import InfobarWidgets from './InfobarWidgets'
import {isTicketDifferent} from './../../../common/utils'
import {canDrop, areSourcesReady} from './utils'

export default class TicketInfobar extends React.Component {
    constructor(props) {
        super(props)

        this.ticketTemplate = fromJS([])
    }

    shouldComponentUpdate(nextProps) {
        return isTicketDifferent(this.props.ticket, nextProps.ticket) || !this.props.widgets.equals(nextProps.widgets)
    }

    initWidgets(props = this.props) {
        this.ticketTemplate = props.widgets
            .get('items', fromJS([]))
            .find((w) => w.get('context', '') === 'ticket', null, fromJS({}))
            .get('template', fromJS([]))

        if (props.widgets.getIn(['_internal', 'hasFetchedWidgets'])) {
            // if no widgets, generate them from incoming json
            if (
                areSourcesReady(props.sources) &&
                this.ticketTemplate.isEmpty() &&
                !props.widgets.getIn(['_internal', 'hasGeneratedWidgets'])
            ) {
                props.actions.generateAndSetWidgets(props.sources)
            }
        }
    }

    componentWillMount() {
        this.initWidgets()
    }

    componentWillReceiveProps(nextProps) {
        this.initWidgets(nextProps)
    }

    componentWillUnmount() {
        this.props.actions.resetWidgets()
    }

    render() {
        const {ticket, isEditing} = this.props

        if (!ticket || !ticket.get('requester') || !this.props.widgets.get('items').size) {
            return null
        }

        const isDragging = this.props.widgets.getIn(['_internal', 'drag', 'isDragging'])

        const widgets = isEditing
            ? this.props.widgets.getIn(['_internal', 'editedTemplate'])
            : this.ticketTemplate || fromJS([])


        const userChannelClassNames = {
            email: 'icon mail',
            twitter: 'icon twitter',
            facebook: 'icon facebook square',
            chat: 'icon comments',
            phone: 'icon phone',
        }

        return (
            <div>
                <div className="infobar-top">
                    <h2>{ticket.getIn(['requester', 'name'])}</h2>
                    {
                        ticket.getIn(['requester', 'channels'], fromJS([])).map((channel, idx) => {
                            let props = null
                            let addressCmp = null

                            switch (channel.get('type')) {
                                case 'email':
                                    props = {
                                        href: `mailto:${channel.get('address')}`
                                    }
                                    break
                                case 'twitter':
                                    props = {
                                        href: `https://twitter.com/${channel.get('address')}`,
                                        target: '_blank'
                                    }
                                    break
                                case 'facebook':
                                    props = {
                                        href: `https://facebook.com/${channel.get('address')}`,
                                        target: '_blank'
                                    }
                                    break
                                default:
                                    props = null
                            }

                            if (props) {
                                addressCmp = <a {...props}>{channel.get('address')}</a>
                            } else {
                                addressCmp = <span>{channel.get('address')}</span>
                            }

                            const iconClass = userChannelClassNames[channel.get('type')]

                            if (!iconClass) {
                                return undefined
                            }

                            return (
                                <p key={idx} className="user-channel">
                                    <i className={iconClass}/>
                                    {addressCmp}
                                </p>
                            )
                        })
                    }
                </div>
                <div className="infobar-section-separator"></div>
                {
                    areSourcesReady(this.props.sources) && (
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
