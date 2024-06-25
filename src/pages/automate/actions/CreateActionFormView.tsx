import React, {useMemo, useState} from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {useParams, Link, useLocation} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {ACTIONS} from '../common/components/constants'
import CustomActionsForm from './components/CustomActionsForm'
import TemplateActionsForm from './components/TemplateActionsForm'
import {TemplateConfigurationFormInput} from './types'
import {
    generateNewCustomActionConfigurationFormInput,
    getActionsAppByType,
    getTriggerstByKind,
} from './utils'
import css from './ActionsView.less'

export default function CreateActionFormView() {
    const {search} = useLocation()
    const params = useMemo(() => new URLSearchParams(search), [search])
    const [apiKeyModalIsOpen, setApiKeyModalIsOpen] = useState(false)
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

    const configurationAppTypeApp = getActionsAppByType(
        'app',
        newActionConfiguration?.apps
    )

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
            action={
                <>
                    {configurationAppTypeApp && (
                        <Button
                            fillStyle="ghost"
                            className={css.viewAppAuthButton}
                            onClick={() => {
                                setApiKeyModalIsOpen(true)
                            }}
                        >
                            View App Authentication
                        </Button>
                    )}
                </>
            }
        >
            {isTemplateAction ? (
                <TemplateActionsForm
                    initialConfigurationData={newActionConfiguration}
                    templateConfiguration={templateConfiguration}
                    apiKeyModalIsOpen={apiKeyModalIsOpen}
                    setApiKeyModalIsOpen={setApiKeyModalIsOpen}
                />
            ) : (
                <CustomActionsForm
                    initialConfigurationData={generateNewCustomActionConfigurationFormInput()}
                />
            )}
        </AutomateView>
    )
}
