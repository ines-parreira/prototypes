import type { ComponentType, ReactNode } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import cn from 'classnames'

import { useFetchManagedDashboards } from '@repo/reporting'
import { GlobalNavigation } from 'common/navigation'
import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import { CopilotWorkspaceContainer } from 'copilot/CopilotWorkspaceContainer'
import { CollapsibleNavBarWrapper } from 'core/navigation/components/CollapsibleNavBarWrapper'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { useCopilotEnabled } from 'hooks/useCopilotEnabled'
import { CollapsibleColumn } from 'pages/CollapsibleColumn'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'
import { closePanels } from 'state/layout/actions'
import { getCurrentOpenedPanel } from 'state/layout/selectors'
import { changeTicketMessage } from 'state/ui/ticketAIAgentFeedback'

import css from './pageLayout.less'

type Props = {
    // Navbar container can be changed depending on the route. See `routes.js`
    navbar?: ComponentType<any>
    /**
     * `'default'` keeps the app-level scroll (legacy chrome owns scrolling).
     * `'panel'` hands height + scrolling to the content (an axiom Panel that
     * owns its own sticky header/footer), so every app-level scroll container
     * is disabled to avoid a nested scrollbar and a stolen sticky scroll root.
     */
    layout?: 'default' | 'panel'
    children: ReactNode
}

/**
 * The shared (legacy) application frame: app root, navigation (global nav +
 * route navbar), collapsible column, copilot workspace and the mobile backdrop.
 * Its chrome is gated behind `!hasWayfindingMS1Flag` — under wayfinding the new
 * `AppLayout` provides the shell and this collapses to the app-root + container.
 *
 * The inner content region is provided by the caller — `LegacyPage` renders the
 * old card chrome, `Page` renders a full-bleed axiom `Panel`.
 */
export function AppFrame({
    navbar: Navbar,
    layout = 'default',
    children,
}: Props) {
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const isCopilotEnabled = useCopilotEnabled()
    const dispatch = useAppDispatch()

    // Prefetch managed dashboards at the app root to avoid loading states when
    // navigating to the new analytics AI Agent dashboards.
    useFetchManagedDashboards()

    const openedPanel = useAppSelector(getCurrentOpenedPanel)
    const { onChangeTab } = useTicketInfobarNavigation()
    const { isCollapsibleColumnOpen } = useCollapsibleColumn()

    const hasOpenedPanel = !!openedPanel
    const isPanelLayout = layout === 'panel'

    const handleClosePanels = () => {
        dispatch(closePanels())
        onChangeTab(TicketInfobarTab.Customer)
        dispatch(changeTicketMessage({ message: undefined }))
    }

    return (
        <div
            id="app-root"
            className={cn(css.app, {
                [css.legacy]: !hasWayfindingMS1Flag,
                [css.appPanel]: isPanelLayout,
            })}
        >
            {!hasWayfindingMS1Flag && (
                <>
                    {showGlobalNav && <GlobalNavigation />}

                    {Navbar ? (
                        <>
                            {showGlobalNav ? (
                                <CollapsibleNavBarWrapper>
                                    <Navbar />
                                </CollapsibleNavBarWrapper>
                            ) : (
                                <Navbar />
                            )}
                        </>
                    ) : null}
                </>
            )}

            <div
                className={cn('d-flex flex-grow-1 flex-column', css.container, {
                    [css.withCollapsibleColumn]: isCollapsibleColumnOpen,
                    [css.containerPanel]: isPanelLayout,
                })}
            >
                {children}
            </div>

            {!hasWayfindingMS1Flag && <CollapsibleColumn />}
            {!hasWayfindingMS1Flag && isCopilotEnabled && (
                <CopilotWorkspaceContainer />
            )}

            <div
                className={cn(css.backdrop, {
                    [css.hidden]: !hasOpenedPanel,
                })}
                onClick={handleClosePanels}
            />
        </div>
    )
}
