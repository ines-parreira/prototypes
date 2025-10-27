import { useEffect, useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'

import { LoadingSpinner } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import {
    useEvents,
    useSubscribeToEvent,
} from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
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

type ResetEventEmitterProps = {
    arePlaygroundActionsAllowed?: boolean
    resetPlayground?: boolean
    resetPlaygroundCallback?: () => void
    shopName?: string
}

const ResetEventEmitter = ({
    arePlaygroundActionsAllowed,
    resetPlayground,
    resetPlaygroundCallback,
    shopName,
}: ResetEventEmitterProps) => {
    const events = useEvents()

    const arePlaygroundActionsAllowedRef = useRef<boolean | undefined>(
        arePlaygroundActionsAllowed,
    )
    const resetPlaygroundRef = useRef<boolean | undefined>(resetPlayground)

    const { onPlaygroundReset } = usePlaygroundTracking({
        shopName: shopName || '',
    })

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
    onGuidanceClick?: (guidanceArticleId: number) => void
}

export const AiAgentPlayground = ({
    arePlaygroundActionsAllowed,
    resetPlayground,
    resetPlaygroundCallback,
    shopName: propsShopName,
    shouldDisplayResetButton = true,
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
                <ResetEventEmitter
                    arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
                    resetPlayground={resetPlayground}
                    resetPlaygroundCallback={resetPlaygroundCallback}
                    shopName={shopName}
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
