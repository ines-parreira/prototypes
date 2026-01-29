import { RestoreVersionModal } from '../../shared/RestoreVersionModal/RestoreVersionModal'
import { useRestoreVersionModal } from './useRestoreVersionModal'

export const ArticleRestoreVersionModal = () => {
    const { isOpen, isRestoring, onClose, onRestore } = useRestoreVersionModal()

    return (
        <RestoreVersionModal
            isOpen={isOpen}
            isRestoring={isRestoring}
            onClose={onClose}
            onRestore={onRestore}
        />
    )
}
