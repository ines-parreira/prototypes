import React, {useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import _keyBy from 'lodash/keyBy'

import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import AutomateListView from 'pages/automate/common/components/AutomateListView'
import Button from 'pages/common/components/button/Button'
import useOrderBy from 'hooks/useOrderBy'

import ActionsPlatformTemplatesFilters from './components/ActionsPlatformTemplatesFilters'
import ActionsPlatformTemplatesTable from './components/ActionsPlatformTemplatesTable'
import ActionsPlatformTemplatesTableRow from './components/ActionsPlatformTemplatesTableRow'
import useApps from './hooks/useApps'
import useGetAppFromTemplateApp from './hooks/useGetAppFromTemplateApp'
import useDeleteActionTemplate from './hooks/useDeleteActionTemplate'
import {ActionTemplate, App} from './types'

import css from './ActionsPlatformTemplatesView.less'

const ActionsPlatformTemplatesView = () => {
    const {
        data: templates = [],
        isInitialLoading: isGetTemplatesInitialLoading,
    } = useGetWorkflowConfigurationTemplates({
        triggers: ['llm-prompt'],
    })
    const {deleteActionTemplate, isLoading: isDeleteActionTemplateLoading} =
        useDeleteActionTemplate()
    const {apps, isLoading: areAppsLoading, actionsApps} = useApps()
    const getAppFromTemplateApp = useGetAppFromTemplateApp({apps})
    const history = useHistory()

    const [name, setName] = useState('')
    const [app, setApp] = useState<App | null>(null)
    const {orderDirection, orderBy, orderParam, toggleOrderBy} =
        useOrderBy<'updated_datetime'>('updated_datetime')

    const filteredTemplates = useMemo<ActionTemplate[]>(() => {
        const nameLowerCase = name.toLocaleLowerCase().trim()

        return templates.filter((template) => {
            if (app) {
                const templateApp = getAppFromTemplateApp(template.apps[0])

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
    }, [templates, getAppFromTemplateApp, app, name])
    const orderedTemplates = useMemo(() => {
        return [...filteredTemplates].sort((a, b) => {
            const aUpdatedDatetime = new Date(a.updated_datetime)
            const bUpdatedDatetime = new Date(b.updated_datetime)

            switch (orderParam) {
                case 'updated_datetime:asc':
                    return aUpdatedDatetime > bUpdatedDatetime ? -1 : 1
                case null:
                case 'updated_datetime:desc':
                    return aUpdatedDatetime < bUpdatedDatetime ? -1 : 1
            }
        })
    }, [filteredTemplates, orderParam])
    const filteredApps = useMemo(() => {
        const actionsAppsById = _keyBy(actionsApps, 'id')

        return apps.filter(
            (app) => app.type !== 'app' || app.id in actionsAppsById
        )
    }, [apps, actionsApps])

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
                <div className={css.description}>
                    <span>
                        Create, customize, publish and maintain reusable Actions
                        for AI Agent.
                    </span>
                    <Button
                        onClick={() => {
                            history.push('/app/automation/actions-platform/new')
                        }}
                    >
                        Create Action template
                    </Button>
                </div>
                <ActionsPlatformTemplatesFilters
                    apps={filteredApps}
                    app={app}
                    onAppChange={setApp}
                    name={name}
                    onNameChange={setName}
                />
            </div>
            <ActionsPlatformTemplatesTable
                orderDirection={orderDirection}
                orderBy={orderBy}
                toggleOrderBy={toggleOrderBy}
            >
                {orderedTemplates.map((template) => (
                    <ActionsPlatformTemplatesTableRow
                        key={template.id}
                        template={template}
                        app={getAppFromTemplateApp(template.apps[0])}
                        onClick={() => {
                            history.push(
                                `/app/automation/actions-platform/edit/${template.id}`
                            )
                        }}
                        onDelete={() => {
                            void deleteActionTemplate([
                                {internal_id: template.internal_id},
                            ])
                        }}
                        isDisabled={isDeleteActionTemplateLoading}
                    />
                ))}
            </ActionsPlatformTemplatesTable>
        </AutomateListView>
    )
}

export default ActionsPlatformTemplatesView
