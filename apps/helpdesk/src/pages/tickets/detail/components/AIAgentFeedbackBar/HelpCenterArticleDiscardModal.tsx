import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Article, CreateArticleDto } from 'models/helpCenter/types'
import { CloseModal } from 'pages/settings/helpCenter/components/articles/CloseModal/CloseModal'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { isExistingArticle } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {
    getPendingClose,
    setPendingClose,
} from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

import { KnowledgePendingCloseType } from './types'

interface HelpCenterArticleDiscardModalProps {
    isOpen: boolean
    createArticle: (
        article: CreateArticleDto,
        isPublished: boolean,
    ) => Promise<void>
    updateArticle: (article: Article, isPublished: boolean) => Promise<void>
    onAfterClose: () => void
}

const getTitle = (pendingCloseType: KnowledgePendingCloseType) => {
    return pendingCloseType === KnowledgePendingCloseType.Article
        ? 'Unsaved changes'
        : 'Quit without saving?'
}

const getContent = (pendingCloseType: KnowledgePendingCloseType) => {
    return pendingCloseType === KnowledgePendingCloseType.Article
        ? "Do you want to save the changes made to this article? All changes will be lost if you don't save them."
        : 'By discarding changes you will lose all progress you made editing. Are you sure you want to proceed?'
}

export const HelpCenterArticleDiscardModal: React.FC<
    HelpCenterArticleDiscardModalProps
> = ({ isOpen, createArticle, updateArticle, onAfterClose }) => {
    const dispatch = useAppDispatch()
    const pendingCloseType = useAppSelector(getPendingClose)

    const { selectedArticle, setSelectedArticle, selectedArticleLanguage } =
        useEditionManager()

    if (!pendingCloseType) {
        return null
    }

    const onClose = () => {
        dispatch(setPendingClose(null))
        onAfterClose()
    }

    const onSave = async () => {
        if (!selectedArticle) {
            return
        }

        if (isExistingArticle(selectedArticle)) {
            // TODO: If `available_locales` update is not needed, we could use `mode.onSave` instead. Only this place handles locales.

            const availableLocalesSet = new Set(
                selectedArticle.available_locales,
            )
            availableLocalesSet.add(selectedArticleLanguage)

            setSelectedArticle({
                ...selectedArticle,
                available_locales: Array.from(availableLocalesSet),
            })

            await updateArticle(selectedArticle, false)
            onClose()
            return
        }

        await createArticle(selectedArticle, false)
        dispatch(setPendingClose(null))
    }

    const onResetPendingClose = () => {
        dispatch(setPendingClose(null))
    }

    return (
        <CloseModal
            isOpen={isOpen}
            title={getTitle(pendingCloseType)}
            saveText="Save"
            discardText="Don't save"
            editText="Back to editing"
            onDiscard={onClose}
            onContinueEditing={onResetPendingClose}
            onSave={onSave}
        >
            {getContent(pendingCloseType)}
        </CloseModal>
    )
}
