import type { ReactElement } from 'react'
import React, { useCallback, useMemo } from 'react'

import type { PanelConfig } from 'panels'
import { Panel, Panels } from 'panels'
import type { LayoutKeys } from 'split-ticket-view/constants'
import createInitialConfig from 'split-ticket-view/utils/createInitialConfig'
import storePanelWidths from 'split-ticket-view/utils/storePanelWidths'

export type PanelLayoutConfig = {
    key: string
    content: ReactElement
    panelConfig: PanelConfig
}

type Props = {
    config: PanelLayoutConfig[]
    fallbackComponent?: ReactElement
    fallbackWidth?: number
    layoutKey: LayoutKeys
}

export default function PanelLayout({
    config,
    fallbackComponent,
    fallbackWidth,
    layoutKey,
}: Props) {
    const panelsConfig = useMemo(
        () =>
            createInitialConfig(
                layoutKey,
                config.map((c) => c.panelConfig),
            ),
        [config, layoutKey],
    )

    const children = useMemo(
        () => config.map((c) => <Panel key={c.key}>{c.content}</Panel>),
        [config],
    )

    const handleResize = useCallback(
        (widths: number[]) => {
            storePanelWidths(layoutKey, widths)
        },
        [layoutKey],
    )

    return (
        <Panels
            config={panelsConfig}
            fallbackComponent={fallbackComponent}
            fallbackWidth={fallbackWidth}
            onResize={handleResize}
        >
            {children}
        </Panels>
    )
}
