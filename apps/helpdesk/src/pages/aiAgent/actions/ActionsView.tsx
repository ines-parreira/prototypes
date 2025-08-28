import { useEffect } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Link, useParams } from 'react-router-dom'

import emptyStateTemplate from 'assets/img/actions/empty-state-template.png'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import AutomateViewEmptyStateBanner from 'pages/automate/common/components/AutomateViewEmptyStateBanner'

import ActionsList from './components/ActionsList'
import ActionsUseCaseTemplatesCards from './components/ActionsUseCaseTemplatesCards'
import BrowseAllActionsButton from './components/BrowseAllActionsButton'
import CreateCustomActionButton from './components/CreateCustomActionButton'
import {
    ACTIONS_DESCRIPTION_INTRO,
    EMPTY_STATE_BANNER_ACTIONS_DESCRIPTION,
} from './constants'
import { handleError } from './hooks/errorHandler'
import { useSupportActionTracking } from './hooks/useSupportActionTracking'
import StoreTrackstarProvider from './providers/StoreTrackstarProvider'

import css from './ActionsView.less'

const MAX_TEMPLATES = 7

const ActionsView = () => {
    const dispatch = useAppDispatch()

    const showFakeActions = useFlags()[FeatureFlagKey.FakeActionPlaceholder]

    const { shopName, shopType } = useParams<{
        shopType: string
        shopName: string
    }>()

    const { onActionPageViewed } = useSupportActionTracking({ shopName })

    useEffectOnce(() => {
        onActionPageViewed()
    })

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
    const { routes } = useAiAgentNavigation({ shopName })

    const {
        data: templateConfigurations = [],
        isInitialLoading: isTemplateConfigurationsInitialLoading,
    } = useGetWorkflowConfigurationTemplates({ triggers: ['llm-prompt'] })

    useEffect(() => {
        if (isError) {
            handleError(
                error,
                'Failed to load actions. Please try again later.',
                dispatch,
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
            title={SUPPORT_ACTIONS}
        >
            {showFakeActions || storeWfConfigurations.length > 0 ? (
                <StoreTrackstarProvider
                    storeName={shopName}
                    storeType={shopType as 'shopify'}
                >
                    <div className={css.actionsListContainer}>
                        <div className={css.actionListDescription}>
                            <div data-candu-id="custom-action-view-header">
                                {ACTIONS_DESCRIPTION_INTRO} When enabled, you
                                can preview Actions in the{' '}
                                <Link to={routes.test}>test area</Link>.
                            </div>
                            <div className={css.actionButtons}>
                                <CreateCustomActionButton />
                                <BrowseAllActionsButton />
                            </div>
                        </div>
                        <div data-candu-id="action-use-case-recommendations" />
                        <ActionsList actions={storeWfConfigurations} />
                    </div>
                </StoreTrackstarProvider>
            ) : (
                <>
                    <AutomateViewEmptyStateBanner
                        id="actions"
                        title="Create Actions for AI Agent to automate top customer requests with your 3rd party apps"
                        description={EMPTY_STATE_BANNER_ACTIONS_DESCRIPTION}
                        image={emptyStateTemplate}
                    />
                    <div className={css.templateCards}>
                        <div className={css.templateHeader}>
                            <p>
                                Choose a template and customize it to fit your
                                needs
                            </p>
                            <div className={css.actionButtons}>
                                <CreateCustomActionButton />
                                <BrowseAllActionsButton />
                            </div>
                        </div>
                        <ActionsUseCaseTemplatesCards
                            templates={templateConfigurations}
                            max={MAX_TEMPLATES}
                        />
                    </div>
                </>
            )}
        </AiAgentLayout>
    )
}

export default ActionsView
