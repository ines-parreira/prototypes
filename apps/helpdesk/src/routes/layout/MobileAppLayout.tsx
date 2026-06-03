import { useEffect, useState } from 'react'

import { useLocation } from 'react-router-dom'

import { Handle, Panel, PanelGroup, Panels } from '@repo/layout'
import { SidebarProvider } from '@repo/navigation'

import { Box, Button, SidePanel } from '@gorgias/axiom'

import { CopilotWorkspaceContainer } from 'copilot/CopilotWorkspaceContainer'
import { useCopilotEnabled } from 'hooks/useCopilotEnabled'
import { CollapsibleColumn } from 'pages/CollapsibleColumn'
import { usePageTopBanner } from 'pages/common/hooks/usePageTopBanner'
import { NavigationSidebar } from 'routes/layout/NavigationSidebar'

import { mainPanelConfig } from './panelConfigs'
import css from './AppLayout.less'

type MobileAppLayoutProps = {
    children: React.ReactNode
    width: number
}

export function MobileAppLayout({ children, width }: MobileAppLayoutProps) {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const isCopilotEnabled = useCopilotEnabled()
    const { pathname } = useLocation()
    const { pageTopBannerRef } = usePageTopBanner()

    useEffect(() => {
        setIsSidePanelOpen(false)
    }, [pathname])

    return (
        <Box flexDirection="column">
            <Box w="100%" p="xs">
                <Button
                    icon="menu-burger"
                    size="sm"
                    variant="tertiary"
                    onClick={() => setIsSidePanelOpen(true)}
                />
            </Box>
            <div ref={pageTopBannerRef} />
            <Panels size={width}>
                <SidebarProvider>
                    <SidePanel
                        width="90%"
                        withoutPadding
                        size="sm"
                        isOpen={isSidePanelOpen}
                        onOpenChange={setIsSidePanelOpen}
                        placement="left"
                    >
                        <NavigationSidebar />
                    </SidePanel>
                </SidebarProvider>
                <Handle className={css.handle} />
                <PanelGroup subtractSize={10} className={css.panelGroup}>
                    <Panel name="main-panel" config={mainPanelConfig}>
                        {children}
                    </Panel>
                </PanelGroup>
                <CollapsibleColumn />
                {isCopilotEnabled && <CopilotWorkspaceContainer />}
            </Panels>
        </Box>
    )
}
