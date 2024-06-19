import React, {useMemo} from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {useParams, Link, useHistory} from 'react-router-dom'
import {useQueryClient} from '@tanstack/react-query'
import useAppDispatch from 'hooks/useAppDispatch'
import AutomateView from 'pages/automate/common/components/AutomateView'

import {handleError} from 'pages/automate/actions/hooks/errorHandler'
import {
    useGetWorkflowConfiguration,
    storeWorkflowsConfigurationDefinitionKeys,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'

import {ACTIONS} from '../common/components/constants'
import {AUTOMATE_VIEW_ACTION_PORTAL_ID} from './constants'
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
            action={<div id={AUTOMATE_VIEW_ACTION_PORTAL_ID}></div>}
        >
            {templateConfiguration ? (
                <TemplateActionsForm
                    initialConfigurationData={
                        configurationData as TemplateConfigurationFormInput
                    }
                    templateConfiguration={templateConfiguration}
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
