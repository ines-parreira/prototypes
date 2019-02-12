// @flow
import React from 'react'
import {connect} from 'react-redux'
import {Link, browserHistory, withRouter} from 'react-router'
import {fromJS, Set, Map} from 'immutable'
import {Card, CardBody} from 'reactstrap'

import {areSourcesReady, jsonToWidgets} from '../infobar/utils'

import * as integrationsSelectors from './../../../../state/integrations/selectors'

import SourceWidgets from './SourceWidgets'

export const WIDGET_DATA_TYPES = [
    {
        type: 'shopify',
        title: 'Shopify data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link
                    to="/app/settings/integrations/shopify"
                    target="_blank"
                >
                    <b>Shopify stores</b>
                </Link>.
            </div>
        )
    },
    {
        type: 'recharge',
        title: 'Recharge data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link
                    to="/app/settings/integrations/recharge"
                    target="_blank"
                >
                    <b>Recharge integrations</b>
                </Link>.
            </div>
        )
    },
    {
        type: 'smile',
        title: 'Smile data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link
                    to="/app/settings/integrations/smile"
                    target="_blank"
                >
                    <b>Smile integrations</b>
                </Link>.
            </div>
        )
    },
    {
        type: 'smooch_inside',
        title: 'Chat data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link
                    to="/app/settings/integrations/smooch_inside"
                    target="_blank"
                >
                    <b>Chat integrations</b>
                </Link>.
            </div>
        )
    },
    {
        type: 'http',
        title: 'HTTP data',
        description: (
            <div>
                The following data comes from your server, after you configured{' '}
                <Link
                    to="/app/settings/integrations/http"
                    target="_blank"
                >
                    <b>HTTP integrations</b>
                </Link>.
            </div>
        )
    },
    {
        type: 'custom',
        title: 'Customer data',
        description: (
            <div>
                The following data comes is the one you push yourself using our{' '}
                <Link
                    to="https://docs.gorgias.io"
                    target="_blank"
                >
                    <b>API</b>
                </Link>.
            </div>
        )
    },

]

type Props = {
    context: string,
    identifier: string,
    sources: Set<*>,
    widgets: Map<*, *>,
    actions: {
        widgets: {
            stopEditionMode: () => void
        }
    },
    getIntegrationById: (T: number) => Set<*>,
    // react-router
    location: {
        search: string
    },
}

type State = {
    widgetsTemplate: Set<*>,
    availableTypes: Set<*>
}

class SourceWrapper extends React.Component<Props, State> {
    constructor(props) {
        super()
        // defaults
        this.state = {
            widgetsTemplate: fromJS([]),
            availableTypes: fromJS([])
        }
        // generate widgets
        Object.assign(this.state, this._getWidgetsState(props))
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this._getWidgetsState(nextProps))
    }

    _getWidgetsState(props) {
        const {sources, widgets, getIntegrationById} = props

        const context = widgets.get('currentContext', '')

        const hasWidgetsTemplates = !this.state.widgetsTemplate.isEmpty()

        const shouldGenerateWidgets = areSourcesReady(sources, context)
            && !hasWidgetsTemplates

        // Generate widgets template from incoming json and use it to display source widgets (i.e. the things you can
        // drag into the infobar).
        // If there's integrations widgets, we only want one widget per integration_type (except for HTTP integrations,
        // for which we want a widget per integration).
        if (shouldGenerateWidgets) {
            let widgetsTemplate = fromJS(jsonToWidgets(sources.toJS(), context))
            const typesAlreadyDisplayed = []

            // Make sure we only have one `sourceWidget` per type, except for HTTP
            widgetsTemplate = widgetsTemplate.map((widgetTemplate) => {
                let ret = widgetTemplate

                if (widgetTemplate.get('sourcePath').includes('integrations')) {
                    const integrationId = widgetTemplate.get('sourcePath').last()

                    // If the integrationId is not a valid int, something is wrong so we discard the widget
                    if (isNaN(parseInt(integrationId))) {
                        return false
                    }

                    const integration = getIntegrationById(parseInt(integrationId))

                    // If there's already a sourceWidget of this type, we don't want another one (except for http)
                    if (typesAlreadyDisplayed.includes(integration.get('type')) && integration.get('type') !== 'http') {
                        return false
                    }

                    typesAlreadyDisplayed.push(integration.get('type'))
                    ret = widgetTemplate.set('type', integration.get('type'))
                } else {
                    typesAlreadyDisplayed.push('custom')
                }

                return ret
            }).filter((w) => w)  // filter out null values

            return {
                widgetsTemplate: widgetsTemplate,
                // $FlowFixMe
                availableTypes: new Set(typesAlreadyDisplayed)
            }
        }

        return {}
    }

    _leaveEditionMode = () => {
        const {actions, context, identifier, location} = this.props

        actions.widgets.stopEditionMode()
        browserHistory.push(`/app/${context}/${identifier}${location.search}`)
    }

    render() {
        const {
            sources,
            widgets
        } = this.props

        const isDragging = widgets.getIn(['_internal', 'drag', 'isDragging'])

        return (
            <div>
                <h3 className="mb-4">
                    Manage widgets

                    <a
                        className="clickable float-right"
                        onClick={this._leaveEditionMode}
                    >
                        <i className="material-icons">
                            close
                        </i>
                    </a>
                </h3>

                <p>
                    Drag and drop the values below into the sidebar to preview how they will look like next to your
                    tickets.
                </p>

                <div className="source-widgets">
                    {
                        WIDGET_DATA_TYPES.map((widgetDataType, idx) => {
                            return this.state.availableTypes.has(widgetDataType.type) && (
                                    <Card
                                        className="data-fields"
                                        key={idx}
                                    >
                                        <CardBody className="header">
                                            <div className="title">
                                                {widgetDataType.title}
                                                </div>
                                            {widgetDataType.description}
                                        </CardBody>
                                        <CardBody className="content">
                                            <SourceWidgets
                                                source={sources}
                                                widgets={
                                                    this.state.widgetsTemplate.filter(
                                                        (widgetTemplate) => widgetTemplate.get('type') === widgetDataType.type
                                                    )
                                                }
                                                editing={{
                                                    isDragging,
                                                    actions: this.props.actions.widgets
                                                }}
                                            />
                                        </CardBody>
                                    </Card>
                                )
                        })
                    }
                </div>

            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        getIntegrationById: integrationsSelectors.makeGetIntegrationById(state)
    }
}

export default withRouter(connect(mapStateToProps)(SourceWrapper))
