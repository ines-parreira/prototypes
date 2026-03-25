import { useWindowSize } from '@repo/hooks'
import { Handle, Panel, PanelGroup, Panels } from '@repo/layout'
import { SidebarProvider } from '@repo/navigation'

import { NavigationSidebar } from 'routes/layout/NavigationSidebar'

import css from './AppLayout.less'

const expandedSidebarPanelConfig = {
    defaultSize: 240,
    minSize: 200,
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
                {hasPanel ? (
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
