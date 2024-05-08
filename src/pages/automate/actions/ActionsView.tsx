import React, {useEffect} from 'react'
import {useParams} from 'react-router-dom'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {useGetStoreWorkflowsConfigurations} from 'models/workflows/queries'

import useAppDispatch from 'hooks/useAppDispatch'
import {ACTIONS} from '../common/components/constants'
import ActionsInfoLinks from './components/ActionsInfoLinks'
import ActionsEmptyState from './components/ActionsEmptyState'
import CreateActionButton from './components/CreateActionButton'
import ActionsList from './components/ActionsList'
import {handleError} from './hooks/errorHandler'
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
            action={hasActions ? <CreateActionButton /> : null}
        >
            {hasActions && data ? (
                <div className={css.actionsListContainer}>
                    <div className={css.actionsListHeader}>
                        <span>
                            Actions enable AI Agent to perform tasks with your
                            3rd party apps such as create return label, cancel
                            order, get order status, issue refund and more.
                        </span>
                        <ActionsInfoLinks />
                    </div>
                    <ActionsList actions={data} />
                </div>
            ) : (
                <ActionsEmptyState />
            )}
        </AutomateView>
    )
}
