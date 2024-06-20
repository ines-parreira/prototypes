import React, {useMemo} from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {useParams, Link, useLocation} from 'react-router-dom'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {ACTIONS} from '../common/components/constants'
import CustomActionsForm from './components/CustomActionsForm'
import TemplateActionsForm from './components/TemplateActionsForm'
import {AUTOMATE_VIEW_ACTION_PORTAL_ID} from './constants'
import {TemplateConfigurationFormInput} from './types'
import {
    generateNewCustomActionConfigurationFormInput,
    getTriggerstByKind,
} from './utils'
import css from './ActionsView.less'

export default function CreateActionFormView() {
    const {search} = useLocation()
    const params = useMemo(() => new URLSearchParams(search), [search])
    const templateConfigurationId = params.get('template_id')

    const {
        data: templateConfigurations,
        isInitialLoading: isTemplateConfigurationsLoading,
    } = useGetWorkflowConfigurationTemplates(['llm-prompt'], {
        enabled: !!templateConfigurationId,
    })

    const [templateConfiguration, newActionConfiguration] = useMemo(() => {
        const template = templateConfigurations?.find(
            (template) => template.id === templateConfigurationId
        )
        if (!template?.triggers) {
            return []
        }
        const llmPromptTrigger = getTriggerstByKind(
            template.triggers,
            'llm-prompt'
        )

        const newActionConfigurationFormInput: TemplateConfigurationFormInput =
            {
                name: template?.name,
                initial_step_id: null,
                available_languages: [],
                is_draft: false,
                apps: template?.apps,
                entrypoints: template?.entrypoints,
                triggers: [
                    {
                        kind: 'llm-prompt',
                        settings: {
                            custom_inputs: [],
                            object_inputs: [],
                            outputs: [],
                            conditions: llmPromptTrigger?.settings.conditions,
                        },
                    },
                ],
                steps: [],
                transitions: [],
            }
        return [template, newActionConfigurationFormInput]
    }, [templateConfigurations, templateConfigurationId])

    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()

    const isTemplateAction = templateConfiguration && newActionConfiguration

    return (
        <AutomateView
            className={css.actionsFormContainer}
            isLoading={isTemplateConfigurationsLoading}
            title={
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link
                            to={`/app/automation/${shopType}/${shopName}/actions`}
                        >
                            {ACTIONS}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {isTemplateAction && templateConfiguration?.name
                            ? templateConfiguration.name
                            : 'New Action'}
                    </BreadcrumbItem>
                </Breadcrumb>
            }
            action={<div id={AUTOMATE_VIEW_ACTION_PORTAL_ID}></div>}
        >
            {isTemplateAction ? (
                <TemplateActionsForm
                    initialConfigurationData={newActionConfiguration}
                    templateConfiguration={templateConfiguration}
                />
            ) : (
                <CustomActionsForm
                    initialConfigurationData={generateNewCustomActionConfigurationFormInput()}
                />
            )}
        </AutomateView>
    )
}
