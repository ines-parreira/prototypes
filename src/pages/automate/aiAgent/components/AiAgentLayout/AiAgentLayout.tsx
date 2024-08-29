import React, {ReactNode, useMemo} from 'react'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {AI_AGENT} from 'pages/automate/common/components/constants'
import ToggleInput from 'pages/common/forms/ToggleInput'
import useId from 'hooks/useId'
import {FeatureFlagKey} from 'config/featureFlags'
import {SegmentEvent, logEvent} from 'common/segment'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'
import css from './AiAgentLayout.less'

type Props = {
    children: ReactNode
    shopName: string
    className?: string
    title?: ReactNode
    isLoading?: boolean
}

export const AiAgentLayout = ({
    shopName,
    className,
    children,
    title,
    isLoading,
}: Props) => {
    const trialModeAvailable = useFlags()[FeatureFlagKey.AiAgentTrialMode]

    const {headerNavbarItems} = useAiAgentNavigation({shopName})

    const {
        storeConfiguration,
        isLoading: isLoadingStoreConfiguration,
        updateStoreConfiguration,
        isPendingCreateOrUpdate,
    } = useAiAgentStoreConfigurationContext()

    const globalToggleAiAgentId = `global-toggle-ai-agent-${useId()}`

    const globalToggleAction = useMemo(() => {
        if (isLoadingStoreConfiguration || storeConfiguration === undefined) {
            return undefined
        }

        if (
            trialModeAvailable ||
            storeConfiguration.trialModeActivatedDatetime !== null
        ) {
            return undefined
        }

        return (
            <ToggleInput
                isToggled={storeConfiguration.deactivatedDatetime === null}
                isDisabled={isPendingCreateOrUpdate}
                onClick={async (isEnabled: boolean) => {
                    await updateStoreConfiguration({
                        ...storeConfiguration,
                        deactivatedDatetime:
                            storeConfiguration.deactivatedDatetime === null
                                ? new Date().toISOString()
                                : null,
                    })

                    if (isEnabled) {
                        logEvent(SegmentEvent.AiAgentEnabled, {
                            store: shopName,
                        })
                    }
                }}
                name={globalToggleAiAgentId}
                dataCanduId="global-ai-agent-configuration-toggle"
            >
                Enable AI Agent
            </ToggleInput>
        )
    }, [
        isLoadingStoreConfiguration,
        storeConfiguration,
        updateStoreConfiguration,
        globalToggleAiAgentId,
        isPendingCreateOrUpdate,
        trialModeAvailable,
        shopName,
    ])

    return (
        <AutomateView
            isLoading={isLoading}
            title={title ?? AI_AGENT}
            headerNavbarItems={headerNavbarItems}
            action={globalToggleAction}
            className={classnames(css.container, className)}
        >
            {children}
        </AutomateView>
    )
}
