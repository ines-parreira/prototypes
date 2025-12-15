import { useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useLocation } from 'react-router-dom'

import { TabItem, TabList, TabPanel, Tabs } from '@gorgias/axiom'

import { useFlag } from 'core/flags'

import { HeaderImport } from './HeaderImport'
import { ImportEmailTable } from './Imports/Email/ImportEmailTable'
import { useTableImport } from './Imports/Email/useTableImport'
import { ZendeskImportTable } from './Imports/Zendesk/ZendeskImportTable'
import CreateImportModal from './Modal/CreateImportModal'

const EMAIL_IMPORT = 'email-import'
const ZENDESK_IMPORT = 'zendesk-import'

const ImportEmails = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const selectedEmail = queryParams.get('selectedEmail')
    const historicalImportsEnabled = useFlag(FeatureFlagKey.HistoricalImports)
    const [isCreateImportModalOpen, setIsCreateImportModalOpen] =
        useState(!!selectedEmail)

    const { tableProps } = useTableImport()

    return (
        <div className="full-width">
            <HeaderImport
                onOpenCreateImportModal={() => setIsCreateImportModalOpen(true)}
                showCta={Boolean(tableProps.importList?.length)}
            />

            <>
                <Tabs defaultSelectedItem="overview">
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
                            onOpenCreateImportModal={() =>
                                setIsCreateImportModalOpen(true)
                            }
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

            <CreateImportModal
                selectedEmail={selectedEmail}
                isOpen={isCreateImportModalOpen}
                onClose={() => setIsCreateImportModalOpen(false)}
            />
        </div>
    )
}

export default ImportEmails
