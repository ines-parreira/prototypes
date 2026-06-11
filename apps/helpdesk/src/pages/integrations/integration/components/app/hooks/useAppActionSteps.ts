import { useMemo } from 'react'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import { useGetIsActionStepEnabled } from 'pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled'

import type { AppActionStep } from '../AppActionsStepsTable'

export function useAppActionSteps(appId: string) {
    const { data: templates = [], isInitialLoading } =
        useGetWorkflowConfigurationTemplates({
            triggers: ['reusable-llm-prompt'],
        })

    const getIsActionStepEnabled = useGetIsActionStepEnabled()

    const appActionSteps = useMemo<AppActionStep[]>(() => {
        const matchedById = new Map<string, (typeof templates)[number]>()
        for (const template of templates) {
            if (matchedById.has(template.id)) continue
            if (!getIsActionStepEnabled(template.internal_id)) continue
            const isMatch = template.apps.some(
                (app) =>
                    (app.type === 'app' && app.app_id === appId) ||
                    app.type === appId,
            )
            if (isMatch) matchedById.set(template.id, template)
        }
        return Array.from(matchedById.values())
    }, [templates, appId, getIsActionStepEnabled])

    return { appActionSteps, isInitialLoading }
}
