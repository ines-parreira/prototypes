import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {Value} from 'pages/common/forms/SelectField/types'
import {StatsFilters} from 'models/stat/types'
import {FeatureFlagKey} from 'config/featureFlags'
import useStoreIntegrations from 'pages/automation/common/hooks/useStoreIntegrations'
import {getIconFromType} from 'state/integrations/helpers'

import SelectFilter from '../common/SelectFilter'

import css from './SelfServiceIntegrationsFilter.less'

type Props = {
    value: StatsFilters['integrations']
    onChange: (value: StatsFilters['integrations']) => void
}

const SelfServiceIntegrationsFilter = ({value = [], onChange}: Props) => {
    const isAutomationSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]
    const storeIntegrations = useStoreIntegrations()
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Shopify)
    )

    return (
        <SelectFilter
            plural="stores"
            singular="store"
            onChange={onChange as (value: Value[]) => void}
            value={value}
        >
            {(isAutomationSettingsRevampEnabled
                ? storeIntegrations
                : shopifyIntegrations
            ).map((storeIntegration) => (
                <SelectFilter.Item
                    key={storeIntegration.id}
                    label={storeIntegration.name}
                    value={storeIntegration.id}
                    icon={
                        <img
                            src={getIconFromType(storeIntegration.type)}
                            alt="logo"
                            className={css.integrationIcon}
                        />
                    }
                />
            ))}
        </SelectFilter>
    )
}

export default SelfServiceIntegrationsFilter
