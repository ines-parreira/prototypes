import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Button } from '@gorgias/axiom'

import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { TEST } from 'pages/aiAgent/constants'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { AiAgentPlayground } from './AiAgentPlayground'
import PlaygroundActionsToggle from './components/PlaygroundActionsToggle/PlaygroundActionsToggle'
import { useShopNameResolution } from './hooks/useShopNameResolution'

import css from './AiAgentPlaygroundPage.less'

export const AiAgentPlaygroundPage = () => {
    const [arePlaygroundActionsAllowed, setArePlaygroundActionsAllowed] =
        useState<boolean>(false)
    const [shouldPlaygroundReset, setShouldPlaygroundReset] =
        useState<boolean>(false)

    // Use resolved shop name from store integrations for better reliability
    const { resolvedShopName } = useShopNameResolution()

    const { setIsCollapsibleColumnOpen, isCollapsibleColumnOpen } =
        useCollapsibleColumn()

    const sidePanelEnabled = useFlag(FeatureFlagKey.AiJourneyPlayground, false)

    const isAiJourneyEnabled = useFlag(FeatureFlagKey.AiJourneyEnabled, false)

    const supportedModes = useMemo(
        () =>
            isAiJourneyEnabled
                ? ['inbound' as const, 'outbound' as const]
                : ['inbound' as const],
        [isAiJourneyEnabled],
    )

    useEffect(() => {
        if (sidePanelEnabled) {
            setIsCollapsibleColumnOpen(true)
        }
    }, [sidePanelEnabled, setIsCollapsibleColumnOpen])

    const titleChildren = sidePanelEnabled ? (
        <div className={css.actions}>
            <Button
                leadingSlot="undo"
                variant="secondary"
                onClick={() => setShouldPlaygroundReset(true)}
            >
                Reset
            </Button>
            {!isCollapsibleColumnOpen && (
                <Button
                    leadingSlot="settings"
                    onClick={() =>
                        setIsCollapsibleColumnOpen(!isCollapsibleColumnOpen)
                    }
                    aria-label="open settings"
                >
                    Configure
                </Button>
            )}
        </div>
    ) : (
        <PlaygroundActionsToggle
            value={arePlaygroundActionsAllowed}
            onChange={() =>
                setArePlaygroundActionsAllowed(!arePlaygroundActionsAllowed)
            }
        />
    )

    return (
        <AiAgentLayout
            shopName={resolvedShopName}
            className={css.container}
            title={TEST}
            titleChildren={titleChildren}
        >
            <AiAgentPlayground
                arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
                withResetButton={!sidePanelEnabled}
                withSettingsOnSidePanel
                resetPlayground={shouldPlaygroundReset}
                resetPlaygroundCallback={() => setShouldPlaygroundReset(false)}
                supportedModes={supportedModes}
            />
        </AiAgentLayout>
    )
}
