import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import _isEmpty from 'lodash/isEmpty'
import classnames from 'classnames'

import useUpdateEffect from 'hooks/useUpdateEffect'

import css from './TabNavigator.less'

type TabData = {value: string; label: string}

type TabNavigatorProps = {
    tabs: TabData[]
    activeTab: string
    onTabChange: (tab: string) => void
    className?: string
}

type TabDimension = {
    x: number
    width: number
}

const TabNavigator = ({
    tabs,
    activeTab,
    onTabChange,
    className,
}: TabNavigatorProps) => {
    const tabNavigatorRef = useRef<HTMLDivElement>(null)
    const activeTabIndex = useMemo(
        () => tabs.findIndex((t) => t.value === activeTab),
        [activeTab, tabs]
    )

    const [tabDimensions, setTabDimensions] = useState<TabDimension[] | null>(
        null
    )

    const setupTabs = useCallback(async () => {
        await window.document.fonts.ready
        const tabCollection = tabNavigatorRef?.current?.children
        const tabs = Array.from(tabCollection || []) as HTMLElement[]
        const tabDimensions = tabs.map((tab) => {
            const {offsetLeft, offsetWidth} = tab
            const tabStyle = getComputedStyle(tab)
            return {
                x: offsetLeft + parseFloat(tabStyle.paddingLeft) || 0,
                width:
                    offsetWidth -
                        parseFloat(tabStyle.paddingLeft) -
                        parseFloat(tabStyle.paddingRight) || 0,
            }
        })
        setTabDimensions(tabDimensions)
    }, [])

    useEffect(() => {
        void setupTabs()
    }, [tabs, setupTabs])

    useUpdateEffect(() => {
        const tabCollection = tabNavigatorRef?.current?.children
        tabCollection
            ?.item(activeTabIndex)
            ?.scrollIntoView({behavior: 'smooth'})
    }, [activeTabIndex])

    return (
        <div className={classnames(css.container, className)}>
            <div className={css.tabContainer} ref={tabNavigatorRef}>
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        tabIndex={0}
                        className={classnames(css.tab, {
                            [css.activeTab]: tab.value === activeTab,
                            ['activeTab']: tab.value === activeTab,
                        })}
                        onFocus={() => {
                            onTabChange(tab.value)
                        }}
                        role="tab"
                    >
                        <span className={css.tabLabel}>{tab.label}</span>
                    </div>
                ))}
            </div>
            {activeTab != null && !_isEmpty(tabs) && tabDimensions && (
                <div
                    className={css.activeIndicator}
                    style={{
                        width: tabDimensions[activeTabIndex].width,
                        left: tabDimensions[activeTabIndex].x,
                    }}
                />
            )}
        </div>
    )
}

export default TabNavigator
