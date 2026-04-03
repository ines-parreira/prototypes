import {
    Box,
    Button,
    PageHeader,
    TabItem,
    TabList,
    TabPanel,
    Tabs,
} from '@gorgias/axiom'

import css from './Settings.less'

enum SettingsTab {
    SenderIdentity = 'sender-identity',
    Compliance = 'compliance',
    Integrations = 'integrations',
}

export const Settings = () => {
    return (
        <Box flexDirection="column" width="100%">
            <PageHeader title="Settings">
                <Button>Save</Button>
            </PageHeader>
            <div className={css.tabsContainer}>
                <Tabs defaultSelectedItem={SettingsTab.SenderIdentity}>
                    <TabList>
                        <TabItem
                            id={SettingsTab.SenderIdentity}
                            label="Sender Identity"
                        />
                        <TabItem
                            id={SettingsTab.Compliance}
                            label="Compliance"
                        />
                        <TabItem
                            id={SettingsTab.Integrations}
                            label="Integrations"
                        />
                    </TabList>
                    <TabPanel id={SettingsTab.SenderIdentity} />
                    <TabPanel id={SettingsTab.Compliance} />
                    <TabPanel id={SettingsTab.Integrations} />
                </Tabs>
            </div>
        </Box>
    )
}
