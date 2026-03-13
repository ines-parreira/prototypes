import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { Route, useRouteMatch } from 'react-router-dom'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreSelector } from 'settings/automate'

import { AutomateSettingsFlowsAnalyticsRoute } from './flows-routes/AutomateSettingsFlowsAnalysisRoute'
import { AutomateSettingsFlowsBaseRoute } from './flows-routes/AutomateSettingsFlowsBaseRoute'
import { AutomateSettingsChannelsRoute } from './flows-routes/AutomateSettingsFlowsChannelsRoute'
import { AutomateSettingsFlowsEditRoute } from './flows-routes/AutomateSettingsFlowsEditRoute'
import { AutomateSettingsFlowsNewRoute } from './flows-routes/AutomateSettingsFlowsNewRoute'
import { FlowsSettingsHeader } from './FlowsSettingsHeader'
import { FlowsSettingsLegacyHeader } from './FlowsSettingsLegacyHeader'

import css from './FlowsSettings.less'

export const BASE_PATH = '/app/settings/flows'

export function FlowsSettings() {
    const { path } = useRouteMatch()
    const { selected } = useStoreSelector(BASE_PATH)

    const { value: isRevamp } = useFlagWithLoading(
        FeatureFlagKey.ChatSettingsScreensRevamp,
    )

    const selectedName = selected
        ? getShopNameFromStoreIntegration(selected)
        : undefined

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selectedName}`
        : undefined

    return (
        <div className={css.container}>
            {isRevamp ? <FlowsSettingsHeader /> : <FlowsSettingsLegacyHeader />}

            {!!selected && !!selectedPath && (
                <>
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
