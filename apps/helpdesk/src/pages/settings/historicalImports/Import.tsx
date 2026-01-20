import { useEffect, useState } from 'react'
import type { Key } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory, useLocation } from 'react-router-dom'

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
    const history = useHistory()
    const queryParams = new URLSearchParams(location.search)
    const selectedEmail = queryParams.get('selectedEmail')
    const activeTabParam = queryParams.get('activeTab')
    const historicalImportsEnabled = useFlag(FeatureFlagKey.HistoricalImports)
    const [isCreateImportModalOpen, setIsCreateImportModalOpen] =
        useState(!!selectedEmail)
    const [isZendeskImportModalOpen, setIsZendeskImportModalOpen] =
        useState(false)

    const getInitialTab = () => {
        if (activeTabParam === 'import-zendesk') {
            return ZENDESK_IMPORT
        }
        return EMAIL_IMPORT
    }

    const [activeTab, setActiveTab] = useState(getInitialTab())

    const { tableProps } = useTableImport()

    useEffect(() => {
        const params = new URLSearchParams(location.search)

        const tabParam =
            activeTab === EMAIL_IMPORT ? 'import-email' : 'import-zendesk'
        params.set('activeTab', tabParam)
        history.replace({ search: params.toString() })
    }, [activeTab, history, location.search])

    const openImportModal = () => {
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
                    selectedItem={activeTab}
                    onSelectionChange={(val: Key) =>
                        setActiveTab(val as string)
                    }
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
                            <ZendeskImportTable
                                onOpenCreateImportModal={openImportModal}
                            />
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
