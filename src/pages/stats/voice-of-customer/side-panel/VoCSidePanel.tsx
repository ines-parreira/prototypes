import React, { useState } from 'react'

import { IconButton, TabNavigation } from '@gorgias/merchant-ui-kit'

import { Drawer } from 'pages/common/components/Drawer/Drawer'
import css from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel.less'

enum TabLabels {
    insights = 'Insights',
    trendOverview = 'Trend Overview',
}

export enum TabKeys {
    insights = 'insights',
    trendOverview = 'trendOverview',
}

type TabsType = Record<
    TabKeys,
    {
        value: TabKeys
        label: TabLabels
        icon: string
        content: () => JSX.Element
    }
>

const Tabs: TabsType = {
    [TabKeys.insights]: {
        value: TabKeys.insights,
        label: TabLabels.insights,
        icon: 'psychology',
        content: () => <div>Insights_Content</div>,
    },
    [TabKeys.trendOverview]: {
        value: TabKeys.trendOverview,
        label: TabLabels.trendOverview,
        icon: 'show_chart',
        content: () => <div>Trend_Overview_Content</div>,
    },
}

export type SidePanelProps = {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
    activeTab?: TabKeys
}

export const VoCSidePanel = ({
    isOpen,
    setIsOpen,
    activeTab: passedActiveTab = TabKeys.insights,
}: SidePanelProps) => {
    const [activeTab, setActiveTab] = useState(passedActiveTab)

    const toggleOpen = () => {
        setIsOpen(!isOpen)
    }

    return (
        <Drawer
            open={isOpen}
            portalRootId={'root'}
            isLoading={false}
            fullscreen={false}
            onBackdropClick={() => setIsOpen(false)}
            className={css.drawer}
            backdropClassName={css.backdrop}
            withFooter={false}
        >
            <Drawer.Header className={css.header}>
                <TabNavigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    className={css.tabNavigator}
                    tabs={Object.values(Tabs)}
                />
                <Drawer.HeaderActions>
                    <IconButton
                        onClick={toggleOpen}
                        fillStyle="ghost"
                        intent="secondary"
                        size="medium"
                        icon="keyboard_tab"
                    />
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content className={css.content}>
                {Tabs[activeTab].content()}
            </Drawer.Content>
        </Drawer>
    )
}
