import React, { useMemo } from 'react'

import _keyBy from 'lodash/keyBy'
import { useHistory } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import AutomateFormView from 'pages/automate/common/components/AutomateFormView'

import ActionsPlatformAppForm from './components/ActionsPlatformAppForm'
import useApps from './hooks/useApps'
import useCreateActionsApp from './hooks/useCreateActionsApp'

const ActionsPlatformCreateAppFormView = () => {
    const history = useHistory()

    const {
        apps,
        isLoading: isAppsLoading,
        actionsApps,
    } = useApps([IntegrationType.App])
    const { createActionsApp, isLoading: isCreateActionsAppLoading } =
        useCreateActionsApp()

    const isLoading = isAppsLoading

    const filteredApps = useMemo(() => {
        const actionsAppsByAppId = _keyBy(actionsApps, 'id')

        return apps.filter((app) => !(app.id in actionsAppsByAppId))
    }, [apps, actionsApps])

    return (
        <AutomateFormView
            title="Actions platform"
            headerNavbarItems={[
                {
                    route: '/app/ai-agent/actions-platform',
                    title: 'Templates',
                    exact: true,
                },
                {
                    route: '/app/ai-agent/actions-platform/steps',
                    title: 'Steps',
                    exact: true,
                },
                {
                    route: '/app/ai-agent/actions-platform/apps',
                    title: 'Apps',
                    exact: false,
                },
            ]}
            isLoading={isLoading}
        >
            <ActionsPlatformAppForm
                apps={filteredApps}
                onSubmit={async (value) => {
                    await createActionsApp([{ id: value.id }, value])

                    history.push('/app/ai-agent/actions-platform/apps')
                }}
                isSubmitting={isCreateActionsAppLoading}
            />
        </AutomateFormView>
    )
}

export default ActionsPlatformCreateAppFormView
