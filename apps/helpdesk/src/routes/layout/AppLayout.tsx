import { useState } from 'react'

import { useIsMobileResolution, useWindowSize } from '@repo/hooks'
import { Handle, Panel, PanelGroup, Panels } from '@repo/layout'
import { SidebarProvider } from '@repo/navigation'

import { Box, Button, SidePanel } from '@gorgias/axiom'

import { NavigationSidebar } from 'routes/layout/NavigationSidebar'

import css from './AppLayout.less'

const expandedSidebarPanelConfig = {
    defaultSize: 240,
    minSize: 240,
    maxSize: 350,
    prioritise: true,
}

const collapsedSidebarPanelConfig = {
    defaultSize: 48,
    minSize: 48,
    maxSize: 48,
    prioritise: true,
}

const mainPanelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

type AppLayoutProps = {
    children: React.ReactNode
    hasPanel: boolean
}

export function AppLayout({ children, hasPanel }: AppLayoutProps) {
    const { width } = useWindowSize()
    const isMobileResolution = useIsMobileResolution()
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

    if (isMobileResolution) {
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
                </Panels>
            </Box>
        )
    }

    return (
        <Panels size={width}>
            <SidebarProvider>
                {({ isCollapsed }) => (
                    <Panel
                        {...(isCollapsed
                            ? {
                                  name: 'sidebar-collapsed',
                                  config: collapsedSidebarPanelConfig,
                              }
                            : {
                                  name: 'sidebar-expanded',
                                  config: expandedSidebarPanelConfig,
                              })}
                    >
                        <NavigationSidebar />
                    </Panel>
                )}
            </SidebarProvider>
            <Handle className={css.handle} />
            <PanelGroup subtractSize={10} className={css.panelGroup}>
                {hasPanel && !isMobileResolution ? (
                    children
                ) : (
                    <Panel name="main-panel" config={mainPanelConfig}>
                        {children}
                    </Panel>
                )}
            </PanelGroup>
        </Panels>
    )
}
