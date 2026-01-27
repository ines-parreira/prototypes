import { PublishConfirmationModal } from '../../shared/PublishConfirmationModal/PublishConfirmationModal'
import { usePublishModal } from './usePublishModal'

export const KnowledgeEditorGuidancePublishModal = () => {
    const { isOpen, isPublishing, onClose, onPublish } = usePublishModal()

    return (
        <PublishConfirmationModal
            isOpen={isOpen}
            isPublishing={isPublishing}
            onClose={onClose}
            onPublish={onPublish}
        />
    )
}
