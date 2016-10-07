import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import InfobarWidgets from './InfobarWidgets'
import {canDrop, areSourcesReady, jsonToWidgets} from './utils'
import {itemsWithContext} from '../../../../../state/widgets/utils'
import {USER_CHANNEL_CLASS} from '../../../../../config'

export default class TicketInfobar extends React.Component {
    constructor(props) {
        super(props)

        this.ticketWidgets = fromJS([])
        this.isInitialized = false
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

    /**
     * Generate widgets and set them
     */
    _generateWidgets = () => {
        const {actions, ticket, widgets} = this.props
        const context = widgets.get('currentContext', '')

        const sources = fromJS({
            ticket
        })

        const items = jsonToWidgets(sources.toJS(), context)
        actions.setEditedWidgets(items)
        actions.setEditionAsDirty()
    }

    /**
     * Initialize widgets and editable widgets
     * @param props
     * @private
     */
    _initWidgets = (props = this.props) => {
        const {actions, isEditing, ticket, widgets} = props

        const context = widgets.get('currentContext', '')

        const currentItems = itemsWithContext(widgets.get('items', fromJS([])), context)

        // null = should generate a new widgets template
        // empty array = user wanted no widgets
        const hasWidgets = !currentItems.isEmpty()

        this.ticketWidgets = hasWidgets ? currentItems : fromJS([])

        if (widgets.getIn(['_internal', 'hasFetchedWidgets'])) {
            const sources = fromJS({
                ticket
            })

            const shouldGenerateWidgets = areSourcesReady(sources)
                && !hasWidgets
                && !widgets.getIn(['_internal', 'hasGeneratedWidgets'])

            // if no widgets, generate them from incoming json
            if (shouldGenerateWidgets) {
                actions.generateAndSetWidgets(sources, context)
            }

            const shouldSetEditedItems = !this.isInitialized
                && isEditing
                && hasWidgets

            // if editing, set template to edit when ready
            if (shouldSetEditedItems) {
                // start edition mode
                actions.setEditedWidgets(currentItems)
                this.isInitialized = true
            }
        }
    }

    /**
     * Render user channels like facebook, email address, etc.
     * @param ticket
     * @returns {*}
     * @private
     */
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
                    <p
                        key={idx}
                        className="user-channel"
                    >
                        <i className={iconClass} />
                        {addressComponent}
                    </p>
                )
            })
    }

    /**
     * Render a button that generates a widget template as edited template
     * @returns {JSX}
     * @private
     */
    _renderGenerateButton = () => {
        return (
            <div className="no-result-container">
                <h4>You're not showing any widgets here yet.</h4>
                <div
                    className="ui small light blue button"
                    onClick={this._generateWidgets}
                >
                    Generate default widgets
                </div>
            </div>
        )
    }

    render() {
        const {
            actions,
            ticket,
            isEditing,
            widgets,
            sources
        } = this.props

        if (!ticket || !ticket.get('requester')) {
            return null
        }

        const isDragging = widgets.getIn(['_internal', 'drag', 'isDragging'])

        const ticketWidgets = isEditing
            ? this.props.widgets.getIn(['_internal', 'editedItems'])
            : this.ticketWidgets

        const shouldSuggestTemplateGeneration = isEditing
            && !isDragging
            && ticketWidgets.size <= 1
            && ticketWidgets.getIn([0, 'template'], fromJS({})) === fromJS({})

        return (
            <div className="flex-vertical">
                <div className="infobar-top">
                    <h2>{ticket.getIn(['requester', 'name'])}</h2>
                    {this._renderUserChannels(ticket)}
                </div>
                {
                    areSourcesReady(this.props.sources) && (
                        <div className="flex-vertical">
                            <div className="infobar-section-separator"></div>
                            {
                                shouldSuggestTemplateGeneration
                                    ? this._renderGenerateButton()
                                    : (
                                    <InfobarWidgets
                                        source={sources}
                                        widgets={ticketWidgets}
                                        editing={isEditing ? {
                                            isEditing,
                                            isDragging,
                                            actions,
                                            state: widgets,
                                            canDrop: (targetAbsolutePath) => {
                                                const group = widgets.getIn(['_internal', 'drag', 'group'])
                                                return canDrop(group, targetAbsolutePath)
                                            }
                                        } : undefined}
                                    />
                                )
                            }
                        </div>
                    )
                }
            </div>
        )
    }
}

TicketInfobar.propTypes = {
    actions: PropTypes.object.isRequired,
    isEditing: PropTypes.bool,
    params: PropTypes.object,
    route: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,
    ticket: PropTypes.object,
    widgets: PropTypes.object
}

TicketInfobar.defaultProps = {
    params: {
        ticketId: null
    }
}
