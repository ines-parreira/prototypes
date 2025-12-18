import { useState } from 'react'
import type { Key } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocation } from 'react-router-dom'

import { TabItem, TabList, TabPanel, Tabs } from '@gorgias/axiom'

import { HeaderImport } from './HeaderImport'
import { ImportEmailTable } from './Imports/Email/ImportEmailTable'
import { useTableImport } from './Imports/Email/useTableImport'
import { ZendeskImportTable } from './Imports/Zendesk/ZendeskImportTable'
import { EmailImportModalWizard } from './Modal/EmailImportModalWizard'
import { ZendeskImportModalWizard } from './Modal/ZendeskImportModalWizard'

const EMAIL_IMPORT = 'email-import'
const ZENDESK_IMPORT = 'zendesk-import'

const ImportEmails = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const selectedEmail = queryParams.get('selectedEmail')
    const historicalImportsEnabled = useFlag(FeatureFlagKey.HistoricalImports)
    const [isCreateImportModalOpen, setIsCreateImportModalOpen] =
        useState(!!selectedEmail)
    const [isZendeskImportModalOpen, setIsZendeskImportModalOpen] =
        useState(false)

    const [activeTab, setActiveTab] = useState<Key>(EMAIL_IMPORT)

    const { tableProps } = useTableImport()

    const openImportModal = () => {
        // get active TabItem
        // based on it trigger the action
        if (activeTab === EMAIL_IMPORT) {
            setIsCreateImportModalOpen(true)
        } else {
            setIsZendeskImportModalOpen(true)
        }
    }

    return (
        <div className="full-width">
            <HeaderImport
                onOpenCreateImportModal={openImportModal}
                showCta={Boolean(tableProps.importList?.length)}
            />

            <>
                <Tabs
                    defaultSelectedItem="overview"
                    onSelectionChange={(val: Key) => setActiveTab(val)}
                >
                    <TabList>
                        <TabItem id={EMAIL_IMPORT} label="Email Import" />
                        {historicalImportsEnabled && (
                            <TabItem
                                id={ZENDESK_IMPORT}
                                label="Zendesk Import"
                            />
                        )}
                    </TabList>

                    <TabPanel id={EMAIL_IMPORT}>
                        <ImportEmailTable
                            onOpenCreateImportModal={openImportModal}
                            {...tableProps}
                        />
                    </TabPanel>
                    {historicalImportsEnabled && (
                        <TabPanel id={ZENDESK_IMPORT}>
                            <ZendeskImportTable />
                        </TabPanel>
                    )}
                </Tabs>
            </>

            {isCreateImportModalOpen && (
                <EmailImportModalWizard
                    selectedEmail={selectedEmail}
                    isOpen={isCreateImportModalOpen}
                    onClose={() => setIsCreateImportModalOpen(false)}
                />
            )}

            {isZendeskImportModalOpen && (
                <ZendeskImportModalWizard
                    onClose={() => setIsZendeskImportModalOpen(false)}
                />
            )}
        </div>
    )
}

export default ImportEmails
