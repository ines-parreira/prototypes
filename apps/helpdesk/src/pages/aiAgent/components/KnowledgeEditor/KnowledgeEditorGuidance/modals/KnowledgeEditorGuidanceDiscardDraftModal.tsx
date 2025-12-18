import { DeleteDraftModal } from '../../shared/DeleteDraftModal/DeleteDraftModal'
import { useDiscardDraftModal } from './useDiscardDraftModal'

export const KnowledgeEditorGuidanceDiscardDraftModal = () => {
    const { isOpen, isDiscarding, onClose, onDiscard } = useDiscardDraftModal()

    return (
        <DeleteDraftModal
            isOpen={isOpen}
            isDeleting={isDiscarding}
            onClose={onClose}
            onDelete={onDiscard}
        />
    )
}
