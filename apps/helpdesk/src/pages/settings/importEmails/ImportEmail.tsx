import { useState } from 'react'

import { useLocation } from 'react-router-dom'

import HeaderImportEmail from './HeaderImportEmail'
import CreateImportModal from './Modal/CreateImportModal'
import TableImportEmail from './Table/TableImportEmail'
import { useTableImport } from './Table/useTableImport'

const ImportEmails = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const selectedEmail = queryParams.get('selectedEmail')

    const [isCreateImportModalOpen, setIsCreateImportModalOpen] =
        useState(!!selectedEmail)

    const { tableProps } = useTableImport()

    return (
        <div className="full-width">
            <HeaderImportEmail
                onOpenCreateImportModal={() => setIsCreateImportModalOpen(true)}
                showCta={Boolean(tableProps.importList?.length)}
            />

            <TableImportEmail
                onOpenCreateImportModal={() => setIsCreateImportModalOpen(true)}
                {...tableProps}
            />

            <CreateImportModal
                selectedEmail={selectedEmail}
                isOpen={isCreateImportModalOpen}
                onClose={() => setIsCreateImportModalOpen(false)}
            />
        </div>
    )
}

export default ImportEmails
