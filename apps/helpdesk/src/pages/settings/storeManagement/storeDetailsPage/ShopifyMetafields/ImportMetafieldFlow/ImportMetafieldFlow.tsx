import { logEvent, SegmentEvent } from '@repo/logging'

import useAppSelector from 'hooks/useAppSelector'
import Modal from 'pages/common/components/modal/Modal'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

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
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)

    const logEventAndOnClose = () => {
        logEvent(SegmentEvent.ShopifyMetafieldsCloseImportModal, {
            accountId,
            userId,
        })
        onClose()
    }
    return (
        <Modal
            isOpen={isOpen}
            onClose={logEventAndOnClose}
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
