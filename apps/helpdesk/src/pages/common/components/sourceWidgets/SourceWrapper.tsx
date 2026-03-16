import React, { useEffect, useState } from 'react'

import { history } from '@repo/routing'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS, Set } from 'immutable'
import { Link } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import type { CustomerEcommerceData } from 'models/customerEcommerceData/types'
import { IntegrationType } from 'models/integration/types/'
import {
    areSourcesReady,
    jsonToWidgets,
} from 'pages/common/components/infobar/utils'
import { DEPRECATED_getIntegrations } from 'state/integrations/selectors'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_ECOMMERCE_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'

import Widgets from './Widgets'

import css from './SourceWrapper.less'

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
        type: WOOCOMMERCE_WIDGET_TYPE,
        title: 'WooCommerce data',
        description: (
            <div>The following data comes from your WooCommerce stores</div>
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
    widgetTypeFilter?: string | null
    onClose?: () => void
}

export default function SourceWrapper({
    actions,
    context,
    identifier,
    sources,
    widgets,
    widgetTypeFilter,
    onClose,
}: Props) {
    const [widgetsTemplate, setWidgetsTemplate] = useState<
        Map<string, unknown>[]
    >([])
    const [availableTypes, setAvailableTypes] = useState<Set<string>>(
        fromJS([]),
    )

    const integrations = useAppSelector(DEPRECATED_getIntegrations)

    useEffect(() => {
        const context = widgets.get('currentContext', '')

        const shouldGenerateWidgets =
            areSourcesReady(sources as any, context) && !widgetsTemplate.length

        // Generate widgets template from incoming json and use it to display source widgets (i.e. the things you can
        // drag into the infobar).
        // If there's integrations widgets, we only want one widget per integration_type (except for HTTP integrations,
        // for which we want a widget per integration).
        if (!shouldGenerateWidgets) return

        let newWidgetsTemplate = jsonToWidgets(sources.toJS(), context)

        const typesAlreadyDisplayed: string[] = []

        // Make sure we only have one `sourceWidget` per type, except for HTTP
        newWidgetsTemplate = newWidgetsTemplate
            .map((widgetsTemplate) => {
                let ret = widgetsTemplate
                const sourcePath = widgetsTemplate.get(
                    'sourcePath',
                ) as List<string>

                if (sourcePath.includes('integrations')) {
                    const integrationId = (
                        widgetsTemplate.get('sourcePath') as List<any>
                    ).last() as string

                    // If the integrationId is not a valid int, something is wrong so we discard the widget
                    if (isNaN(parseInt(integrationId, 10))) {
                        return false
                    }

                    const integration = getIntegrationById(
                        integrations,
                        integrationId,
                    )

                    // If there's already a sourceWidget of this type, we don't want another one (except for http)
                    if (
                        typesAlreadyDisplayed.includes(
                            integration.get('type'),
                        ) &&
                        integration.get('type') !== 'http'
                    ) {
                        return false
                    }

                    typesAlreadyDisplayed.push(integration.get('type'))
                    ret = widgetsTemplate.set('type', integration.get('type'))
                } else if (sourcePath.includes(CUSTOMER_EXTERNAL_DATA_KEY)) {
                    typesAlreadyDisplayed.push(
                        CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
                    )
                } else if (sourcePath.includes(CUSTOMER_ECOMMERCE_DATA_KEY)) {
                    const customerEcommerceData = (
                        sources.getIn(sourcePath) as Map<any, any> | undefined
                    )?.toJS() as CustomerEcommerceData | undefined
                    if (
                        customerEcommerceData &&
                        customerEcommerceData.store.type ===
                            WOOCOMMERCE_WIDGET_TYPE
                    ) {
                        typesAlreadyDisplayed.push(WOOCOMMERCE_WIDGET_TYPE)
                    } else {
                        return false
                    }
                } else {
                    typesAlreadyDisplayed.push(CUSTOM_WIDGET_TYPE)
                }

                return ret
            })
            .filter((widget) => !!widget) as Map<string, unknown>[]

        newWidgetsTemplate.push(
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
            }) as Map<string, unknown>,
        )
        typesAlreadyDisplayed.push(STANDALONE_WIDGET_TYPE)

        setWidgetsTemplate(newWidgetsTemplate)
        setAvailableTypes(Set(typesAlreadyDisplayed) as Set<any>)
    }, [integrations, sources, widgets, widgetsTemplate])

    const leaveEditionMode = () => {
        actions.widgets.stopEditionMode()
        if (onClose) {
            onClose()
        } else {
            history.push(`/app/${context}/${identifier}${location.search}`)
        }
    }

    const isDragging = widgets.getIn(['_internal', 'drag', 'isDragging'])

    const filteredDataTypes = widgetTypeFilter
        ? WIDGET_DATA_TYPES.filter((dt) => dt.type === widgetTypeFilter)
        : WIDGET_DATA_TYPES

    return (
        <div className={classnames({ dragging: isDragging })}>
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

            {filteredDataTypes.map((widgetDataType, idx) =>
                availableTypes.has(widgetDataType.type) ? (
                    <section
                        className={classnames(
                            css.dataFields,
                            css[widgetDataType.type],
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
                            widgets={widgetsTemplate.filter(
                                (widgetsTemplate) =>
                                    widgetsTemplate?.get('type') ===
                                    widgetDataType.type,
                            )}
                        />
                    </section>
                ) : null,
            )}
        </div>
    )
}

function getIntegrationById(
    integrations: List<Map<any, any>>,
    id: string | number,
) {
    return (
        integrations.find(
            (integration) =>
                (integration?.get('id', '') as string | number).toString() ===
                (id || '').toString(),
        ) || fromJS({})
    )
}
