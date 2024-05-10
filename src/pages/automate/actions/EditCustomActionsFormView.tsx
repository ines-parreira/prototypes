import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {useParams, Link, useHistory} from 'react-router-dom'
import {useQueryClient} from '@tanstack/react-query'
import useAppDispatch from 'hooks/useAppDispatch'
import AutomateView from 'pages/automate/common/components/AutomateView'

import {Components} from 'rest_api/workflows_api/client.generated'

import {handleError} from 'pages/automate/actions/hooks/errorHandler'
import {
    useGetWorkflowConfiguration,
    storeWorkflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'

import {ACTIONS} from '../common/components/constants'
import {
    StoresWorkflowConfiguration,
    CustomActionConfigurationFormInput,
} from './types'
import CustomActionsForm from './components/CustomActionsForm'
import css from './ActionsView.less'

export default function ActionView() {
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

    const {data, isInitialLoading} = useGetWorkflowConfiguration(
        {
            id,
        },
        {
            initialData: queryClient
                .getQueryData<CustomActionConfigurationFormInput[]>(
                    storeConfigurationQueryKey
                )
                ?.find(
                    (action) => action.id === id
                ) as Components.Schemas.UpsertWfConfigurationRequestDto,
            onError: (error) => {
                handleError(error, 'Failed to fetch action', dispatch)
                history.push(`/app/automation/${shopType}/${shopName}/actions`)
            },
            initialDataUpdatedAt: () =>
                queryClient.getQueryState<StoresWorkflowConfiguration>(
                    storeConfigurationQueryKey
                )?.dataUpdatedAt,
        }
    )

    return (
        <AutomateView
            className={css.actionsFormContainer}
            isLoading={isInitialLoading}
            title={
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link
                            to={`/app/automation/${shopType}/${shopName}/actions`}
                        >
                            {ACTIONS}
                        </Link>
                    </BreadcrumbItem>
                    {data && (
                        <BreadcrumbItem active>{data.name}</BreadcrumbItem>
                    )}
                </Breadcrumb>
            }
        >
            {data && (
                <CustomActionsForm
                    initialConfigurationData={
                        data as CustomActionConfigurationFormInput
                    }
                />
            )}
        </AutomateView>
    )
}
