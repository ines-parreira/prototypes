import React, {
    createContext,
    useContext,
    useState,
    Dispatch,
    SetStateAction,
    useEffect,
} from 'react'
import {useSelector} from 'react-redux'

import {
    Article,
    CreateArticleDto,
    LocaleCode,
} from '../../../../../models/helpCenter/types'
import {getViewLanguage} from '../../../../../state/helpCenter/ui/selectors'
import {HelpCenterArticleModalState} from '../../components/articles/HelpCenterEditArticleModalContent/types'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'

// TODO: move to redux (as UI states?)
type EditionManagerContextValues = {
    selectedCategoryId: number | null
    setSelectedCategoryId: Dispatch<SetStateAction<number | null>>

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
}

const EditionManagerContext = createContext<null | EditionManagerContextValues>(
    null
)

export const EditionManagerContextProvider = (props: {
    children: React.ReactNode
}): JSX.Element => {
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    // article & category states
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null
    )
    const [selectedArticleLanguage, setSelectedArticleLanguage] =
        useState(viewLanguage)

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

    // Make sure to exit fullscreen mode when modal view changes
    useEffect(() => {
        if (isFullscreenEditModal) {
            setIsFullscreenEditModal(false)
        }
    }, [editModal])

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
            `useEditionManager should be used inside the EditionManagerContextProvider context provider`
        )
    }

    return values
}
