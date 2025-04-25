import React from 'react'

import { IconButton, TabNavigation } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Drawer } from 'pages/common/components/Drawer/Drawer'
import css from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel.less'
import {
    closeSidePanel,
    getSidePanelActiveTab,
    getSidePanelIsOpen,
    setSidePanelActiveTab,
    SidePanelTab,
} from 'state/ui/stats/sidePanelSlice'

type VoCSidePanelTabsType = Record<
    SidePanelTab,
    {
        value: SidePanelTab
        label: string
        icon: string
        content: () => JSX.Element
    }
>

export const VoCSidePanelTabs: VoCSidePanelTabsType = {
    insights: {
        value: SidePanelTab.insights,
        label: 'Insights',
        icon: 'psychology',
        content: () => <div>Insights_Content</div>,
    },
    trendOverview: {
        value: SidePanelTab.trendOverview,
        label: 'Trend Overview',
        icon: 'show_chart',
        content: () => <div>Trend_Overview_Content</div>,
    },
}

export type SidePanelProps = {
    setIsOpen: (value: boolean) => void
    activeTab?: SidePanelTab
}

export const VoCSidePanel = () => {
    const dispatch = useAppDispatch()

    const isOpen = useAppSelector(getSidePanelIsOpen)
    const activeTab = useAppSelector(getSidePanelActiveTab)

    const closePanel = () => dispatch(closeSidePanel())
    const setActiveTab = (tab: SidePanelTab) =>
        dispatch(setSidePanelActiveTab(tab))

    return (
        <Drawer
            open={isOpen}
            portalRootId={'root'}
            isLoading={false}
            fullscreen={false}
            onBackdropClick={closePanel}
            className={css.drawer}
            rootClassName={css.rootDrawer}
            withFooter={false}
        >
            <Drawer.Header className={css.header}>
                <TabNavigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    className={css.tabNavigator}
                    tabs={Object.values(VoCSidePanelTabs)}
                />
                <Drawer.HeaderActions>
                    <IconButton
                        onClick={closePanel}
                        fillStyle="ghost"
                        intent="secondary"
                        size="medium"
                        icon="keyboard_tab"
                    />
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content className={css.content}>
                {VoCSidePanelTabs[activeTab].content()}
            </Drawer.Content>
        </Drawer>
    )
}
