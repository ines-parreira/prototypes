import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useEffect} from 'react'
import {useParams, Link} from 'react-router-dom'

import emptyStateTemplate from 'assets/img/actions/empty-state-template.png'
import emptyState from 'assets/img/actions/empty-state.png'
import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {ACTIONS, AI_AGENT} from 'pages/aiAgent/constants'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import AutomateViewEmptyStateBanner from 'pages/automate/common/components/AutomateViewEmptyStateBanner'

import css from './ActionsView.less'
import ActionsList from './components/ActionsList'
import ActionsTemplatesCards from './components/ActionsTemplatesCards'
import ActionsUseCaseTemplatesCards from './components/ActionsUseCaseTemplatesCards'
import BrowseAllActionsButton from './components/BrowseAllActionsButton'
import CreateCustomActionButton from './components/CreateCustomActionButton'
import {ACTIONS_DESCRIPTION} from './constants'
import {handleError} from './hooks/errorHandler'

const MAX_TEMPLATES = 7

const ActionsView = () => {
    const dispatch = useAppDispatch()

    const isMultiStepActionEnabled = useFlag(
        FeatureFlagKey.ActionsUseCaseTemplates
    )
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {
        data: storeWfConfigurations = [],
        isInitialLoading: isStoreWfConfigurationsInitialLoading,
        isError,
        error,
    } = useGetStoreWorkflowsConfigurations({
        storeName: shopName,
        storeType: shopType,
        triggers: ['llm-prompt'],
    })
    const {routes} = useAiAgentNavigation({shopName})

    const {
        data: templateConfigurations = [],
        isInitialLoading: isTemplateConfigurationsInitialLoading,
    } = useGetWorkflowConfigurationTemplates({triggers: ['llm-prompt']})

    useEffect(() => {
        if (isError) {
            handleError(
                error,
                'Failed to load actions. Please try again later.',
                dispatch
            )
        }
    }, [dispatch, error, isError])

    return (
        <AiAgentLayout
            shopName={shopName}
            isLoading={
                isStoreWfConfigurationsInitialLoading ||
                isTemplateConfigurationsInitialLoading
            }
            className={css.container}
            title={isStandaloneMenuEnabled ? ACTIONS : AI_AGENT}
        >
            {storeWfConfigurations.length > 0 ? (
                <div className={css.actionsListContainer}>
                    <div className={css.actionListDescription}>
                        <div data-candu-id="custom-action-view-header">
                            {ACTIONS_DESCRIPTION} When enabled, you can preview
                            Actions in the{' '}
                            <Link to={routes.test}>test area</Link>.
                        </div>
                        <div className={css.actionButtons}>
                            <CreateCustomActionButton />
                            <BrowseAllActionsButton />
                        </div>
                    </div>
                    <ActionsList actions={storeWfConfigurations} />
                </div>
            ) : (
                <>
                    <AutomateViewEmptyStateBanner
                        id="actions"
                        title={
                            isMultiStepActionEnabled
                                ? 'Create Actions for AI Agent to automate top customer requests with your 3rd party apps'
                                : 'Set up Actions for AI Agent to automate requests involving your 3rd party apps'
                        }
                        description={ACTIONS_DESCRIPTION}
                        image={
                            isMultiStepActionEnabled
                                ? emptyStateTemplate
                                : emptyState
                        }
                    />
                    <div className={css.templateCards}>
                        <div className={css.templateHeader}>
                            <p>
                                {isMultiStepActionEnabled
                                    ? 'Choose a template and customize it to fit your needs'
                                    : 'Choose an Action and customize it to fit your needs'}
                            </p>
                            <div className={css.actionButtons}>
                                <CreateCustomActionButton />
                                <BrowseAllActionsButton />
                            </div>
                        </div>
                        {isMultiStepActionEnabled ? (
                            <ActionsUseCaseTemplatesCards
                                templates={templateConfigurations}
                                max={MAX_TEMPLATES}
                            />
                        ) : (
                            <ActionsTemplatesCards
                                templateConfigurations={templateConfigurations}
                                max={MAX_TEMPLATES}
                            />
                        )}
                    </div>
                </>
            )}
        </AiAgentLayout>
    )
}

export default ActionsView
