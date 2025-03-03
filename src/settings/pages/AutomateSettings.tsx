import React from 'react'

import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom'

import Header from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import { BASE_PATH, useAutomateSettings } from '../hooks/useAutomateSettings'

import css from './AutomateSettings.less'

export function AutomateSettings() {
    const { path } = useRouteMatch()
    const { integrations, onChangeIntegration, selected } =
        useAutomateSettings()

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selected.name}`
        : undefined

    return (
        <div className={css.container}>
            <Header title="Automate">
                <select onChange={onChangeIntegration} value={selected?.id}>
                    {integrations.map((integration) => (
                        <option key={integration.id} value={integration.id}>
                            {integration.name}
                        </option>
                    ))}
                </select>
            </Header>
            {!!selected && !!selectedPath && (
                <>
                    <SecondaryNavbar>
                        <NavLink to={`${selectedPath}/flows`}>Flows</NavLink>
                        <NavLink to={`${selectedPath}/order-management`}>
                            Order Management
                        </NavLink>
                        <NavLink to={`${selectedPath}/article-recommendations`}>
                            Article Recommendations
                        </NavLink>
                        <NavLink to={`${selectedPath}/channels`}>
                            Channels
                        </NavLink>
                    </SecondaryNavbar>
                    <Switch>
                        <Route path={`${path}/flows`}>
                            <p>Flows content.</p>
                        </Route>
                        <Route path={`${path}/order-management`}>
                            <p>Order management content.</p>
                        </Route>
                        <Route path={`${path}/article-recommendations`}>
                            <p>Article recommendations content.</p>
                        </Route>
                        <Route path={`${path}/channels`}>
                            <p>Channels content.</p>
                        </Route>
                    </Switch>
                </>
            )}
        </div>
    )
}
