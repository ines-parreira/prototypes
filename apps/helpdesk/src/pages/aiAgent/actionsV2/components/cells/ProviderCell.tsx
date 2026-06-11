import { useMemo } from 'react'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { AppIcon } from 'pages/automate/actionsPlatform/components/AppIcon'
import { useApps } from 'pages/automate/actionsPlatform/hooks/useApps'
import { useGetAppFromTemplateApp } from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'

import { Avatar, Icon } from '@gorgias/axiom'

type Props = {
    action: StoreWorkflowsConfiguration
}

const ProviderCell = ({ action }: Props) => {
    const { apps } = useApps()
    const getAppFromTemplateApp = useGetAppFromTemplateApp({ apps })

    const { data: templateSteps = [] } = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })

    const hasHttpStep = useMemo(
        () => action.steps.some((step) => step.kind === 'http-request'),
        [action.steps],
    )

    const stepApps = useMemo(() => {
        const collected: Array<{ id: string; name?: string; icon?: string }> =
            []
        for (const step of action.steps) {
            if (step.kind !== 'reusable-llm-prompt-call') continue
            const template = templateSteps.find(
                (t) => t.id === step.settings.configuration_id,
            )
            if (!template) continue
            for (const templateApp of template.apps) {
                const app = getAppFromTemplateApp(templateApp)
                const id =
                    templateApp.type === 'app'
                        ? templateApp.app_id
                        : templateApp.type
                if (collected.some((c) => c.id === id)) continue
                collected.push({ id, name: app?.name, icon: app?.icon })
            }
        }
        return collected
    }, [action.steps, templateSteps, getAppFromTemplateApp])

    const isMultiProvider = stepApps.length > 1 || hasHttpStep

    if (isMultiProvider) {
        return <Icon name="webhook" size="md" alt="Custom action" />
    }

    const single = stepApps[0]
    if (single?.icon) {
        return <AppIcon name={single.name} icon={single.icon} />
    }

    const fallbackName = single?.name ?? action.name ?? '?'

    return <Avatar name={fallbackName} size="sm" />
}

export { ProviderCell }
