import React, {useMemo, useState} from 'react'

import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import AutomateListView from 'pages/automate/common/components/AutomateListView'

import ActionsPlatformTemplatesFilters from './components/ActionsPlatformTemplatesFilters'
import ActionsPlatformTemplatesTable from './components/ActionsPlatformTemplatesTable'
import useApps from './hooks/useApps'
import useGetAppFromTemplate from './hooks/useGetAppFromTemplate'
import {ActionTemplate, App} from './types'

import css from './ActionsPlatformTemplatesView.less'

const ActionsPlatformTemplatesView = () => {
    const {
        data: templates = [],
        isInitialLoading: isGetTemplatesInitialLoading,
    } = useGetWorkflowConfigurationTemplates(['llm-prompt'])
    const {apps, isLoading: areAppsLoading} = useApps()
    const getAppFromTemplate = useGetAppFromTemplate({apps})

    const [name, setName] = useState('')
    const [app, setApp] = useState<App | null>(null)

    const filteredTemplates = useMemo<ActionTemplate[]>(() => {
        const nameLowerCase = name.toLocaleLowerCase()

        return templates.filter((template) => {
            if (app) {
                const templateApp = getAppFromTemplate(template.apps[0])

                if (!templateApp || templateApp.id !== app.id) {
                    return false
                }
            }

            if (
                name &&
                !template.name.toLocaleLowerCase().includes(nameLowerCase)
            ) {
                return false
            }

            return true
        })
    }, [templates, getAppFromTemplate, app, name])

    const isLoading = isGetTemplatesInitialLoading || areAppsLoading

    return (
        <AutomateListView
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
                    exact: true,
                },
            ]}
            isLoading={isLoading}
        >
            <div className={css.content}>
                <div>
                    Create, customize, publish and maintain reusable Actions for
                    AI Agent.
                </div>
                <ActionsPlatformTemplatesFilters
                    apps={apps}
                    app={app}
                    onAppChange={setApp}
                    name={name}
                    onNameChange={setName}
                />
            </div>
            <ActionsPlatformTemplatesTable
                templates={filteredTemplates}
                getAppFromTemplate={getAppFromTemplate}
            />
        </AutomateListView>
    )
}

export default ActionsPlatformTemplatesView
