import React from 'react'
import {NavLink} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppSelector from 'hooks/useAppSelector'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {FeatureFlagKey} from 'config/featureFlags'

import {useConfigurationData} from './hooks'

const SelfServicePreferencesNavbar = () => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]
    const {integration} = useConfigurationData()
    const baseURL = `/app/${
        isAutomationSettingsRevampEnabled ? 'automation' : 'settings'
    }/self-service/shopify/${
        integration.getIn(['meta', 'shop_name']) as string
    }/preferences`

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    return (
        <SecondaryNavbar>
            {hasAutomationAddOn && (
                <NavLink
                    to={`${baseURL}/quick-response`}
                    exact
                    isActive={(_, {pathname}: {pathname: string}) =>
                        pathname.includes(`${baseURL}/quick-response`)
                    }
                >
                    Quick Response Flows
                </NavLink>
            )}
            <NavLink
                to={`${baseURL}/order-management`}
                exact
                isActive={(_, {pathname}: {pathname: string}) =>
                    !pathname.includes(`${baseURL}/quick-response`)
                }
            >
                Order Management Flows
            </NavLink>
        </SecondaryNavbar>
    )
}

export default SelfServicePreferencesNavbar
