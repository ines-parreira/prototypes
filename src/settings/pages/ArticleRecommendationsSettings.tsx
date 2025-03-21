import cn from 'classnames'
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import ArticleRecommendationView from 'pages/automate/articleRecommendation/ArticleRecommendationView'
import Header from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import { StoreSelector, useStoreSelector } from 'settings/automate'

import { AutomateSettingsChannelsRoute } from './flows-routes/AutomateSettingsFlowsChannelsRoute'

import css from './ArticleRecommendationsSettings.less'

export const BASE_PATH = '/app/settings/article-recommendations'

export function ArticleRecommendationsSettings() {
    const { path } = useRouteMatch()
    const { integrations, onChange, selected } = useStoreSelector(BASE_PATH)

    const selectedName = selected
        ? getShopNameFromStoreIntegration(selected)
        : undefined
    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selectedName}`
        : undefined

    return (
        <div className={css.container}>
            <Header className={css.header} title="Article Recommendations">
                <StoreSelector
                    integrations={integrations}
                    selected={selected}
                    onChange={onChange}
                />
            </Header>
            {!!selected && !!selectedPath && (
                <>
                    <SecondaryNavbar>
                        <NavLink exact to={`${selectedPath}`}>
                            Train
                        </NavLink>
                        <NavLink exact to={`${selectedPath}/configuration`}>
                            Configuration
                        </NavLink>
                        <NavLink exact to={`${selectedPath}/channels`}>
                            Channels
                        </NavLink>
                    </SecondaryNavbar>
                    <div
                        className={cn(css.content, 'automate-settings-content')}
                    >
                        <Switch>
                            <Route exact path={`${path}/channels`}>
                                <AutomateSettingsChannelsRoute />
                            </Route>
                            <Route path={`${path}`}>
                                <ArticleRecommendationView basePath={path} />
                            </Route>
                        </Switch>
                    </div>
                </>
            )}
        </div>
    )
}
