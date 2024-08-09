import React from 'react'

import {Redirect, useHistory, useParams} from 'react-router-dom'
import AutomateFormView from 'pages/automate/common/components/AutomateFormView'
import {useGetApps} from 'models/integration/queries'
import {useGetActionsApp} from 'models/workflows/queries'

import ActionsPlatformAppForm from './components/ActionsPlatformAppForm'
import useEditActionsApp from './hooks/useEditActionsApp'

const ActionsPlatformEditAppFormView = () => {
    const history = useHistory()

    const {id} = useParams<{
        id: string
    }>()
    const {data: apps = [], isInitialLoading: isGetAppsInitialLoading} =
        useGetApps()
    const {data: actionsApp, isInitialLoading: isGetActionsAppInitialLoading} =
        useGetActionsApp(id)
    const {editActionsApp, isLoading: isEditActionsAppLoading} =
        useEditActionsApp(id)

    const isLoading = isGetAppsInitialLoading || isGetActionsAppInitialLoading

    if (!isLoading && !actionsApp) {
        return <Redirect to="/app/automation/actions-platform/apps" />
    }

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
                value={actionsApp}
                apps={apps}
                onSubmit={async (value) => {
                    await editActionsApp([{id: value.id}, value])

                    history.push('/app/automation/actions-platform/apps')
                }}
                isSubmitting={isEditActionsAppLoading}
            />
        </AutomateFormView>
    )
}

export default ActionsPlatformEditAppFormView
