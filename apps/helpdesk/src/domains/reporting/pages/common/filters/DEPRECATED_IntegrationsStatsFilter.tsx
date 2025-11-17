import type { ComponentProps } from 'react'
import React, { useCallback, useMemo } from 'react'

import aircallIcon from 'assets/img/integrations/aircall.png'
import gmailIcon from 'assets/img/integrations/gmail.png'
import outlookIcon from 'assets/img/integrations/outlook.svg'
import shopifyIcon from 'assets/img/integrations/shopify.png'
import whatsAppIcon from 'assets/img/integrations/whatsapp.svg'
import zendeskIcon from 'assets/img/integrations/zendesk.png'
import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import css from 'domains/reporting/pages/common/filters/IntegrationsStatsFilter.less'
import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import SelectStatsFilter from 'domains/reporting/pages/common/SelectStatsFilter'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    CONTACT_FORM_INTEGRATION_ADDRESS_PREFIX,
    HELP_CENTER_INTEGRATION_ADDRESS_PREFIX,
    IntegrationType,
} from 'models/integration/constants'
import type { AppIntegration, Integration } from 'models/integration/types'

export const IMAGE_ICONS = {
    [IntegrationType.Aircall]: aircallIcon,
    [IntegrationType.Gmail]: gmailIcon,
    [IntegrationType.Outlook]: outlookIcon,
    [IntegrationType.Shopify]: shopifyIcon,
    [IntegrationType.Zendesk]: zendeskIcon,
    [IntegrationType.WhatsApp]: whatsAppIcon,
}

export const FONT_ICONS = {
    [IntegrationType.Email]: 'email',
    [IntegrationType.Facebook]: 'facebook',
    [IntegrationType.Http]: 'http',
    [IntegrationType.Phone]: 'phone',
    [IntegrationType.Sms]: 'sms',
    [IntegrationType.GorgiasChat]: 'chat',
}

export const integrationsStatsFilterLabels = {
    plural: 'integrations',
    singular: 'integration',
}

type Props = {
    value: LegacyStatsFilters['integrations']
    integrations: Integration[]
    isMultiple?: boolean
    isRequired?: boolean
    variant?: 'fill' | 'ghost'
}

const isHelpCenterIntegration = (integration: AppIntegration) =>
    integration.meta.address.startsWith(HELP_CENTER_INTEGRATION_ADDRESS_PREFIX)
const isContactFormIntegration = (integration: AppIntegration) =>
    integration.meta.address.startsWith(CONTACT_FORM_INTEGRATION_ADDRESS_PREFIX)
const getAppIntegrationIcon = (integration: AppIntegration) => {
    if (isHelpCenterIntegration(integration)) {
        return 'live_help'
    } else if (isContactFormIntegration(integration)) {
        return 'edit_note'
    }
    return ''
}

export const getIntegrationIcon = (integration: Integration) => {
    if (integration.type === IntegrationType.App) {
        return getAppIntegrationIcon(integration)
    }

    return (
        FONT_ICONS[integration.type as keyof typeof FONT_ICONS] || (
            <img
                src={IMAGE_ICONS[integration.type as keyof typeof IMAGE_ICONS]}
                alt={`logo-${integration.type}`}
                className={css.integrationIcon}
            />
        )
    )
}

/**
 * @deprecated
 * @date 2024-07-03
 * @type feature-component
 */
export default function DEPRECATED_IntegrationsStatsFilter({
    value = [],
    integrations,
    isMultiple = false,
    isRequired = false,
    variant = 'fill',
}: Props) {
    const dispatch = useAppDispatch()

    const selectedIntegrationsIds = useMemo(() => {
        const integrationsIds = integrations.map(
            (integration) => integration.id,
        )
        return value.filter((integrationId) =>
            integrationsIds.includes(integrationId),
        )
    }, [value, integrations])
    const Component = variant === 'fill' ? SelectFilter : SelectStatsFilter

    const handleFilterChange: ComponentProps<typeof Component>['onChange'] =
        useCallback(
            (values) => {
                dispatch(
                    mergeStatsFilters({
                        integrations: values as number[],
                        campaigns: [],
                    }),
                )
            },
            [dispatch],
        )

    return (
        <Component
            {...integrationsStatsFilterLabels}
            isMultiple={isMultiple}
            isRequired={isRequired}
            onChange={handleFilterChange}
            value={selectedIntegrationsIds}
        >
            {integrations.map((integration) => {
                const icon = getIntegrationIcon(integration)

                return (
                    <Component.Item
                        key={integration.id}
                        label={integration.name}
                        value={integration.id}
                        icon={icon}
                    />
                )
            })}
        </Component>
    )
}
