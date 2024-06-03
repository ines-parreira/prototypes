import React, {useEffect} from 'react'
import {useParams} from 'react-router-dom'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {useGetStoreWorkflowsConfigurations} from 'models/workflows/queries'
import emptyState from 'assets/img/actions/empty-state.png'
import useAppDispatch from 'hooks/useAppDispatch'
import AutomateViewEmptyStateBanner from 'pages/automate/common/components/AutomateViewEmptyStateBanner'
import {ACTIONS} from 'pages/automate/common/components/constants'

import CreateActionButton from './components/CreateActionButton'
import ActionsList from './components/ActionsList'
import {handleError} from './hooks/errorHandler'
import {ACTIONS_DESCRIPTION} from './constants'

import css from './ActionsView.less'

export default function ActionView() {
    const dispatch = useAppDispatch()

    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {data, isInitialLoading, isError, error} =
        useGetStoreWorkflowsConfigurations({
            storeName: shopName,
            storeType: shopType,
            triggers: ['llm-prompt'],
        })

    useEffect(() => {
        if (isError) {
            handleError(
                error,
                'Failed to load actions. Please try again later.',
                dispatch
            )
        }
    }, [dispatch, error, isError])

    const hasActions = (data && data.length > 0) ?? false

    return (
        <AutomateView
            title={ACTIONS}
            isLoading={isInitialLoading}
            className={css.container}
            action={<CreateActionButton />}
        >
            {hasActions && data ? (
                <div
                    data-candu-id="custom-action-view-header"
                    className={css.actionsListContainer}
                >
                    <div className={css.actionsListHeader}>
                        <span>{ACTIONS_DESCRIPTION}</span>
                    </div>
                    <ActionsList actions={data} />
                </div>
            ) : (
                <AutomateViewEmptyStateBanner
                    title="Configure Actions for AI Agent"
                    description={ACTIONS_DESCRIPTION}
                    image={emptyState}
                />
            )}
        </AutomateView>
    )
}
