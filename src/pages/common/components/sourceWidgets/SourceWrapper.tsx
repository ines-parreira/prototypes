import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, withRouter, RouteComponentProps} from 'react-router-dom'
import {fromJS, Set, Map, List} from 'immutable'
import {Card, CardBody} from 'reactstrap'

import {IntegrationType} from '../../../../models/integration/types'
import * as integrationsSelectors from '../../../../state/integrations/selectors'
import {RootState} from '../../../../state/types'
import history from '../../../history'
import {areSourcesReady, jsonToWidgets} from '../infobar/utils.js'

import SourceWidgets from './SourceWidgets.js'

export const WIDGET_DATA_TYPES = [
    {
        type: IntegrationType.ShopifyIntegrationType,
        title: 'Shopify data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link to="/app/settings/integrations/shopify" target="_blank">
                    <b>Shopify stores</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: IntegrationType.RechargeIntegrationType,
        title: 'Recharge data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link to="/app/settings/integrations/recharge" target="_blank">
                    <b>Recharge integrations</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: IntegrationType.SmileIntegrationType,
        title: 'Smile data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link to="/app/settings/integrations/smile" target="_blank">
                    <b>Smile integrations</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: IntegrationType.Magento2IntegrationType,
        title: 'Magento2 data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link to="/app/settings/integrations/magento2" target="_blank">
                    <b>Magento2 stores</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: IntegrationType.SmoochInsideIntegrationType,
        title: 'Chat data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link
                    to="/app/settings/integrations/smooch_inside"
                    target="_blank"
                >
                    <b>Chat integrations</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: IntegrationType.HttpIntegrationType,
        title: 'HTTP data',
        description: (
            <div>
                The following data comes from your server, after you configured{' '}
                <Link to="/app/settings/integrations/http" target="_blank">
                    <b>HTTP integrations</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: IntegrationType.YotpoIntegrationType,
        title: 'Yotpo data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link to="/app/settings/integrations/yotpo" target="_blank">
                    <b>Yotpo integrations</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: IntegrationType.KlaviyoIntegrationType,
        title: 'Klaviyo data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link to="/app/settings/integrations/klaviyo" target="_blank">
                    <b>Klaviyo integrations</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: 'custom',
        title: 'Customer data',
        description: (
            <div>
                The following data comes is the one you push yourself using our{' '}
                <Link to="https://docs.gorgias.com" target="_blank">
                    <b>API</b>
                </Link>
                .
            </div>
        ),
    },
]

type Props = {
    context: string
    identifier: string
    sources: Map<any, any>
    widgets: Map<any, any>
    actions: {
        widgets: {
            stopEditionMode: () => void
        }
    }
} & RouteComponentProps &
    ConnectedProps<typeof connector>

type State = {
    widgetsTemplate: List<any>
    availableTypes: Set<any>
}

class SourceWrapper extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        // defaults
        this.state = {
            widgetsTemplate: fromJS([]),
            availableTypes: fromJS([]),
        }
        // generate widgets
        Object.assign(this.state, this._getWidgetsState(props))
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState(this._getWidgetsState(nextProps) as State)
    }

    _getWidgetsState(props: Props): Partial<State> {
        const {sources, widgets, getIntegrationById} = props

        const context = widgets.get('currentContext', '')

        const hasWidgetsTemplates = !this.state.widgetsTemplate.isEmpty()

        const shouldGenerateWidgets =
            areSourcesReady(sources as any, context) && !hasWidgetsTemplates

        // Generate widgets template from incoming json and use it to display source widgets (i.e. the things you can
        // drag into the infobar).
        // If there's integrations widgets, we only want one widget per integration_type (except for HTTP integrations,
        // for which we want a widget per integration).
        if (shouldGenerateWidgets) {
            let widgetsTemplate = fromJS(
                jsonToWidgets(sources.toJS(), context)
            ) as List<any>
            const typesAlreadyDisplayed: string[] = []

            // Make sure we only have one `sourceWidget` per type, except for HTTP
            widgetsTemplate = (widgetsTemplate.map(
                (widgetTemplate: Map<any, any>) => {
                    let ret = widgetTemplate

                    if (
                        (widgetTemplate.get('sourcePath') as List<
                            any
                        >).includes('integrations')
                    ) {
                        const integrationId = (widgetTemplate.get(
                            'sourcePath'
                        ) as List<any>).last()

                        // If the integrationId is not a valid int, something is wrong so we discard the widget
                        if (isNaN(parseInt(integrationId))) {
                            return false
                        }

                        const integration = getIntegrationById(
                            parseInt(integrationId)
                        )

                        // If there's already a sourceWidget of this type, we don't want another one (except for http)
                        if (
                            typesAlreadyDisplayed.includes(
                                integration.get('type')
                            ) &&
                            integration.get('type') !== 'http'
                        ) {
                            return false
                        }

                        typesAlreadyDisplayed.push(integration.get('type'))
                        ret = widgetTemplate.set(
                            'type',
                            integration.get('type')
                        )
                    } else {
                        typesAlreadyDisplayed.push('custom')
                    }

                    return ret
                }
            ) as List<any>).filter((w: Map<any, any>) => !!w) as List<any> // filter out null values

            return {
                widgetsTemplate,
                availableTypes: Set(typesAlreadyDisplayed) as Set<any>,
            }
        }

        return {}
    }

    _leaveEditionMode = () => {
        const {actions, context, identifier, location} = this.props

        actions.widgets.stopEditionMode()
        history.push(`/app/${context}/${identifier}${location.search}`)
    }

    render() {
        const {sources, widgets} = this.props

        const isDragging = widgets.getIn(['_internal', 'drag', 'isDragging'])

        return (
            <div>
                <h3 className="mb-4">
                    Manage widgets
                    <a
                        className="clickable float-right"
                        onClick={this._leaveEditionMode}
                    >
                        <i className="material-icons">close</i>
                    </a>
                </h3>

                <p>
                    Drag and drop the values below into the sidebar to preview
                    how they will look like next to your tickets.
                </p>

                <div className="source-widgets">
                    {WIDGET_DATA_TYPES.map((widgetDataType, idx) => {
                        return (
                            this.state.availableTypes.has(
                                widgetDataType.type
                            ) && (
                                <Card className="data-fields" key={idx}>
                                    <CardBody className="header">
                                        <div className="title">
                                            {widgetDataType.title}
                                        </div>
                                        {widgetDataType.description}
                                    </CardBody>
                                    <CardBody className="content">
                                        <SourceWidgets
                                            source={sources}
                                            widgets={this.state.widgetsTemplate.filter(
                                                (
                                                    widgetTemplate: Map<
                                                        any,
                                                        any
                                                    >
                                                ) =>
                                                    widgetTemplate.get(
                                                        'type'
                                                    ) === widgetDataType.type
                                            )}
                                            editing={{
                                                isDragging,
                                                actions: this.props.actions
                                                    .widgets,
                                            }}
                                        />
                                    </CardBody>
                                </Card>
                            )
                        )
                    })}
                </div>
            </div>
        )
    }
}

const connector = connect((state: RootState) => {
    return {
        getIntegrationById: integrationsSelectors.makeGetIntegrationById(state),
    }
})

export default withRouter(connector(SourceWrapper))
