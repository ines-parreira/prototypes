import { FC } from 'react'

import { TabNavigation } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Drawer } from 'pages/common/components/Drawer/Drawer'
import {
    INSIGHTS_LABEL,
    TREND_OVERVIEW_LABEL,
} from 'pages/stats/voice-of-customer/side-panel/constants'
import { InsightsTab } from 'pages/stats/voice-of-customer/side-panel/InsightsTab'
import css from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel.less'
import { ProductHeader } from 'pages/stats/voice-of-customer/TrendOverview/ProductHeader'
import { TrendOverviewReport } from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewReport'
import {
    closeSidePanel,
    getSidePanelActiveTab,
    getSidePanelIsOpen,
    getSidePanelProduct,
    setSidePanelActiveTab,
    SidePanelTab,
} from 'state/ui/stats/sidePanelSlice'

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
