import { Link, NavLink, Route, Switch, useRouteMatch } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { IntegrationType } from 'models/integration/constants'
import OrderManagementPreviewProvider from 'pages/automate/orderManagement/OrderManagementPreviewProvider'
import OrderManagementView from 'pages/automate/orderManagement/OrderManagementView'
import Header from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { useStoreSelector } from 'settings/automate'

import { AutomateSettingsChannelsRoute } from './flows-routes/AutomateSettingsFlowsChannelsRoute'
import { OrderManagementCancelRoute } from './order-management-routes/OrderManagementCancelRoute'
import { OrderManagementReportEditRoute } from './order-management-routes/OrderManagementReportEditRoute'
import { OrderManagementReportNewScenarioRoute } from './order-management-routes/OrderManagementReportNewScenarioRoute'
import { OrderManagementReportRoute } from './order-management-routes/OrderManagementReportRoute'
import { OrderManagementReturnRoute } from './order-management-routes/OrderManagementReturnRoute'
import { OrderManagementTrackRoute } from './order-management-routes/OrderManagementTrackRoute'

import css from './OrderManagementSettings.less'

export const BASE_PATH = '/app/settings/order-management'

type pageName = 'track' | 'return' | 'cancel' | 'report-issue'

const PAGE_NAME = {
    track: 'Track order',
    return: 'Return order',
    cancel: 'Cancel order',
    'report-issue': 'Report order issue',
}

export function OrderManagementSettings() {
    const { path } = useRouteMatch()
    const match = useRouteMatch<{
        shopType?: string
        shopName: string
        scenarioIndex: string
    }>({
        path: [
            '/app/settings/order-management/:shopType/:shopName/track',
            '/app/settings/order-management/:shopType/:shopName/return',
            '/app/settings/order-management/:shopType/:shopName/cancel',
            '/app/settings/order-management/:shopType/:shopName/report-issue',
            '/app/settings/order-management/:shopType/:shopName/report-issue/:scenarioIndex',
        ],
        exact: true,
    })
    const pathItems = match?.url.split('/')
    const pageName = !!pathItems
        ? !!match?.params.scenarioIndex
            ? (pathItems[pathItems.length - 2] as pageName | undefined)
            : (pathItems[pathItems.length - 1] as pageName | undefined)
        : undefined

    const scenarioParam = match?.params.scenarioIndex

    const { integrations, onChange, selected } = useStoreSelector(BASE_PATH, [
        IntegrationType.Shopify,
    ])

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selected.name}`
        : undefined

    return (
        <div className={css.container}>
            <Header
                className={css.header}
                title={
                    !!match ? (
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={BASE_PATH}>Order management</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {!!pageName &&
                                    (!!scenarioParam ? (
                                        <Link
                                            to={`${selectedPath}/report-issue`}
                                        >
                                            {!!pageName && PAGE_NAME[pageName]}
                                        </Link>
                                    ) : (
                                        PAGE_NAME[pageName]
                                    ))}
                            </BreadcrumbItem>
                            {!!scenarioParam && (
                                <BreadcrumbItem>
                                    {scenarioParam === 'new' ? 'New ' : 'Edit '}
                                    scenario
                                </BreadcrumbItem>
                            )}
                        </Breadcrumb>
                    ) : (
                        'Order Management'
                    )
                }
            >
                <StoreSelector
                    integrations={integrations}
                    selected={selected}
                    onChange={onChange}
                />
            </Header>
            {!!selected && !!selectedPath && (
                <OrderManagementPreviewProvider>
                    <SecondaryNavbar>
                        <NavLink exact to={selectedPath}>
                            Configuration
                        </NavLink>
                        <NavLink exact to={`${selectedPath}/channels`}>
                            Channels
                        </NavLink>
                    </SecondaryNavbar>
                    <Switch>
                        <Route exact path={path}>
                            <OrderManagementView />
                        </Route>
                        <Route
                            path={`${path}/track`}
                            component={OrderManagementTrackRoute}
                        />
                        <Route
                            path={`${path}/return`}
                            component={OrderManagementReturnRoute}
                        />
                        <Route
                            path={`${path}/cancel`}
                            component={OrderManagementCancelRoute}
                        />
                        <Route
                            path={`${path}/report-issue`}
                            exact
                            component={OrderManagementReportRoute}
                        />
                        <Route
                            path={`${path}/report-issue/new`}
                            exact
                            component={OrderManagementReportNewScenarioRoute}
                        />
                        <Route
                            path={`${path}/report-issue/:scenarioIndex`}
                            exact
                            component={OrderManagementReportEditRoute}
                        />
                        <Route path={`${path}/channels`}>
                            <AutomateSettingsChannelsRoute />
                        </Route>
                    </Switch>
                </OrderManagementPreviewProvider>
            )}
        </div>
    )
}
