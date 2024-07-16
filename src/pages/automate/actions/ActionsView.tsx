import React, {useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import emptyState from 'assets/img/actions/empty-state.png'
import useAppDispatch from 'hooks/useAppDispatch'
import AutomateViewEmptyStateBanner from 'pages/automate/common/components/AutomateViewEmptyStateBanner'

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
        <AiAgentLayout
            shopName={shopName}
            isLoading={
                isStoreConfigurationsInitialLoading ||
                istemplateConfigurationsInitialLoading
            }
            className={css.container}
        >
            {hasActions && storeConfigurations ? (
                <div className={css.actionsListContainer}>
                    <div className={css.actionListDescription}>
                        <div data-candu-id="custom-action-view-header">
                            {ACTIONS_DESCRIPTION}
                        </div>
                        <div className={css.actionButtons}>
                            <CreateCustomActionButton />
                            <BrowseAllActionsButton />
                        </div>
                    </div>
                    <ActionsList actions={storeConfigurations} />
                </div>
            ) : (
                <>
                    <AutomateViewEmptyStateBanner
                        id="actions"
                        title="Set up Actions for AI Agent to automate requests involving your 3rd party apps"
                        description={ACTIONS_DESCRIPTION}
                        image={emptyState}
                    />
                    {templateConfigurations &&
                        templateConfigurations?.length > 0 && (
                            <div className={css.templateCards}>
                                <div className={css.templateHeader}>
                                    <p>
                                        Choose an Action and customize it to fit
                                        your needs
                                    </p>
                                    <div className={css.actionButtons}>
                                        <CreateCustomActionButton />
                                        <BrowseAllActionsButton />
                                    </div>
                                </div>

                                <ActionsTemplatesCards
                                    templateConfigurations={
                                        templateConfigurations
                                    }
                                />
                            </div>
                        )}
                </>
            )}
        </AiAgentLayout>
    )
}
