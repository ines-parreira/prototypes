import React, {useCallback, useState} from 'react'
import PageHeader from 'pages/common/components/PageHeader'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import {GeneralSettingsView} from 'pages/convert/settings/components/GeneralSettingsView'
import ConvertBundleView from 'pages/convert/bundles/components/ConvertBundleView'
import css from './GeneralSettingsView.less'

const enum Tabs {
    GeneralSettings = 'generalSettings',
    Installation = 'installation',
}

const tabs = [
    {value: Tabs.GeneralSettings, label: 'General Settings'},
    {value: Tabs.Installation, label: 'Installation'},
]

export const ConvertSettingsView = () => {
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
