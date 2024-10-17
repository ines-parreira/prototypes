import {useContext, useMemo} from 'react'
import {IntegrationType} from '@gorgias/api-queries'

import {CURRENT_USER_TEMPLATE_FIELDS} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/constants'
import useAppSelector from 'hooks/useAppSelector'
import {CustomerIntegration} from 'models/customer/types'
import {Source, isSourceRecord} from 'models/widget/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {AppContext} from 'providers/infobar/AppContext'
import WidgetListContext from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/WidgetListContext'
import {getTicket} from 'state/ticket/selectors'
import {getActiveCustomer} from 'state/customers/selectors'
import {getCurrentUserState} from 'state/currentUser/selectors'

// Matches `USABLE_IN_RULES` backend declarations which is used in templating to
// allow doing `customer.integrations.shopify.whatever` and similar.
// g/integrations/base.py#L150
// g/utils/js/utils.py render_integration_data_variables
const MAPPED_INTEGRATIONS = [
    IntegrationType.Shopify,
    IntegrationType.Recharge,
    IntegrationType.Magento2,
    IntegrationType.Smile,
]

export function useTemplateContext(source?: Source) {
    const ticket = useAppSelector(getTicket)
    const customer = useAppSelector(getActiveCustomer)
    const isTicketContext = Boolean(ticket.customer)
    const integrationsData = isTicketContext
        ? ticket.customer?.integrations
        : customer.integrations

    // Contrarily to the backend mapping, we don’t do any aggregation here.
    // If they are two available integrations of the same type, none will
    // be provided.
    // For example, with the backend version, len(shopify.orders) would be
    // the sum of orders among all the integrations, while here you’d have
    // nothing.
    const mappedIntegrationData = useMemo(() => {
        const mappedIntegrationData: {
            [key in (typeof MAPPED_INTEGRATIONS)[number]]?: CustomerIntegration
        } = {}
        for (const type of MAPPED_INTEGRATIONS) {
            const integrationData = Object.values(
                integrationsData || {}
            ).filter((integration) => integration.__integration_type__ === type)
            // Do nothing if there are multiple integrations of the same type
            if (integrationData.length === 1) {
                mappedIntegrationData[type] = integrationData[0]
            }
        }
        return mappedIntegrationData
    }, [integrationsData])

    const currentUser = useAppSelector(getCurrentUserState)
    const {integrationId} = useContext(IntegrationContext)
    const {appId} = useContext(AppContext)
    const {currentListIndex} = useContext(WidgetListContext)

    const templateContext = useMemo(() => {
        const fullCurrentUserData = currentUser.toJS() as Record<
            string,
            unknown
        >
        const trimmedCurrentUserData: Partial<
            Record<(typeof CURRENT_USER_TEMPLATE_FIELDS)[number], unknown>
        > = {}

        CURRENT_USER_TEMPLATE_FIELDS.forEach((field) => {
            trimmedCurrentUserData[field] = fullCurrentUserData[field]
        })

        return {
            context: {
                ...(isSourceRecord(source) ? source : {}),
                ticket: {
                    ...ticket,
                    customer: {
                        ...ticket.customer,
                        integrations: {
                            ...ticket.customer?.integrations,
                            ...(isTicketContext ? mappedIntegrationData : {}),
                        },
                    },
                },
                customer: {
                    ...customer,
                    integrations: {
                        ...customer?.integrations,
                        ...(isTicketContext ? {} : mappedIntegrationData),
                    },
                },
                current_user: trimmedCurrentUserData,
            },
            variables: {
                listIndex:
                    currentListIndex !== null
                        ? currentListIndex.toString()
                        : undefined,
                integrationId: integrationId?.toString(),
                appId: appId || undefined,
            },
        }
    }, [
        customer,
        source,
        mappedIntegrationData,
        isTicketContext,
        ticket,
        integrationId,
        appId,
        currentListIndex,
        currentUser,
    ])
    return templateContext
}
