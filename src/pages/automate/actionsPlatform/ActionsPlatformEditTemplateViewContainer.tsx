import { Redirect, useParams } from 'react-router-dom'

import { useGetWorkflowConfigurationTemplate } from 'models/workflows/queries'

import ActionsPlatformEditTemplateView from './ActionsPlatformEditTemplateView'

const ActionsPlatformEditTemplateViewContainer = () => {
    const { id } = useParams<{
        id: string
    }>()
    const { data: template, isInitialLoading: isGetTemplateInitialLoading } =
        useGetWorkflowConfigurationTemplate(id)

    if (isGetTemplateInitialLoading) {
        return null
    }

    if (!template) {
        return <Redirect to="/app/ai-agent/actions-platform" />
    }

    return <ActionsPlatformEditTemplateView template={template} />
}

export default ActionsPlatformEditTemplateViewContainer
