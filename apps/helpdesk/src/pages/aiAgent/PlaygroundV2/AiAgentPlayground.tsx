import { useEffect, useMemo, useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'

import { LoadingSpinner } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { PlaygroundInputSection } from './components/PlaygroundInputSection/PlaygroundInputSection'
import { PlaygroundMessageList } from './components/PlaygroundMessageList/PlaygroundMessageList'
import { PlaygroundMissingKnowledgeAlert } from './components/PlaygroundMissingKnowledgeAlert/PlaygroundMissingKnowledgeAlert'
import {
    PlaygroundProvider,
    usePlaygroundContext,
} from './contexts/PlaygroundContext'
import { useAiAgentHttpIntegration } from './hooks/useAiAgentHttpIntegration'
import { usePlaygroundPrerequisites } from './hooks/usePlaygroundPrerequisites'
import { usePlaygroundResources } from './hooks/usePlaygroundResources'
import { usePlaygroundTracking } from './hooks/usePlaygroundTracking'
import { useShopNameResolution } from './hooks/useShopNameResolution'
import { PlaygroundEvent } from './types'

import css from './AiAgentPlayground.less'

type ResetEventEmitterProps = {
    arePlaygroundActionsAllowed?: boolean
    resetPlayground?: boolean
    resetPlaygroundCallback?: () => void
}

const ResetEventEmitter = ({
    arePlaygroundActionsAllowed,
    resetPlayground,
    resetPlaygroundCallback,
}: ResetEventEmitterProps) => {
    const { events } = usePlaygroundContext()
    const arePlaygroundActionsAllowedRef = useRef<boolean | undefined>(
        arePlaygroundActionsAllowed,
    )
    const resetPlaygroundRef = useRef<boolean | undefined>(resetPlayground)

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
        resetPlaygroundRef.current = resetPlayground
        if (resetPlayground) {
            events.emit(PlaygroundEvent.RESET_CONVERSATION)
            resetPlaygroundCallback?.()
        }
    }, [resetPlayground, resetPlaygroundCallback, events])

    return null
}

type Props = {
    arePlaygroundActionsAllowed?: boolean
    resetPlayground?: boolean
    shopName?: string
    resetPlaygroundCallback?: () => void
    shouldDisplayResetButton?: boolean
}

export const AiAgentPlayground = ({
    arePlaygroundActionsAllowed,
    resetPlayground,
    resetPlaygroundCallback,
    shopName: propsShopName,
    shouldDisplayResetButton = true,
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

    const { httpIntegrationId, baseUrl } = useAiAgentHttpIntegration()

    const initializedHttpIntegrationId =
        httpIntegrationId || accountConfiguration?.httpIntegration?.id || 0
    const gorgiasDomain = accountConfiguration?.gorgiasDomain || ''
    const accountId = accountConfiguration?.accountId || 0
    const chatIntegrationId = storeConfiguration?.monitoredChatIntegrations?.[0]

    const playgroundContextValue = useMemo(
        () => ({
            storeConfiguration,
            snippetHelpCenterId,
            httpIntegrationId: initializedHttpIntegrationId,
            baseUrl,
            gorgiasDomain,
            accountId,
            chatIntegrationId,
        }),
        [
            storeConfiguration,
            snippetHelpCenterId,
            initializedHttpIntegrationId,
            baseUrl,
            gorgiasDomain,
            accountId,
            chatIntegrationId,
        ],
    )

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
                value={playgroundContextValue}
                arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
            >
                <ResetEventEmitter
                    arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
                    resetPlayground={resetPlayground}
                    resetPlaygroundCallback={resetPlaygroundCallback}
                />
                <div className={css.container}>
                    <PlaygroundMessageList />
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
