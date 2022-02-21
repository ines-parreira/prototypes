import React from 'react'
import {NavLink} from 'react-router-dom'

import {useSelector} from 'react-redux'
import SecondaryNavbar from '../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {getHasAutomationAddOn} from '../../../../state/billing/selectors'
import {useConfigurationData} from './hooks'

const SelfServicePreferencesNavbar = () => {
    const {integration} = useConfigurationData()
    const baseURL = `/app/settings/self-service/shopify/${
        integration.getIn(['meta', 'shop_name']) as string
    }/preferences`

    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)

    return (
        <SecondaryNavbar>
            {hasAutomationAddOn && (
                <NavLink to={`${baseURL}/quick-response`} exact>
                    Quick Response Flows
                </NavLink>
            )}
            <NavLink to={`${baseURL}/order-management`} exact>
                Order Management Flows
            </NavLink>
        </SecondaryNavbar>
    )
}

export default SelfServicePreferencesNavbar
