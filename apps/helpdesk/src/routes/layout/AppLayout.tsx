import { useWindowSize } from '@repo/hooks'
import { Handle, Panel, PanelGroup, Panels } from '@repo/layout'

import { NavigationSidebar } from 'routes/layout/NavigationSidebar'

import css from './AppLayout.less'

const sidebarPanelConfig = {
    defaultSize: 238,
    minSize: 200,
    maxSize: 350,
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
            <Panel name="sidebar" config={sidebarPanelConfig}>
                <NavigationSidebar />
            </Panel>
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
