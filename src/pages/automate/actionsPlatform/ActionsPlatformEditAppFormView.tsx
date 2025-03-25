import { Redirect, useHistory, useParams } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import { useGetActionsApp } from 'models/workflows/queries'
import AutomateFormView from 'pages/automate/common/components/AutomateFormView'

import ActionsPlatformAppForm from './components/ActionsPlatformAppForm'
import useApps from './hooks/useApps'
import useEditActionsApp from './hooks/useEditActionsApp'

const ActionsPlatformEditAppFormView = () => {
    const history = useHistory()

    const { id } = useParams<{
        id: string
    }>()

    const {
        data: actionsApp,
        isInitialLoading: isGetActionsAppInitialLoading,
    } = useGetActionsApp(id)
    const { apps, isLoading: isAppsLoading } = useApps([IntegrationType.App])
    const { editActionsApp, isLoading: isEditActionsAppLoading } =
        useEditActionsApp(id)

    const isLoading = isAppsLoading || isGetActionsAppInitialLoading

    if (!isLoading && !actionsApp) {
        return <Redirect to="/app/ai-agent/actions-platform/apps" />
    }

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
                    route: '/app/ai-agent/actions-platform/use-cases',
                    title: 'Use case templates',
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
                value={actionsApp}
                apps={apps}
                onSubmit={async (value) => {
                    await editActionsApp([{ id: value.id }, value])

                    history.push('/app/ai-agent/actions-platform/apps')
                }}
                isSubmitting={isEditActionsAppLoading}
            />
        </AutomateFormView>
    )
}

export default ActionsPlatformEditAppFormView
