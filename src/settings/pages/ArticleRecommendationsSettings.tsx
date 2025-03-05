import React from 'react'

import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom'

import Header from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import { StoreSelector, useStoreSelector } from 'settings/automate'

import css from './ArticleRecommendationsSettings.less'

export const BASE_PATH = '/app/settings/article-recommendations'

export function ArticleRecommendationsSettings() {
    const { path } = useRouteMatch()
    const { integrations, onChange, selected } = useStoreSelector(BASE_PATH)

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selected.name}`
        : undefined

    return (
        <div className={css.container}>
            <Header title="Article recommendations">
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
                    <Switch>
                        <Route exact path={`${path}`}>
                            <p>Configuration content.</p>
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
