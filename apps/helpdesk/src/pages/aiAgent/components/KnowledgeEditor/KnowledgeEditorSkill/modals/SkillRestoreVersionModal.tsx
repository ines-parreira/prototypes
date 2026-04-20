import { RestoreVersionModal } from '../../shared/RestoreVersionModal/RestoreVersionModal'
import { useSkillRestoreVersionModal } from './useSkillRestoreVersionModal'

export const SkillRestoreVersionModal = () => {
    const { isOpen, isRestoring, onClose, onRestore } =
        useSkillRestoreVersionModal()

    return (
        <RestoreVersionModal
            isOpen={isOpen}
            isRestoring={isRestoring}
            onClose={onClose}
            onRestore={onRestore}
        />
    )
}
