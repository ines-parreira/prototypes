import { FC } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { TabNavigation } from '@gorgias/axiom'

import { ProductHeader } from 'domains/reporting/pages/voice-of-customer/components/ProductHeader'
import css from 'domains/reporting/pages/voice-of-customer/components/VoCSidePanel/VoCSidePanel.less'
import {
    INSIGHTS_LABEL,
    TREND_OVERVIEW_LABEL,
} from 'domains/reporting/pages/voice-of-customer/constants'
import { InsightsTab } from 'domains/reporting/pages/voice-of-customer/side-panel/InsightsTab/InsightsTab'
import { TrendOverviewReport } from 'domains/reporting/pages/voice-of-customer/side-panel/TrendOverviewReport/TrendOverviewReport'
import {
    closeSidePanel,
    getSidePanelActiveTab,
    getSidePanelIsOpen,
    getSidePanelProduct,
    setSidePanelActiveTab,
    SidePanelTab,
} from 'domains/reporting/state/ui/stats/sidePanelSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Drawer } from 'pages/common/components/Drawer/Drawer'

type VoCSidePanelTabsType = Record<
    SidePanelTab,
    {
        value: SidePanelTab
        label: string
        content: FC
    }
>

export const VoCSidePanelTabs: VoCSidePanelTabsType = {
    [SidePanelTab.Insights]: {
        value: SidePanelTab.Insights,
        label: INSIGHTS_LABEL,
        content: InsightsTab,
    },
    [SidePanelTab.TrendOverview]: {
        value: SidePanelTab.TrendOverview,
        label: TREND_OVERVIEW_LABEL,
        content: TrendOverviewReport,
    },
}

export const VoCSidePanel = () => {
    const dispatch = useAppDispatch()

    const isOpen = useAppSelector(getSidePanelIsOpen)
    const activeTab = useAppSelector(getSidePanelActiveTab)
    const product = useAppSelector(getSidePanelProduct)

    const closePanel = () => dispatch(closeSidePanel())
    const setActiveTab = (tab: SidePanelTab) => {
        dispatch(setSidePanelActiveTab(tab))
        logEvent(SegmentEvent.StatVoCSidePanelTabClicked, { tab })
    }

    const TabContent = VoCSidePanelTabs[activeTab].content

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
                <Drawer.HeaderActions
                    onClose={closePanel}
                    closeButtonId="close-button"
                />
            </Drawer.Header>
            <Drawer.Content className={css.content}>
                {product && (
                    <>
                        <ProductHeader product={product} />
                        <div className={css.tabContent}>
                            <TabContent />
                        </div>
                    </>
                )}
            </Drawer.Content>
        </Drawer>
    )
}
