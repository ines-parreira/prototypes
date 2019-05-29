// @flow
import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import classnames from 'classnames'
import {fromJS, type List, type Map} from 'immutable'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {Button, Card, CardBody} from 'reactstrap'
import Clipboard from 'clipboard'

import {
    HTTP_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE, SMILE_INTEGRATION_TYPE
} from '../../../../../../constants/integration'

import {itemsWithContext} from '../../../../../../state/widgets/utils'
import {getDisplayName} from '../../../../../../state/customers/helpers'
import * as integrationsSelectors from '../../../../../../state/integrations/selectors'

import Avatar from '../../../Avatar'
import css from '../../Infobar.less'
import {canDrop, areSourcesReady, jsonToWidgets} from '../../utils'

import CustomerChannels from './CustomerChannels'
import CustomerNote from './CustomerNote'
import InfobarWidgets from './InfobarWidgets'
import AddIntegrationSuggestion from './AddIntegrationSuggestion'


type GenerateButtonProps = {
    setEditedWidgets: (Array<Map<*,*>>) => void,
    setEditionAsDirty: () => void,
    widgets: ?Map<*,*>,
    sources: Map<*,*>
}

/**
 * Render a button that generates a widget template as edited template
 */
class GenerateButton extends React.Component<GenerateButtonProps> {
    /**
     * Generate widgets and set them in the state.
     */
    _generateWidgets = () => {
        const {setEditedWidgets, setEditionAsDirty, widgets, sources} = this.props
        const context = widgets ? widgets.get('currentContext', '') : ''

        const items = jsonToWidgets(sources.toJS(), context)
        setEditedWidgets(items)
        setEditionAsDirty()
    }

    render() {
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
}


type Props = {
    actions: {
        setEditedWidgets: (Array<Map<*,*>>) => void,
        setEditionAsDirty: () => void,
        resetWidgets: () => void,
        generateAndSetWidgets: (Map<*,*>, string) => void,
    },
    hasIntegrations: boolean,
    isEditing: boolean,
    sources: Object,
    customer: Object,
    widgets: Map<*,*>,
    isRequired: boolean
}

type State = {
    contextWidgets: List<Map<*,*>>
}

export class InfobarCustomerInfo extends React.Component<Props, State> {
    static childContextTypes = {
        customer: ImmutablePropTypes.map.isRequired,
        customerId: PropTypes.number,
    }

    static defaultProps = {
        isRequired: false,
        customer: fromJS({}),
    }

    state = {
        contextWidgets: fromJS([])
    }

    clipboard: ?Clipboard = null
    isInitialized: boolean = false

    getChildContext() {
        const customer = this.props.customer || fromJS({})

        return {
            customer,
            customerId: customer.get('id'),
        }
    }

    componentWillMount() {
        this._initWidgets()
        this.clipboard = new Clipboard('.js-clipboard-copy')
    }

    componentWillReceiveProps(nextProps: Props) {
        this._initWidgets(nextProps)
    }

    componentWillUnmount() {
        this.props.actions.resetWidgets()

        if (this.clipboard) {
            this.clipboard.destroy()
        }
    }

    /**
     * Initialize widgets and editable widgets
     * @param props
     * @private
     */
    _initWidgets = (props: Props = this.props) => {
        const {actions, isEditing, widgets, sources} = props

        const context = widgets.get('currentContext', '')

        const currentItems = itemsWithContext(widgets.get('items', fromJS([])), context)

        // null = should generate a new widgets template
        // empty array = user wanted no widgets
        const hasWidgets = !currentItems.isEmpty()

        this.setState({contextWidgets: hasWidgets ? currentItems : fromJS([])})

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
                actions.setEditedWidgets(currentItems.toJS())
                this.isInitialized = true
            }
        }
    }

    _renderWidgets = () => {
        const {
            actions,
            isEditing,
            widgets,
            sources,
        } = this.props

        const contextWidgets = isEditing
            ? widgets.getIn(['_internal', 'editedItems'])
            : this.state.contextWidgets

        const isDragging = widgets.getIn(['_internal', 'drag', 'isDragging'])

        const shouldSuggestTemplateGeneration = isEditing && !isDragging && (
            !contextWidgets || (
                contextWidgets.size <= 1
                && contextWidgets.getIn([0, 'template'], fromJS({})).isEmpty()
            )
        )

        if (shouldSuggestTemplateGeneration) {
            return (
                <GenerateButton
                    setEditedWidgets={actions.setEditedWidgets}
                    setEditionAsDirty={actions.setEditionAsDirty}
                    widgets={widgets}
                    sources={sources}
                />
            )
        }

        const allWidgetsTemplatesAreEmpty = !contextWidgets ||
            // $FlowFixMe
            contextWidgets.every((widget) => widget.get('template', fromJS({})).isEmpty())

        if (!isEditing && allWidgetsTemplatesAreEmpty) {
            return null
        }

        return (
            <InfobarWidgets
                context={widgets.get('currentContext', '')}
                source={sources}
                widgets={contextWidgets}
                editing={
                    isEditing ? {
                        isEditing,
                        isDragging,
                        actions,
                        state: widgets,
                        canDrop: (targetAbsolutePath) => {
                            const group = widgets.getIn(['_internal', 'drag', 'group'])
                            return canDrop(group, targetAbsolutePath)
                        }
                    } : undefined
                }
            />
        )
    }

    /**
     * Suggest to add integrations if no customer data
     * @returns {boolean|Node}
     * @private
     */
    _renderSuggestion = () => {
        if (this.props.hasIntegrations) {
            return null
        }

        return (
            <AddIntegrationSuggestion customer={this.props.customer} />
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
                            />
                            <Link
                                to={`/app/customer/${customer.get('id')}`}
                                className={css.displayName}
                            >
                                {getDisplayName(customer)}
                            </Link>
                        </div>
                        <div className={css.detail}>
                            <CustomerChannels channels={customer.get('channels') || fromJS([])}/>
                            <CustomerNote customer={customer}/>
                        </div>
                    </CardBody>
                </Card>
                {
                    areSourcesReady(sources, widgets.get('currentContext', ''))
                        ? this._renderWidgets()
                        : this._renderSuggestion()
                }
            </div>
        )
    }
}

export default connect((state) => ({
    hasIntegrations: !integrationsSelectors.getIntegrationsByTypes([
        HTTP_INTEGRATION_TYPE,
        SHOPIFY_INTEGRATION_TYPE,
        RECHARGE_INTEGRATION_TYPE,
        SMILE_INTEGRATION_TYPE
    ])(state).isEmpty(),
}))(InfobarCustomerInfo)
