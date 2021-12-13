import React, {ComponentProps, useCallback, useMemo} from 'react'
import {fromJS} from 'immutable'
import aircallIcon from 'assets/img/integrations/aircall.png'
import gmailIcon from 'assets/img/integrations/gmail.png'
import outlookIcon from 'assets/img/integrations/outlook.svg'
import shopifyIcon from 'assets/img/integrations/shopify.png'
import smoochIcon from 'assets/img/integrations/smooch.png'
import zendeskIcon from 'assets/img/integrations/zendesk.png'
import {
    IntegrationsStatsFilterValue,
    StatsFilterType,
} from '../../state/stats/types'
import {IntegrationType} from '../../models/integration/constants'
import {mergeStatsFilters} from '../../state/stats/actions'
import useAppDispatch from '../../hooks/useAppDispatch'
import {Integration} from '../../models/integration/types'

import SelectFilter from './common/SelectFilter'
import css from './IntegrationsStatsFilter.less'

export const IMAGE_ICONS = {
    [IntegrationType.Aircall]: aircallIcon,
    [IntegrationType.Gmail]: gmailIcon,
    [IntegrationType.Outlook]: outlookIcon,
    [IntegrationType.Shopify]: shopifyIcon,
    [IntegrationType.Smooch]: smoochIcon,
    [IntegrationType.SmoochInside]: smoochIcon,
    [IntegrationType.Zendesk]: zendeskIcon,
}

export const FONT_ICONS = {
    [IntegrationType.Email]: 'email',
    [IntegrationType.Facebook]: 'facebook',
    [IntegrationType.Http]: 'http',
    [IntegrationType.Phone]: 'phone',
    [IntegrationType.GorgiasChat]: 'chat',
}

type Props = {
    value: IntegrationsStatsFilterValue
    integrations: Integration[]
    isMultiple?: boolean
    isRequired?: boolean
}

export default function IntegrationsStatsFilter({
    value,
    integrations,
    isMultiple = true,
    isRequired = false,
}: Props) {
    const dispatch = useAppDispatch()

    const selectedIntegrationsIds = useMemo(() => {
        const integrationsIds = integrations.map(
            (integration) => integration.id
        )
        return value.filter((integrationId) =>
            integrationsIds.includes(integrationId)
        )
    }, [value, integrations])

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(
                    mergeStatsFilters(
                        fromJS({[StatsFilterType.Integrations]: values})
                    )
                )
            },
            [dispatch]
        )

    return (
        <SelectFilter
            plural="integrations"
            singular="integration"
            isMultiple={isMultiple}
            isRequired={isRequired}
            onChange={handleFilterChange}
            value={selectedIntegrationsIds}
        >
            {integrations.map((integration) => {
                const icon = FONT_ICONS[
                    integration.type as keyof typeof FONT_ICONS
                ] || (
                    <img
                        src={
                            IMAGE_ICONS[
                                integration.type as keyof typeof IMAGE_ICONS
                            ]
                        }
                        alt={`logo-${integration.type}`}
                        className={css.integrationIcon}
                    />
                )
                return (
                    <SelectFilter.Item
                        key={integration.id}
                        label={integration.name}
                        value={integration.id}
                        icon={icon}
                    />
                )
            })}
        </SelectFilter>
    )
}
