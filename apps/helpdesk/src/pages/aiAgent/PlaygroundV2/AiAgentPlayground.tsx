import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'

import {
    LegacyBanner as Banner,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { PlaygroundSettings } from 'pages/aiAgent/PlaygroundV2/components/PlaygroundSettings/PlaygroundSettings'
import { SyncingSourcesMessage } from 'pages/aiAgent/PlaygroundV2/components/SyncingSourcesMessage/SyncingSourcesMessage'
import {
    useEvents,
    useSubscribeToEvent,
} from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import type { FormattedSyncingMessage } from 'pages/aiAgent/PlaygroundV2/utils/knowledgeSourcesAnalysis'
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
import type { DraftKnowledge, SupportedPlaygroundModes } from './types'
import { PlaygroundEvent } from './types'

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

    if (withSettingsOnSidePanel) {
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
    syncingMessage?: FormattedSyncingMessage | null
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
    syncingMessage,
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
                    {syncingMessage && (
                        <Banner
                            variant="inline"
                            type="info"
                            className="mb-3 justify-content-start
"
                            icon={null}
                        >
                            <SyncingSourcesMessage message={syncingMessage} />
                        </Banner>
                    )}
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
                    {(mode !== 'outbound' || messages.length > 0) && (
                        <div className={css.inputContainer}>
                            <PlaygroundInputSection
                                withResetButton={withResetButton}
                            />
                        </div>
                    )}
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
    draftKnowledge?: DraftKnowledge
}

const WrappedAiAgentPlayground = React.memo(
    ({
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
        draftKnowledge,
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
            syncingMessage,
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

        const handleInplaceSettingsClose = useCallback(() => {
            onInplaceSettingsOpenChange?.(false)
        }, [onInplaceSettingsOpenChange])

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
                    draftKnowledge={draftKnowledge}
                >
                    <ContextConsumer
                        arePlaygroundActionsAllowed={
                            arePlaygroundActionsAllowed
                        }
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
                        onInplaceSettingsOpenChange={
                            onInplaceSettingsOpenChange
                        }
                        syncingMessage={syncingMessage}
                    />
                </PlaygroundProvider>
            )
        }

        return null
    },
)

export const AiAgentPlayground = (props: AiagentPlaygroundProps) => {
    /*
    This component stabilizes object/array references passed as props to avoid unnecessary re-renders.
    The actual playground component is WrappedAiAgentPlayground (which is memoized).
    The naming was kept for compatibility.

    NOTE: Callback props (onGuidanceClick, onInplaceSettingsOpenChange, resetPlaygroundCallback)
    are NOT stabilized here because we cannot reliably do so without access to their closure metadata.
    Parents should stabilize these callbacks themselves using useCallback if re-render optimization is needed.
    */

    const { draftKnowledge, supportedModes } = props

    // Memoize draftKnowledge to avoid unnecessary re-renders
    const { sourceId, sourceSetId } = draftKnowledge || {}
    const stableDraftKnowledge = useMemo(() => {
        if (sourceId === undefined || sourceSetId === undefined)
            return undefined
        return {
            sourceId: sourceId,
            sourceSetId: sourceSetId,
        }
    }, [sourceId, sourceSetId])

    // Memoize supported modes to avoid unnecessary re-renders
    const stringifiedSupportedModes = JSON.stringify(supportedModes ?? null)
    const stableSupportedModes = useMemo(() => {
        const parsed = JSON.parse(stringifiedSupportedModes)
        return parsed ?? undefined
    }, [stringifiedSupportedModes])

    return (
        <WrappedAiAgentPlayground
            {...props}
            draftKnowledge={stableDraftKnowledge}
            supportedModes={stableSupportedModes}
        />
    )
}
