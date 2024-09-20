import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import {RevenueAddonApiClientProvider} from 'pages/convert/common/hooks/useConvertApi'

import NewBilling from 'pages/settings/new_billing/views/BillingStartView'

import {renderer} from './helpers/settingsRenderer'

export function Billing() {
    const {path} = useRouteMatch()

    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route
                    path={[
                        `${path}/`,
                        `${path}/payment`,
                        `${path}/payment-history`,
                    ]}
                    render={renderer(
                        NewBilling,
                        ADMIN_ROLE,
                        PageSection.NewBilling
                    )}
                />
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}
