import { useState } from 'react'

import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { TEST } from 'pages/aiAgent/constants'

import { AiAgentPlayground } from './AiAgentPlayground'
import PlaygroundActionsToggle from './components/PlaygroundActionsToggle/PlaygroundActionsToggle'
import { useShopNameResolution } from './hooks/useShopNameResolution'

import css from './AiAgentPlaygroundPage.less'

export const AiAgentPlaygroundPage = () => {
    const [arePlaygroundActionsAllowed, setArePlaygroundActionsAllowed] =
        useState<boolean>(false)

    // Use resolved shop name from store integrations for better reliability
    const { resolvedShopName } = useShopNameResolution()

    const titleChildren = (
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
            />
        </AiAgentLayout>
    )
}
