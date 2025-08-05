import { useState } from 'react'

import HeaderImportEmail from './HeaderImportEmail'
import CreateImportModal from './Modal/CreateImportModal'
import TableImportEmail from './Table/TableImportEmail'
import { useTableImport } from './Table/useTableImport'

const ImportEmails = () => {
    const [isCreateImportModalOpen, setIsCreateImportModalOpen] =
        useState(false)

    const { tableProps } = useTableImport()

    return (
        <div className="full-width">
            <HeaderImportEmail
                onOpenCreateImportModal={() => setIsCreateImportModalOpen(true)}
                showCta={Boolean(tableProps.importList.length)}
            />

            <TableImportEmail
                onOpenCreateImportModal={() => setIsCreateImportModalOpen(true)}
                {...tableProps}
            />

            <CreateImportModal
                isOpen={isCreateImportModalOpen}
                onClose={() => setIsCreateImportModalOpen(false)}
            />
        </div>
    )
}

export default ImportEmails
