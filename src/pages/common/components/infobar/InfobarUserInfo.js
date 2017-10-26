import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'
import Clipboard from 'clipboard'

import Tooltip from '../Tooltip'
import InfobarWidgets from './InfobarWidgets'
import InfobarAddIntegrationSuggestion from './InfobarAddIntegrationSuggestion'
import ProfileImage from './../ProfileImage'
import {canDrop, areSourcesReady, jsonToWidgets} from './utils'
import {itemsWithContext} from '../../../../state/widgets/utils'

import {getDisplayName} from '../../../../state/users/helpers'
import * as integrationsSelectors from '../../../../state/integrations/selectors'
import {sourceTypeToIcon} from '../../../../config/ticket'

class InfobarUserInfo extends React.Component {
    static childContextTypes = {
        user: ImmutablePropTypes.map.isRequired,
        userId: PropTypes.number,
    }

    state = {
        showAllUserChannels: false,
    }

    shownUserChannels = 2

    getChildContext() {
        const user = this.props.user || fromJS({})

        return {
            user,
            userId: user.get('id'),
        }
    }

    constructor(props) {
        super(props)

        this.contextWidgets = fromJS([])
        this.isInitialized = false
    }

    componentWillMount() {
        this._initWidgets()

        new Clipboard('.copy-address i')
    }

    componentWillReceiveProps(nextProps) {
        this._initWidgets(nextProps)

        if (this.props.user.get('id') !== nextProps.user.get('id')) {
            this.setState({showAllUserChannels: false})
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
     * Display widgets because the user has customer data
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

        if (!isEditing && !shouldSuggestTemplateGeneration && contextWidgets.every(w => w.get('template', fromJS({})).isEmpty())) {
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
            <InfobarAddIntegrationSuggestion user={this.props.user} />
        )
    }

    /**
     * Render user channels like facebook, email address, etc.
     * @param channels
     * @returns {*}
     * @private
     */
    _renderUserChannels = (channels = fromJS([])) => {
        channels = channels
            .filter((channel) => { // hide chats and facebook
                const type = channel.get('type')
                return type !== 'chat' && !type.includes('facebook')
            })
            .sortBy(channel => channel.get('address', '').toLowerCase()) // order addresses alphabetically
            .sortBy(channel => -channel.get('preferred')) // put preferred addresses on top
            .sortBy(channel => channel.get('type')) // group by channel type

        const hasMoreChannels = !this.state.showAllUserChannels && channels.size > this.shownUserChannels

        if (!this.state.showAllUserChannels) {
            channels = channels.take(this.shownUserChannels)
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
                addressComponent = <a {...props} id={id}>{address}</a>
            } else {
                addressComponent = <span id={id}>{address}</span>
            }

            return (
                <p
                    key={idx}
                    className="user-channel"
                >
                    <i
                        className={classnames('uncolored mr-2', sourceTypeToIcon(channel.get('type')))}
                    />
                    {addressComponent}
                    <span className="copy-address ml-2">
                        <i
                            id={`copy-icon-${idx}`}
                            className="fa fa-fw fa-clipboard clickable"
                            data-clipboard-target={`#${id}`}
                        />
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
                            onClick={() => this.setState({showAllUserChannels: true})}
                            style={{paddingLeft: 0}}
                        >
                            Show more
                            <i className="fa fa-fw fa-caret-down ml-2" />
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
            fetchUserPicture,
            infobar,
            user,
            sources,
            widgets
        } = this.props

        if (!user || user.isEmpty()) {
            return null
        }

        const context = widgets.get('currentContext', '')

        return (
            <div className="flex-vertical">
                <div className="infobar-top">
                    <div className="user-profile">
                        <ProfileImage
                            name={user.get('name', '')}
                            email={user.get('email', '')}
                            pictureObject={infobar.get('picture')}
                            isLoading={infobar.getIn(['_internal', 'loading', 'displayedUserPictureUrl'])}
                            fetchUserPicture={fetchUserPicture}
                        />
                        <h2>
                            <Link to={`/app/user/${user.get('id')}`}>
                                {getDisplayName(user)}
                            </Link>
                        </h2>
                    </div>
                    {this._renderUserChannels(user.get('channels', fromJS([])))}
                </div>
                {areSourcesReady(sources, context) ? this._renderWidgets() : this._renderSuggestion()}
            </div>
        )
    }
}

InfobarUserInfo.propTypes = {
    actions: PropTypes.object.isRequired,
    fetchUserPicture: PropTypes.func.isRequired,
    hasIntegrations: PropTypes.bool.isRequired,
    infobar: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    sources: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    widgets: PropTypes.object,
}

InfobarUserInfo.defaultProps = {
    isRequired: false,
    user: fromJS({}),
}

const mapStateToProps = (state) => ({
    hasIntegrations: !integrationsSelectors.getIntegrationsByTypes(['http', 'shopify', 'recharge'])(state).isEmpty(),
})

export default connect(mapStateToProps)(InfobarUserInfo)
