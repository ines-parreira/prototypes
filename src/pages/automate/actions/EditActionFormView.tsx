import React, {useMemo, useState} from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {useParams, Link, useHistory} from 'react-router-dom'
import {useQueryClient} from '@tanstack/react-query'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import AutomateView from 'pages/automate/common/components/AutomateView'

import {handleError} from 'pages/automate/actions/hooks/errorHandler'
import {
    useGetWorkflowConfiguration,
    storeWorkflowsConfigurationDefinitionKeys,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'

import {ACTIONS} from '../common/components/constants'
import {getActionsAppByType} from './utils'
import {
    StoresWorkflowConfiguration,
    CustomActionConfigurationFormInput,
    TemplateConfigurationFormInput,
} from './types'
import CustomActionsForm from './components/CustomActionsForm'
import TemplateActionsForm from './components/TemplateActionsForm'
import css from './ActionsView.less'

export default function EditActionFormView() {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const history = useHistory()

    const [apiKeyModalIsOpen, setApiKeyModalIsOpen] = useState(false)
    const {shopName, shopType, id} = useParams<{
        shopType: string
        shopName: string
        id: string
    }>()

    const storeConfigurationQueryKey =
        storeWorkflowsConfigurationDefinitionKeys.list({
            storeName: shopName,
            storeType: shopType,
        })

    const {data: configurationData, isInitialLoading} =
        useGetWorkflowConfiguration(
            {
                id,
            },
            {
                initialData: queryClient
                    .getQueryData<StoresWorkflowConfiguration>(
                        storeConfigurationQueryKey
                    )
                    ?.find((action) => action.id === id),
                onError: (error) => {
                    handleError(error, 'Failed to fetch action', dispatch)
                    history.push(
                        `/app/automation/${shopType}/${shopName}/actions`
                    )
                },
                initialDataUpdatedAt: () =>
                    queryClient.getQueryState<StoresWorkflowConfiguration>(
                        storeConfigurationQueryKey
                    )?.dataUpdatedAt,
            }
        )

    const {
        data: templateConfigurations,
        isInitialLoading: isTemplateConfigurationsLoading,
    } = useGetWorkflowConfigurationTemplates(['llm-prompt'], {
        enabled: !!configurationData?.template_internal_id,
    })

    const templateConfiguration = useMemo(
        () =>
            templateConfigurations?.find(
                (template) =>
                    template.internal_id ===
                    configurationData?.template_internal_id
            ),
        [templateConfigurations, configurationData]
    )
    const configurationAppTypeApp = getActionsAppByType(
        'app',
        configurationData?.apps
    )

    return (
        <AutomateView
            className={css.actionsFormContainer}
            isLoading={isInitialLoading || isTemplateConfigurationsLoading}
            title={
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link
                            to={`/app/automation/${shopType}/${shopName}/actions`}
                        >
                            {ACTIONS}
                        </Link>
                    </BreadcrumbItem>
                    {configurationData && (
                        <BreadcrumbItem active>
                            {configurationData.name}
                        </BreadcrumbItem>
                    )}
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
            {templateConfiguration ? (
                <TemplateActionsForm
                    initialConfigurationData={
                        configurationData as TemplateConfigurationFormInput
                    }
                    templateConfiguration={templateConfiguration}
                    apiKeyModalIsOpen={apiKeyModalIsOpen}
                    setApiKeyModalIsOpen={setApiKeyModalIsOpen}
                />
            ) : (
                <CustomActionsForm
                    initialConfigurationData={
                        configurationData as CustomActionConfigurationFormInput
                    }
                />
            )}
        </AutomateView>
    )
}
