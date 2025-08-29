import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { LocaleCode } from 'models/helpCenter/types'
import { ConfirmationModal } from 'pages/settings/helpCenter/components/ConfirmationModal'
import {
    getPendingDeleteLocaleOptionItem,
    setPendingDeleteLocaleOptionItem,
} from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

import css from './HelpCenterArticleDeleteModal.less'

interface HelpCenterArticleDeleteModalProps {
    selectedArticleId: number
    onDeleteConfirm: (articleId: number, localeCode: LocaleCode) => void
}

export const HelpCenterArticleDeleteModal: React.FC<
    HelpCenterArticleDeleteModalProps
> = ({ selectedArticleId, onDeleteConfirm }) => {
    const dispatch = useAppDispatch()
    const pendingDeleteLocaleOptionItem = useAppSelector(
        getPendingDeleteLocaleOptionItem,
    )

    if (!pendingDeleteLocaleOptionItem) {
        return null
    }

    const optionLabel = pendingDeleteLocaleOptionItem.label

    const handleClose = () => {
        dispatch(setPendingDeleteLocaleOptionItem(undefined))
    }

    const onArticleTranslationDeletionConfirm = () => {
        onDeleteConfirm(selectedArticleId, pendingDeleteLocaleOptionItem.value)
        handleClose()
    }

    return (
        <ConfirmationModal
            isOpen={true}
            confirmText={`Delete ${pendingDeleteLocaleOptionItem.text}`}
            title={
                <span>
                    Are you sure you want to delete {optionLabel} for this
                    article?
                </span>
            }
            className={css.deleteModalContainer}
            onClose={handleClose}
            onConfirm={onArticleTranslationDeletionConfirm}
        >
            <span>
                You will lose all content saved and published of this language (
                {optionLabel}) for this article. You can’t undo this action,
                you’ll have to compose again all the content for this language
                if you decide to add it.
            </span>
        </ConfirmationModal>
    )
}
