import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {Button, Card, CardBody} from 'reactstrap'
import Clipboard from 'clipboard'

import Tooltip from '../Tooltip'
import SourceIcon from '../SourceIcon'
import {itemsWithContext} from '../../../../state/widgets/utils'
import {getDisplayName} from '../../../../state/customers/helpers'
import * as integrationsSelectors from '../../../../state/integrations/selectors'

import InfobarWidgets from './InfobarWidgets'
import InfobarAddIntegrationSuggestion from './InfobarAddIntegrationSuggestion'
import Avatar from './../Avatar'
import {canDrop, areSourcesReady, jsonToWidgets} from './utils'


import css from './Infobar.less'

class InfobarCustomerInfo extends React.Component {
    static childContextTypes = {
        customer: ImmutablePropTypes.map.isRequired,
        customerId: PropTypes.number,
    }

    state = {
        showAllCustomerChannels: false,
    }

    shownCustomerChannels = 2

    getChildContext() {
        const customer = this.props.customer || fromJS({})

        return {
            customer,
            customerId: customer.get('id'),
        }
    }

    constructor(props) {
        super(props)

        this.contextWidgets = fromJS([])
        this.isInitialized = false
    }

    componentWillMount() {
        this._initWidgets()

        new Clipboard('.js-clipboard-copy')
    }

    componentWillReceiveProps(nextProps) {
        this._initWidgets(nextProps)

        if (this.props.customer.get('id') !== nextProps.customer.get('id')) {
            this.setState({showAllCustomerChannels: false})
        }
    }

    componentWillUnmount() {
        this.props.actions.resetWidgets()
    }

    /**
     * Generate widgets and set them
     */
    _generateWidgets = () => {
        const {actions, widgets, sources} = this.props
        const context = widgets.get('currentContext', '')

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
        const {actions, isEditing, widgets, sources} = props

        const context = widgets.get('currentContext', '')

        const currentItems = itemsWithContext(widgets.get('items', fromJS([])), context)

        // null = should generate a new widgets template
        // empty array = user wanted no widgets
        const hasWidgets = !currentItems.isEmpty()

        this.contextWidgets = hasWidgets ? currentItems : fromJS([])

        if (widgets.getIn(['_internal', 'hasFetchedWidgets'])) {
            const shouldGenerateWidgets = areSourcesReady(sources, context)
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
     * Display widgets because the customer has data
     * @private
     */
    _renderWidgets = () => {
        const {
            actions,
            isEditing,
            widgets,
            sources,
        } = this.props

        const isDragging = widgets.getIn(['_internal', 'drag', 'isDragging'])

        const contextWidgets = isEditing
            ? this.props.widgets.getIn(['_internal', 'editedItems'])
            : this.contextWidgets

        const shouldSuggestTemplateGeneration = isEditing
            && !isDragging
            && contextWidgets.size <= 1
            && contextWidgets.getIn([0, 'template'], fromJS({})) === fromJS({})

        if (!isEditing && !shouldSuggestTemplateGeneration && contextWidgets.every((w) => w.get('template', fromJS({})).isEmpty())) {
            return null
        }

        if (shouldSuggestTemplateGeneration) {
            return this._renderGenerateButton()
        }

        return (
            <InfobarWidgets
                context={this.props.widgets.get('currentContext', '')}
                source={sources}
                widgets={contextWidgets}
                editing={
                    isEditing
                        ? {
                            isEditing,
                            isDragging,
                            actions,
                            state: widgets,
                            canDrop: (targetAbsolutePath) => {
                                const group = widgets.getIn(['_internal', 'drag', 'group'])
                                return canDrop(group, targetAbsolutePath)
                            }
                        }
                        : undefined
                }
            />
        )
    }

    /**
     * Suggest to add integrations if no customer data
     * @returns {boolean|XML}
     * @private
     */
    _renderSuggestion = () => {
        if (this.props.hasIntegrations) {
            return null
        }

        return (
            <InfobarAddIntegrationSuggestion customer={this.props.customer} />
        )
    }

    /**
     * Render customer channels like facebook, email address, etc.
     * @param channels
     * @returns {*}
     * @private
     */
    _renderCustomerChannels = (channels = fromJS([])) => {
        channels = channels
            .filter((channel) => { // hide chats and facebook
                const type = channel.get('type')
                return type !== 'chat' && !type.includes('facebook') && type !== 'instagram'
            })
            .sortBy((channel) => channel.get('address', '').toLowerCase()) // order addresses alphabetically
            .sortBy((channel) => -channel.get('preferred')) // put preferred addresses on top
            .sortBy((channel) => channel.get('type')) // group by channel type

        const hasMoreChannels = !this.state.showAllCustomerChannels && channels.size > this.shownCustomerChannels

        if (!this.state.showAllCustomerChannels) {
            channels = channels.take(this.shownCustomerChannels)
        }

        const list = channels.map((channel, idx) => {
            let props = null
            let addressComponent = null
            const address = channel.get('address') || ''

            if (!address) {
                return null
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
                case 'phone':
                    // remove dots and spaces so that some extensions recognize the address as a tel number
                    props = {
                        href: `tel:${address.replace(/\./g, '').replace(/ /g, '')}`
                    }
                    break
                default:
                    props = null
            }

            const id = `address-copied-${channel.get('id')}`

            if (props) {
                addressComponent = (
                    <a
                        {...props}
                        id={id}
                    >
                        {address}
                    </a>
                )
            } else {
                addressComponent = <span id={id}>{address}</span>
            }

            return (
                <p
                    key={idx}
                    className={css.customerChannel}
                >
                    <SourceIcon
                        type={channel.get('type')}
                        className="uncolored mr-2"
                    />
                    {addressComponent}
                    <span
                        className={classnames(css.copyAddress, 'ml-2 js-clipboard-copy')}
                        data-clipboard-target={`#${id}`}
                    >
                        <i
                            id={`copy-icon-${idx}`}
                            className="material-icons"
                        >
                            content_copy
                        </i>
                        <Tooltip
                            placement="top"
                            target={`copy-icon-${idx}`}
                            delay={{show: 1000, hide: 0}}
                        >
                            Copy
                        </Tooltip>
                    </span>
                </p>
            )
        })

        return (
            <div>
                {list}
                {
                    hasMoreChannels && (
                        <Button
                            type="button"
                            color="link"
                            onClick={() => this.setState({showAllCustomerChannels: true})}
                            style={{paddingLeft: 0}}
                        >
                            Show more
                            <i className="material-icons md-2 ml-2">
                                arrow_drop_down
                            </i>
                        </Button>
                    )
                }
            </div>
        )
    }

    /**
     * Render a button that generates a widget template as edited template
     * @returns {JSX}
     * @private
     */
    _renderGenerateButton = () => {
        return (
            <div className="no-result-container mt-5">
                <p>
                    You're not showing any widgets here yet.
                </p>
                <Button
                    color="info"
                    onClick={this._generateWidgets}
                >
                    Generate default widgets
                </Button>
            </div>
        )
    }

    render() {
        const {
            customer,
            sources,
            widgets
        } = this.props

        if (!customer || customer.isEmpty()) {
            return null
        }

        const context = widgets.get('currentContext', '')

        return (
            <div className={classnames(css.widgetsList, 'd-flex flex-column')}>
                <Card className={css.infobarCard}>
                    <CardBody>
                        <div className={css.customerProfile}>
                            <Avatar
                                className="mr-3 rounded"
                                name={customer.get('name', '')}
                                email={customer.get('email', '')}
                                url={customer.getIn(['meta', 'profile_picture_url'])}
                                google
                            />
                            <Link
                                to={`/app/customer/${customer.get('id')}`}
                                className={css.displayName}
                            >
                                {getDisplayName(customer)}
                            </Link>
                        </div>
                        <div className={css.detail}>
                            {this._renderCustomerChannels(customer.get('channels') || fromJS([]))}
                        </div>
                    </CardBody>
                </Card>
                {areSourcesReady(sources, context) ? this._renderWidgets() : this._renderSuggestion()}
            </div>
        )
    }
}

InfobarCustomerInfo.propTypes = {
    actions: PropTypes.object.isRequired,
    hasIntegrations: PropTypes.bool.isRequired,
    infobar: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    sources: PropTypes.object.isRequired,
    customer: PropTypes.object.isRequired,
    widgets: PropTypes.object,
}

InfobarCustomerInfo.defaultProps = {
    isRequired: false,
    customer: fromJS({}),
}

const mapStateToProps = (state) => ({
    hasIntegrations: !integrationsSelectors.getIntegrationsByTypes(['http', 'shopify', 'recharge', 'smile'])(state).isEmpty(),
})

export default connect(mapStateToProps)(InfobarCustomerInfo)
