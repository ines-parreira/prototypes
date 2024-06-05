import React, {useEffect} from 'react'
import {useParams} from 'react-router-dom'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import emptyState from 'assets/img/actions/empty-state.png'
import useAppDispatch from 'hooks/useAppDispatch'
import AutomateViewEmptyStateBanner from 'pages/automate/common/components/AutomateViewEmptyStateBanner'
import {ACTIONS} from 'pages/automate/common/components/constants'

import ActionsTemplatesCards from './components/ActionsTemplatesCards'
import CreateCustomActionButton from './components/CreateCustomActionButton'
import BrowseAllActionsButton from './components/BrowseAllActionsButton'
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
    const {
        data: storeConfigurations,
        isInitialLoading: isStoreConfigurationsInitialLoading,
        isError,
        error,
    } = useGetStoreWorkflowsConfigurations({
        storeName: shopName,
        storeType: shopType,
        triggers: ['llm-prompt'],
    })

    const {
        data: templateConfigurations,
        isInitialLoading: istemplateConfigurationsInitialLoading,
    } = useGetWorkflowConfigurationTemplates(['llm-prompt'])

    useEffect(() => {
        if (isError) {
            handleError(
                error,
                'Failed to load actions. Please try again later.',
                dispatch
            )
        }
    }, [dispatch, error, isError])

    const hasActions =
        (storeConfigurations && storeConfigurations.length > 0) ?? false

    return (
        <AutomateView
            title={ACTIONS}
            isLoading={
                isStoreConfigurationsInitialLoading ||
                istemplateConfigurationsInitialLoading
            }
            className={css.container}
            action={
                <div className={css.actionButtons}>
                    <CreateCustomActionButton />
                    <BrowseAllActionsButton />
                </div>
            }
        >
            {hasActions && storeConfigurations ? (
                <div
                    data-candu-id="custom-action-view-header"
                    className={css.actionsListContainer}
                >
                    <div className={css.actionsListHeader}>
                        <span>{ACTIONS_DESCRIPTION}</span>
                    </div>
                    <ActionsList actions={storeConfigurations} />
                </div>
            ) : (
                <>
                    <AutomateViewEmptyStateBanner
                        title="Configure Actions for AI Agent"
                        description={ACTIONS_DESCRIPTION}
                        image={emptyState}
                    />

                    {templateConfigurations &&
                        templateConfigurations?.length > 0 && (
                            <div className={css.templateCards}>
                                <p>
                                    Choose an Action and customize it to fit
                                    your needs
                                </p>
                                <ActionsTemplatesCards
                                    templateConfigurations={
                                        templateConfigurations
                                    }
                                />
                            </div>
                        )}
                </>
            )}
        </AutomateView>
    )
}
