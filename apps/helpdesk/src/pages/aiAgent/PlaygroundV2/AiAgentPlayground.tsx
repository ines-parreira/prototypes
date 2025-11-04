import { useEffect, useRef } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'

import { LoadingSpinner } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { PlaygroundSettings } from 'pages/aiAgent/PlaygroundV2/components/PlaygroundSettings/PlaygroundSettings'
import {
    useEvents,
    useSubscribeToEvent,
} from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { PlaygroundInputSection } from './components/PlaygroundInputSection/PlaygroundInputSection'
import { PlaygroundMessageList } from './components/PlaygroundMessageList/PlaygroundMessageList'
import { PlaygroundMissingKnowledgeAlert } from './components/PlaygroundMissingKnowledgeAlert/PlaygroundMissingKnowledgeAlert'
import { PlaygroundProvider } from './contexts/PlaygroundContext'
import { usePlaygroundPrerequisites } from './hooks/usePlaygroundPrerequisites'
import { usePlaygroundResources } from './hooks/usePlaygroundResources'
import { usePlaygroundTracking } from './hooks/usePlaygroundTracking'
import { useShopNameResolution } from './hooks/useShopNameResolution'
import { PlaygroundEvent } from './types'

import css from './AiAgentPlayground.less'

type ContextConsumerProps = {
    arePlaygroundActionsAllowed?: boolean
    resetPlayground?: boolean
    resetPlaygroundCallback?: () => void
    shopName?: string
    shouldDisplaySettingsOnSidePanel: boolean
}

const ContextConsumer = ({
    arePlaygroundActionsAllowed,
    resetPlayground,
    resetPlaygroundCallback,
    shopName,
    shouldDisplaySettingsOnSidePanel,
}: ContextConsumerProps) => {
    const events = useEvents()

    const arePlaygroundActionsAllowedRef = useRef<boolean | undefined>(
        arePlaygroundActionsAllowed,
    )
    const resetPlaygroundRef = useRef<boolean | undefined>(resetPlayground)

    const { onPlaygroundReset } = usePlaygroundTracking({
        shopName: shopName || '',
    })

    const { warpToCollapsibleColumn, setCollapsibleColumnChildren } =
        useCollapsibleColumn()

    useSubscribeToEvent(PlaygroundEvent.RESET_CONVERSATION, onPlaygroundReset)

    useEffect(() => {
        if (
            arePlaygroundActionsAllowedRef.current !==
            arePlaygroundActionsAllowed
        ) {
            events.emit(PlaygroundEvent.RESET_CONVERSATION)
            arePlaygroundActionsAllowedRef.current = arePlaygroundActionsAllowed
        }
    }, [arePlaygroundActionsAllowed, events])

    useEffect(() => {
        if (shouldDisplaySettingsOnSidePanel) {
            setCollapsibleColumnChildren(null)
        }
    }, [shouldDisplaySettingsOnSidePanel, setCollapsibleColumnChildren])

    useEffect(() => {
        resetPlaygroundRef.current = resetPlayground
        if (resetPlayground) {
            events.emit(PlaygroundEvent.RESET_CONVERSATION)
            resetPlaygroundCallback?.()
        }
    }, [resetPlayground, resetPlaygroundCallback, events])

    const shouldDisplaySettings = useFlag(FeatureFlagKey.AiJourneyPlayground)

    if (shouldDisplaySettingsOnSidePanel && shouldDisplaySettings) {
        return warpToCollapsibleColumn(<PlaygroundSettings />)
    }

    return null
}

type Props = {
    arePlaygroundActionsAllowed?: boolean
    resetPlayground?: boolean
    shopName?: string
    resetPlaygroundCallback?: () => void
    shouldDisplayResetButton?: boolean
    onGuidanceClick?: (guidanceArticleId: number) => void
    shouldDisplaySettingsOnSidePanel?: boolean
}

export const AiAgentPlayground = ({
    arePlaygroundActionsAllowed,
    resetPlayground,
    resetPlaygroundCallback,
    shopName: propsShopName,
    shouldDisplayResetButton = true,
    shouldDisplaySettingsOnSidePanel = false,
    onGuidanceClick,
}: Props) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { resolvedShopName: shopNameFromIntegration } =
        useShopNameResolution(propsShopName)

    const {
        storeConfiguration,
        accountConfiguration,
        snippetHelpCenterId,
        isLoading,
        storeConfigurationNotInitialized,
    } = usePlaygroundResources({
        shopName: shopNameFromIntegration,
        accountDomain,
    })

    const shopName =
        storeConfiguration?.storeName || shopNameFromIntegration || ''

    const {
        hasPrerequisites,
        isCheckingPrerequisites,
        missingKnowledgeSource,
    } = usePlaygroundPrerequisites({
        storeConfiguration,
        snippetHelpCenterId,
    })

    const { onTestPageViewed } = usePlaygroundTracking({
        shopName,
    })

    useEffectOnce(() => {
        onTestPageViewed()
    })

    if (isLoading || isCheckingPrerequisites) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    if (!accountConfiguration || missingKnowledgeSource) {
        return <PlaygroundMissingKnowledgeAlert shopName={shopName || ''} />
    }

    if (
        hasPrerequisites &&
        !storeConfigurationNotInitialized &&
        storeConfiguration
    ) {
        return (
            <PlaygroundProvider
                arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
                shopName={shopName}
            >
                <ContextConsumer
                    arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
                    resetPlayground={resetPlayground}
                    resetPlaygroundCallback={resetPlaygroundCallback}
                    shopName={shopName}
                    shouldDisplaySettingsOnSidePanel={
                        shouldDisplaySettingsOnSidePanel
                    }
                />
                <div className={css.container}>
                    <PlaygroundMessageList onGuidanceClick={onGuidanceClick} />
                    <div className={css.inputContainer}>
                        <PlaygroundInputSection
                            shouldDisplayResetButton={shouldDisplayResetButton}
                        />
                    </div>
                </div>
            </PlaygroundProvider>
        )
    }

    return null
}
