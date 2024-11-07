import React from 'react'
import {Redirect, useParams} from 'react-router-dom'

import {useGetWorkflowConfigurationTemplate} from 'models/workflows/queries'

import ActionsPlatformEditStepView from './ActionsPlatformEditStepView'

const ActionsPlatformEditStepViewContainer = () => {
    const {id} = useParams<{
        id: string
    }>()
    const {data: template, isInitialLoading: isGetStepInitialLoading} =
        useGetWorkflowConfigurationTemplate(id)

    if (isGetStepInitialLoading) {
        return null
    }

    if (!template) {
        return <Redirect to="/app/automation/actions-platform/steps" />
    }

    return <ActionsPlatformEditStepView template={template} />
}

export default ActionsPlatformEditStepViewContainer
