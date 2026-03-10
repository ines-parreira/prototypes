import type { Dispatch, SetStateAction } from 'react'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    Article,
    CreateArticleDto,
    LocaleCode,
    VisibilityStatus,
} from 'models/helpCenter/types'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { HelpCenterArticleModalState } from 'pages/settings/helpCenter/components/articles/HelpCenterEditArticleModalContent/types'
import { changeViewLanguage } from 'state/ui/helpCenter'
import { getViewLanguage } from 'state/ui/helpCenter/selectors'

import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import type { ArticleTemplateKey } from '../../types/articleTemplates'

// TODO: move to redux (as UI states?)
type EditionManagerContextValues = {
    selectedCategoryId: number | null
    setSelectedCategoryId: Dispatch<SetStateAction<number | null>>

    selectedVisibility: VisibilityStatus
    setSelectedVisibility: Dispatch<SetStateAction<VisibilityStatus>>

    selectedArticleLanguage: LocaleCode
    setSelectedArticleLanguage: Dispatch<SetStateAction<LocaleCode>>

    selectedArticle: CreateArticleDto | Article | null
    setSelectedArticle: Dispatch<
        SetStateAction<CreateArticleDto | Article | null>
    >

    editModal: HelpCenterArticleModalState
    setEditModal: Dispatch<SetStateAction<HelpCenterArticleModalState>>

    isFullscreenEditModal: boolean
    setIsFullscreenEditModal: Dispatch<SetStateAction<boolean>>

    isEditorCodeViewActive: boolean
    setIsEditorCodeViewActive: Dispatch<SetStateAction<boolean>>

    selectedTemplateKey: ArticleTemplateKey | null
    setSelectedTemplateKey: Dispatch<SetStateAction<ArticleTemplateKey | null>>
}

const EditionManagerContext = createContext<null | EditionManagerContextValues>(
    null,
)

export const EditionManagerContextProvider = (props: {
    children: React.ReactNode
}): JSX.Element => {
    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()
    const viewLanguage = useAppSelector(getViewLanguage)

    // article & category states
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null,
    )
    const [selectedVisibility, setSelectedVisibility] =
        useState<VisibilityStatus>(VisibilityStatusEnum.PUBLIC)
    const [selectedArticleLanguage, setSelectedArticleLanguage] =
        useState<LocaleCode>(viewLanguage ?? helpCenter.supported_locales[0])

    const [selectedArticle, setSelectedArticle] = useState<
        CreateArticleDto | Article | null
    >(null)

    // modal states
    const [editModal, setEditModal] = useState<HelpCenterArticleModalState>({
        isOpened: false,
        view: null,
    })
    const [isFullscreenEditModal, setIsFullscreenEditModal] = useState(false)

    const [isEditorCodeViewActive, setIsEditorCodeViewActive] = useState(false)

    const [selectedTemplateKey, setSelectedTemplateKey] =
        useState<ArticleTemplateKey | null>(null)

    // Make sure to exit fullscreen mode when modal view changes
    useEffect(() => {
        if (isFullscreenEditModal) {
            setIsFullscreenEditModal(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editModal])

    useEffect(() => {
        dispatch(changeViewLanguage(selectedArticleLanguage))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedArticleLanguage])

    // change the selected article locale whenever we change of selectedArticle
    // ??: is this effect still relevant?
    useEffect(() => {
        if (selectedArticle?.translation) {
            setSelectedArticleLanguage(selectedArticle.translation.locale)
        }
    }, [selectedArticle])

    // FIXME: abstract setters/move to redux ui what is necessary
    const contextValues = {
        selectedCategoryId,
        setSelectedCategoryId,

        selectedVisibility,
        setSelectedVisibility,

        selectedArticleLanguage,
        setSelectedArticleLanguage,

        selectedArticle,
        setSelectedArticle,

        editModal,
        setEditModal,

        isFullscreenEditModal,
        setIsFullscreenEditModal,

        isEditorCodeViewActive,
        setIsEditorCodeViewActive,

        selectedTemplateKey,
        setSelectedTemplateKey,
    }

    return (
        <EditionManagerContext.Provider value={contextValues}>
            {props.children}
        </EditionManagerContext.Provider>
    )
}

export const useEditionManager = () => {
    const values = useContext(EditionManagerContext)

    if (!values) {
        throw new Error(
            `useEditionManager should be used inside the EditionManagerContextProvider context provider`,
        )
    }

    return values
}
