import React, {useState, useEffect} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {fromJS, Set, Map, List} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types/'
import {DEPRECATED_getIntegrations} from 'state/integrations/selectors'
import history from 'pages/history'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {
    areSourcesReady,
    jsonToWidgets,
} from 'pages/common/components/infobar/utils'

import css from './SourceWrapper.less'
import Widgets from './Widgets'

export const WIDGET_DATA_TYPES = [
    {
        type: IntegrationType.Shopify,
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
        type: IntegrationType.Recharge,
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
        type: IntegrationType.Smile,
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
        type: IntegrationType.Magento2,
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
        type: IntegrationType.SmoochInside,
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
        type: IntegrationType.Http,
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
        type: IntegrationType.Yotpo,
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
        type: IntegrationType.BigCommerce,
        title: 'BigCommerce data',
        description: (
            <div>
                The following data comes from your{' '}
                <Link
                    to="/app/settings/integrations/bigcommerce"
                    target="_blank"
                >
                    <b>BigCommerce integrations</b>
                </Link>
                .
            </div>
        ),
    },
    {
        type: CUSTOM_WIDGET_TYPE,
        title: 'Customer data (Deprecated)',
        description: (
            <div>
                The following data is pushed using our{' '}
                <a
                    href="https://developers.gorgias.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    <b>API</b>
                </a>
                .
            </div>
        ),
    },
    {
        type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
        title: 'Customer third party data',
        description: (
            <div>
                The following data comes from pushing it using{' '}
                {/*TODO: add the proper link for this one when available*/}
                <a
                    href="https://developers.gorgias.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    <b>the customer data endpoint</b>
                </a>
                .
            </div>
        ),
    },
    {
        type: STANDALONE_WIDGET_TYPE,
        title: 'Standalone widget',
        description:
            'Drag the box below into the sidebar to have a widget unrelated to any integration or data',
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
}

export default function SourceWrapper({
    actions,
    context,
    identifier,
    sources,
    widgets,
}: Props) {
    const [widgetsTemplate, setWidgetsTemplate] = useState<
        List<Map<string, unknown>>
    >(fromJS([]))
    const [availableTypes, setAvailableTypes] = useState<Set<string>>(
        fromJS([])
    )

    const integrations = useAppSelector(DEPRECATED_getIntegrations)

    useEffect(() => {
        const context = widgets.get('currentContext', '')

        const shouldGenerateWidgets =
            areSourcesReady(sources as any, context) &&
            widgetsTemplate.isEmpty()

        // Generate widgets template from incoming json and use it to display source widgets (i.e. the things you can
        // drag into the infobar).
        // If there's integrations widgets, we only want one widget per integration_type (except for HTTP integrations,
        // for which we want a widget per integration).
        if (!shouldGenerateWidgets) return

        let newWidgetsTemplate = fromJS(
            jsonToWidgets(sources.toJS(), context)
        ) as List<any>
        const typesAlreadyDisplayed: string[] = []

        // Make sure we only have one `sourceWidget` per type, except for HTTP
        newWidgetsTemplate = (
            newWidgetsTemplate.map((widgetsTemplate: Map<any, any>) => {
                let ret = widgetsTemplate

                if (
                    (widgetsTemplate.get('sourcePath') as List<any>).includes(
                        'integrations'
                    )
                ) {
                    const integrationId = (
                        widgetsTemplate.get('sourcePath') as List<any>
                    ).last() as string

                    // If the integrationId is not a valid int, something is wrong so we discard the widget
                    if (isNaN(parseInt(integrationId, 10))) {
                        return false
                    }

                    const integration = getIntegrationById(
                        integrations,
                        integrationId
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
                    ret = widgetsTemplate.set('type', integration.get('type'))
                } else if (
                    (widgetsTemplate.get('sourcePath') as List<any>).includes(
                        'external_data'
                    )
                ) {
                    typesAlreadyDisplayed.push(
                        CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE
                    )
                } else {
                    typesAlreadyDisplayed.push(CUSTOM_WIDGET_TYPE)
                }

                return ret
            }) as List<any>
        ).filter((w: Map<any, any>) => !!w) as List<any> // filter out null values

        newWidgetsTemplate = newWidgetsTemplate.push(
            fromJS({
                type: STANDALONE_WIDGET_TYPE,
                order: 0, // Doesn’t matter
                context,
                template: {
                    type: 'wrapper',
                    widgets: [],
                },
                sourcePath: [''],
                integration_id: null,
            })
        )
        typesAlreadyDisplayed.push(STANDALONE_WIDGET_TYPE)

        setWidgetsTemplate(newWidgetsTemplate)
        setAvailableTypes(Set(typesAlreadyDisplayed) as Set<any>)
    }, [integrations, sources, widgets, widgetsTemplate])

    const leaveEditionMode = () => {
        actions.widgets.stopEditionMode()
        history.push(`/app/${context}/${identifier}${location.search}`)
    }

    const isDragging = widgets.getIn(['_internal', 'drag', 'isDragging'])

    return (
        <div className={classnames({dragging: isDragging})}>
            <h3 className="mb-4">
                Manage widgets
                <a className="clickable float-right" onClick={leaveEditionMode}>
                    <i className="material-icons">close</i>
                </a>
            </h3>

            <p>
                Drag and drop the values below into the sidebar to preview how
                they will look like next to your tickets.
            </p>

            {WIDGET_DATA_TYPES.map((widgetDataType, idx) =>
                availableTypes.has(widgetDataType.type) ? (
                    <section
                        className={classnames(
                            css.dataFields,
                            css[widgetDataType.type]
                        )}
                        key={idx}
                    >
                        <header className={css.dataHeader}>
                            <h2 className={css.dataTitle}>
                                {widgetDataType.title}
                            </h2>
                            {widgetDataType.description}
                        </header>
                        <Widgets
                            source={sources}
                            widgets={
                                widgetsTemplate.filter(
                                    (widgetsTemplate) =>
                                        widgetsTemplate?.get('type') ===
                                        widgetDataType.type
                                ) as List<Map<string, unknown>>
                            }
                        />
                    </section>
                ) : null
            )}
        </div>
    )
}

function getIntegrationById(
    integrations: List<Map<any, any>>,
    id: string | number
) {
    return (
        integrations.find(
            (integration) =>
                (integration?.get('id', '') as string | number).toString() ===
                (id || '').toString()
        ) || fromJS({})
    )
}
