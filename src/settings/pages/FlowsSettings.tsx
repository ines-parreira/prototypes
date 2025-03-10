import React from 'react'

import { NavLink, Route, useRouteMatch } from 'react-router-dom'

import Header from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import { StoreSelector, useStoreSelector } from 'settings/automate'

import { AutomateSettingsFlowsAnalyticsRoute } from './flows-routes/AutomateSettingsFlowsAnalysisRoute'
import { AutomateSettingsFlowsBaseRoute } from './flows-routes/AutomateSettingsFlowsBaseRoute'
import { AutomateSettingsChannelsRoute } from './flows-routes/AutomateSettingsFlowsChannelsRoute'
import { AutomateSettingsFlowsEditRoute } from './flows-routes/AutomateSettingsFlowsEditRoute'
import { AutomateSettingsFlowsNewRoute } from './flows-routes/AutomateSettingsFlowsNewRoute'

import css from './FlowsSettings.less'

export const BASE_PATH = '/app/settings/flows'

export function FlowsSettings() {
    const { path } = useRouteMatch()
    const { integrations, onChange, selected } = useStoreSelector(BASE_PATH)

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selected.name}`
        : undefined

    return (
        <div className={css.container}>
            <Header title="Flows">
                <StoreSelector
                    integrations={integrations}
                    selected={selected?.id}
                    onChange={onChange}
                />
            </Header>
            {!!selected && !!selectedPath && (
                <>
                    <SecondaryNavbar>
                        <NavLink exact to={`${selectedPath}`}>
                            Configuration
                        </NavLink>
                        <NavLink exact to={`${selectedPath}/channels`}>
                            Channels
                        </NavLink>
                    </SecondaryNavbar>

                    <Route
                        path={path}
                        component={AutomateSettingsFlowsBaseRoute}
                    />
                    <Route
                        path={`${path}/new`}
                        exact
                        component={AutomateSettingsFlowsNewRoute}
                    />
                    <Route
                        path={`${path}/edit/:editWorkflowId`}
                        exact
                        component={AutomateSettingsFlowsEditRoute}
                    />
                    <Route
                        path={`${path}/analytics/:editWorkflowId`}
                        exact
                        component={AutomateSettingsFlowsAnalyticsRoute}
                    />

                    <Route
                        path={`${path}/channels`}
                        component={AutomateSettingsChannelsRoute}
                    />
                </>
            )}
        </div>
    )
}
