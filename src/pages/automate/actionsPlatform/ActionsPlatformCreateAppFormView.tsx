import React, {useMemo} from 'react'
import _keyBy from 'lodash/keyBy'
import {useHistory} from 'react-router-dom'

import AutomateFormView from 'pages/automate/common/components/AutomateFormView'
import {useGetApps} from 'models/integration/queries'
import {useListActionsApps} from 'models/workflows/queries'

import ActionsPlatformAppForm from './components/ActionsPlatformAppForm'
import useCreateActionsApp from './hooks/useCreateActionsApp'

const ActionsPlatformCreateAppFormView = () => {
    const history = useHistory()

    const {data: apps = [], isInitialLoading: isGetAppsInitialLoading} =
        useGetApps()
    const {
        data: actionsApps = [],
        isInitialLoading: isActionsAppsInitialLoading,
    } = useListActionsApps()
    const {createActionsApp, isLoading: isCreateActionsAppLoading} =
        useCreateActionsApp()

    const isLoading = isGetAppsInitialLoading || isActionsAppsInitialLoading

    const filteredApps = useMemo(() => {
        const actionsAppsByAppId = _keyBy(actionsApps, 'id')

        return apps.filter((app) => !(app.id in actionsAppsByAppId))
    }, [apps, actionsApps])

    return (
        <AutomateFormView
            title="Actions platform"
            headerNavbarItems={[
                {
                    route: '/app/automation/actions-platform',
                    title: 'Templates',
                    exact: true,
                },
                {
                    route: '/app/automation/actions-platform/apps',
                    title: 'Apps',
                    exact: false,
                },
            ]}
            isLoading={isLoading}
        >
            <ActionsPlatformAppForm
                apps={filteredApps}
                onSubmit={async (value) => {
                    await createActionsApp([{id: value.id}, value])

                    history.push('/app/automation/actions-platform/apps')
                }}
                isSubmitting={isCreateActionsAppLoading}
            />
        </AutomateFormView>
    )
}

export default ActionsPlatformCreateAppFormView
