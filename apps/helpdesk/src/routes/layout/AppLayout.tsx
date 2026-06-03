import { useIsMobileResolution, useWindowSize } from '@repo/hooks'
import { Handle, Panel, PanelGroup, Panels } from '@repo/layout'
import { SidebarProvider } from '@repo/navigation'

import { CopilotWorkspaceContainer } from 'copilot/CopilotWorkspaceContainer'
import { useCopilotEnabled } from 'hooks/useCopilotEnabled'
import { CollapsibleColumn } from 'pages/CollapsibleColumn'
import { usePageTopBanner } from 'pages/common/hooks/usePageTopBanner'
import { NavigationSidebar } from 'routes/layout/NavigationSidebar'

import { MobileAppLayout } from './MobileAppLayout'
import {
    collapsedSidebarPanelConfig,
    expandedSidebarPanelConfig,
    mainPanelConfig,
} from './panelConfigs'
import css from './AppLayout.less'

type AppLayoutProps = {
    children: React.ReactNode
    hasPanel: boolean
}

export function AppLayout({ children, hasPanel }: AppLayoutProps) {
    const { width } = useWindowSize()
    const isMobileResolution = useIsMobileResolution()
    const isCopilotEnabled = useCopilotEnabled()
    const { pageTopBannerRef } = usePageTopBanner()

    if (isMobileResolution) {
        return <MobileAppLayout width={width}>{children}</MobileAppLayout>
    }

    return (
        <Panels size={width}>
            <SidebarProvider>
                {({ isCollapsed }) => (
                    <>
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
                        <Handle className={css.handle} />
                        <div className={css.mainColumn}>
                            <div ref={pageTopBannerRef} />
                            <div className={css.mainRow}>
                                <PanelGroup
                                    subtractSize={10}
                                    className={css.panelGroup}
                                >
                                    {hasPanel ? (
                                        children
                                    ) : (
                                        <Panel
                                            name="main-panel"
                                            config={mainPanelConfig}
                                        >
                                            {children}
                                        </Panel>
                                    )}
                                </PanelGroup>
                                <CollapsibleColumn />
                            </div>
                        </div>
                        {isCopilotEnabled && <CopilotWorkspaceContainer />}
                    </>
                )}
            </SidebarProvider>
        </Panels>
    )
}
