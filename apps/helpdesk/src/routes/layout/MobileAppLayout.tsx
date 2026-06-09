import { useEffect, useState } from 'react'

import { useLocation } from 'react-router-dom'

import {
    Handle,
    PanelGroup,
    Panels,
    Panel as ResizablePanel,
} from '@repo/layout'
import { SidebarProvider } from '@repo/navigation'

import { Box, Button, Panel, PanelHeader, SidePanel } from '@gorgias/axiom'

import { CopilotWorkspaceContainer } from 'copilot/CopilotWorkspaceContainer'
import { useCopilotEnabled } from 'hooks/useCopilotEnabled'
import { CollapsibleColumn } from 'pages/CollapsibleColumn'
import { NavigationSidebar } from 'routes/layout/NavigationSidebar'

import { MobileHeaderActions } from './MobileHeaderActions'

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

    useEffect(() => {
        setIsSidePanelOpen(false)
    }, [pathname])

    return (
        <Panel elevation="background" height="100dvh">
            <PanelHeader
                px="xs"
                pt={0}
                pb={0}
                title={
                    <Box
                        alignItems="center"
                        gap="xs"
                        w="100%"
                        justifyContent="space-between"
                    >
                        <Button
                            icon="menu-burger"
                            size="sm"
                            variant="tertiary"
                            onClick={() => setIsSidePanelOpen(true)}
                        />
                        <MobileHeaderActions />
                    </Box>
                }
                isSticky
            />
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
                <PanelGroup className={css.panelGroup}>
                    <ResizablePanel name="main-panel" config={mainPanelConfig}>
                        {children}
                    </ResizablePanel>
                </PanelGroup>
                <CollapsibleColumn />
                {isCopilotEnabled && <CopilotWorkspaceContainer />}
            </Panels>
        </Panel>
    )
}
