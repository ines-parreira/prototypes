import React from 'react'
import {Redirect, useParams} from 'react-router-dom'

import {useGetWorkflowConfigurationTemplate} from 'models/workflows/queries'

import ActionsPlatformEditUseCaseTemplateView from './ActionsPlatformEditUseCaseTemplateView'

const ActionsPlatformEditUseCaseTemplateViewContainer = () => {
    const {id} = useParams<{
        id: string
    }>()
    const {data: template, isInitialLoading: isGetTemplateInitialLoading} =
        useGetWorkflowConfigurationTemplate(id)

    if (isGetTemplateInitialLoading) {
        return null
    }

    if (!template || !template.category) {
        return <Redirect to="/app/automation/actions-platform/use-cases" />
    }

    return <ActionsPlatformEditUseCaseTemplateView template={template} />
}

export default ActionsPlatformEditUseCaseTemplateViewContainer
