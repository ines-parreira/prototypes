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
import { getCurrentUserState } from 'state/currentUser/selectors'

import { InboundContentView } from './components/PlaygroundContentView/InboundContentView'
import { OutboundContentView } from './components/PlaygroundContentView/OutboundContentView'
import { PlaygroundInputSection } from './components/PlaygroundInputSection/PlaygroundInputSection'
import { PlaygroundMissingKnowledgeAlert } from './components/PlaygroundMissingKnowledgeAlert/PlaygroundMissingKnowledgeAlert'
import { useMessagesContext } from './contexts/MessagesContext'
import { PlaygroundProvider } from './contexts/PlaygroundContext'
import { useSettingsContext } from './contexts/SettingsContext'
import { usePlaygroundPrerequisites } from './hooks/usePlaygroundPrerequisites'
import { usePlaygroundResources } from './hooks/usePlaygroundResources'
import { usePlaygroundTracking } from './hooks/usePlaygroundTracking'
import { useShopNameResolution } from './hooks/useShopNameResolution'
import { PlaygroundEvent, SupportedPlaygroundModes } from './types'

import css from './AiAgentPlayground.less'

type ContextConsumerProps = {
    arePlaygroundActionsAllowed?: boolean
    resetPlayground?: boolean
    resetPlaygroundCallback?: () => void
    shopName?: string
    withSettingsOnSidePanel: boolean
}

const ContextConsumer = ({
    arePlaygroundActionsAllowed,
    resetPlayground,
    resetPlaygroundCallback,
    shopName,
    withSettingsOnSidePanel,
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
        if (withSettingsOnSidePanel) {
            setCollapsibleColumnChildren(null)
        }
    }, [withSettingsOnSidePanel, setCollapsibleColumnChildren])

    useEffect(() => {
        resetPlaygroundRef.current = resetPlayground
        if (resetPlayground) {
            events.emit(PlaygroundEvent.RESET_CONVERSATION)
            resetPlaygroundCallback?.()
        }
    }, [resetPlayground, resetPlaygroundCallback, events])

    const shouldDisplaySettings = useFlag(FeatureFlagKey.AiJourneyPlayground)

    if (withSettingsOnSidePanel && shouldDisplaySettings) {
        return warpToCollapsibleColumn(<PlaygroundSettings />)
    }

    return null
}

type AiAgentPlaygroundContent = {
    accountId: number
    userId: number
    onGuidanceClick?: (guidanceArticleId: number) => void
    shouldDisplayReasoning?: boolean
    inplaceSettingsOpen?: boolean
    onInplaceSettingsOpenChange?: (isOpen: boolean) => void
    hasMultipleModes?: boolean
    withResetButton: boolean
    handleInplaceSettingsClose?: () => void
}

export const AiAgentPlaygroundContent = ({
    accountId,
    userId,
    onGuidanceClick,
    shouldDisplayReasoning,
    hasMultipleModes,
    withResetButton,
    inplaceSettingsOpen,
    handleInplaceSettingsClose,
}: AiAgentPlaygroundContent) => {
    const { messages } = useMessagesContext()
    const mode = useSettingsContext().mode

    return (
        <div className={css.container}>
            {inplaceSettingsOpen ? (
                <PlaygroundSettings
                    onClose={handleInplaceSettingsClose}
                    withFooter={false}
                    withModesSwitcher={hasMultipleModes}
                />
            ) : (
                <>
                    {mode === 'inbound' && (
                        <InboundContentView
                            accountId={accountId}
                            userId={userId}
                            onGuidanceClick={onGuidanceClick}
                            shouldDisplayReasoning={shouldDisplayReasoning}
                            messages={messages}
                        />
                    )}
                    {mode === 'outbound' && (
                        <OutboundContentView
                            accountId={accountId}
                            userId={userId}
                            onGuidanceClick={onGuidanceClick}
                            shouldDisplayReasoning={shouldDisplayReasoning}
                            messages={messages}
                        />
                    )}
                    <div className={css.inputContainer}>
                        <PlaygroundInputSection
                            withResetButton={withResetButton}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

type AiagentPlaygroundProps = {
    arePlaygroundActionsAllowed?: boolean
    resetPlayground?: boolean
    shopName?: string
    resetPlaygroundCallback?: () => void
    withResetButton?: boolean
    onGuidanceClick?: (guidanceArticleId: number) => void
    withSettingsOnSidePanel?: boolean
    inplaceSettingsOpen?: boolean
    onInplaceSettingsOpenChange?: (isOpen: boolean) => void
    supportedModes?: SupportedPlaygroundModes
}

export const AiAgentPlayground = ({
    arePlaygroundActionsAllowed,
    resetPlayground,
    resetPlaygroundCallback,
    shopName: propsShopName,
    withResetButton = true,
    withSettingsOnSidePanel = false,
    inplaceSettingsOpen = false,
    onGuidanceClick,
    onInplaceSettingsOpenChange,
    supportedModes,
}: AiagentPlaygroundProps) => {
    const shouldDisplayReasoning = useFlag(
        FeatureFlagKey.ShowAiReasoningInPlayground,
    )
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUserState)
    const accountId = (currentAccount.get('id') as number) ?? 0
    const userId = (currentUser.get('id') as number) ?? 0
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

    const handleInplaceSettingsClose = () => {
        onInplaceSettingsOpenChange?.(false)
    }

    const hasMultipleModes = supportedModes && supportedModes.length > 1

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
                supportedModes={supportedModes}
            >
                <ContextConsumer
                    arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
                    resetPlayground={resetPlayground}
                    resetPlaygroundCallback={resetPlaygroundCallback}
                    shopName={shopName}
                    withSettingsOnSidePanel={withSettingsOnSidePanel}
                />
                <AiAgentPlaygroundContent
                    accountId={accountId}
                    userId={userId}
                    onGuidanceClick={onGuidanceClick}
                    shouldDisplayReasoning={shouldDisplayReasoning}
                    hasMultipleModes={hasMultipleModes}
                    withResetButton={withResetButton}
                    handleInplaceSettingsClose={handleInplaceSettingsClose}
                    inplaceSettingsOpen={inplaceSettingsOpen}
                    onInplaceSettingsOpenChange={onInplaceSettingsOpenChange}
                />
            </PlaygroundProvider>
        )
    }

    return null
}
