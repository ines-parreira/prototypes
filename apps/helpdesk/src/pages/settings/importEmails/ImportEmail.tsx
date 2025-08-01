import { useState } from 'react'

import HeaderImportEmail from './HeaderImportEmail'
import CreateImportModal from './Modal/CreateImportModal'
import TableImportEmail from './Table/TableImportEmail'

const ImportEmails = () => {
    const [isCreateImportModalOpen, setIsCreateImportModalOpen] =
        useState(false)

    return (
        <div className="full-width">
            <HeaderImportEmail
                onOpenCreateImportModal={() => setIsCreateImportModalOpen(true)}
            />

            <TableImportEmail />

            <CreateImportModal
                isOpen={isCreateImportModalOpen}
                onClose={() => setIsCreateImportModalOpen(false)}
            />
        </div>
    )
}

export default ImportEmails
