import React from 'react'

import { Handle, Panel } from 'core/layout/panels'
import OnboardingSidePanel from 'pages/tickets/list/OnboardingSidePanel'

import useIsOnboardingHidden from '../hooks/useIsOnboardingHidden'

const panelConfig = {
    defaultSize: 340,
    minSize: 340,
    maxSize: 0.33,
}

export function OnboardingPanel() {
    const [isHidden, onHide] = useIsOnboardingHidden()
    if (isHidden) return null

    return (
        <>
            <Handle />
            <Panel name="infobar" config={panelConfig}>
                <OnboardingSidePanel
                    isOnNewLayout
                    isHidden={isHidden}
                    onHide={onHide}
                />
            </Panel>
        </>
    )
}
