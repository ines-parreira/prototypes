import { Route, useRouteMatch } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreSelector } from 'settings/automate'
import { getGorgiasChatIntegrationsByStoreName } from 'state/integrations/selectors'

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

    const selectedName = selected
        ? getShopNameFromStoreIntegration(selected)
        : undefined

    const chatIntegration = useAppSelector(
        getGorgiasChatIntegrationsByStoreName(selectedName ?? ''),
    )
    const chatId = chatIntegration?.id

    const { shouldShowScreensRevampWhenAiAgentEnabled } =
        useShouldShowChatSettingsRevamp(selected, chatId)

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selectedName}`
        : undefined

    return (
        <div className={css.container}>
            {shouldShowScreensRevampWhenAiAgentEnabled ? (
                <FlowsSettingsHeader />
            ) : (
                <FlowsSettingsLegacyHeader />
            )}

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
