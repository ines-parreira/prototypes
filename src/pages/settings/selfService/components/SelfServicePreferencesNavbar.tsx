import React from 'react'
import {NavLink, useLocation} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {getHasAutomationAddOn} from 'state/billing/selectors'

const SelfServicePreferencesNavbar = () => {
    const {pathname} = useLocation()
    const baseURL = pathname.substring(0, pathname.lastIndexOf('/'))

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
