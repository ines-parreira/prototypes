import Modal from 'pages/common/components/modal/Modal'

import type { Field } from '../MetafieldsTable/types'
import ImportMetafieldContent from './ImportMetafieldContent'

import styles from './ImportMetafieldFlow.less'

interface ImportMetafieldFlowProps {
    onClose: () => void
    isOpen: boolean
    importedFields?: Field[]
}

export default function ImportMetafieldFlow({
    onClose,
    isOpen,
    importedFields,
}: ImportMetafieldFlowProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="large"
            classNameContent={styles.categoriesModalContent}
        >
            <ImportMetafieldContent
                onClose={onClose}
                importedFields={importedFields}
            />
        </Modal>
    )
}
