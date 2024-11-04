import React, {useCallback, useState, useMemo} from 'react'

import PageHeader from 'pages/common/components/PageHeader'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertBundleView from 'pages/convert/bundles/components/ConvertBundleView'
import {GeneralSettingsView} from 'pages/convert/settings/components/GeneralSettingsView'

import css from './GeneralSettingsView.less'

const enum Tabs {
    GeneralSettings = 'generalSettings',
    Installation = 'installation',
}

export const ConvertSettingsView = () => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const tabs = useMemo(() => {
        const allowedTabs = [{value: Tabs.Installation, label: 'Installation'}]

        if (isConvertSubscriber) {
            allowedTabs.unshift({
                value: Tabs.GeneralSettings,
                label: 'General Settings',
            })
        }

        return allowedTabs
    }, [isConvertSubscriber])

    const [activeTab, setActiveTab] = useState(tabs[0].value)

    const renderTab = useCallback(() => {
        switch (activeTab) {
            case Tabs.GeneralSettings:
                return <GeneralSettingsView />
            case Tabs.Installation:
                return <ConvertBundleView renderHeader={false} />
        }
    }, [activeTab])

    return (
        <div className="full-width">
            <PageHeader title="Settings" />
            <TabNavigator
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(value) => setActiveTab(value as Tabs)}
                className={css.tabNavigator}
            />
            {renderTab()}
        </div>
    )
}
