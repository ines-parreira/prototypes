import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import type { GetAppFromTemplateApp } from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import type {
    ActionTemplateApp,
    App,
} from 'pages/automate/actionsPlatform/types'

export type SkillActionGroup = {
    key: string
    integration: App | undefined
    actionNames: string[]
}

const getIntegrationKey = (templateApp: ActionTemplateApp): string =>
    templateApp.type === 'app' ? templateApp.app_id : templateApp.type

export const groupActionsByIntegration = (
    actionConfigurationIds: string[],
    rawActions: StoreWorkflowsConfiguration[],
    getAppFromTemplateApp: GetAppFromTemplateApp,
): SkillActionGroup[] => {
    const actionsById = new Map<string, StoreWorkflowsConfiguration>()
    for (const action of rawActions) {
        actionsById.set(action.id, action)
    }

    const groups = new Map<string, SkillActionGroup>()

    for (const id of actionConfigurationIds) {
        const action = actionsById.get(id)
        if (!action) continue

        const templateApp = action.apps?.[0]
        const key = templateApp ? getIntegrationKey(templateApp) : 'unknown'
        const integration = templateApp
            ? getAppFromTemplateApp(templateApp)
            : undefined

        const existing = groups.get(key)
        if (existing) {
            existing.actionNames.push(action.name)
        } else {
            groups.set(key, {
                key,
                integration,
                actionNames: [action.name],
            })
        }
    }

    return Array.from(groups.values())
}
