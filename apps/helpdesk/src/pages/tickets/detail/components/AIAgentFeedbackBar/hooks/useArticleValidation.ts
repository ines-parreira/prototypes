import { useMemo } from 'react'

import _isEqual from 'lodash/isEqual'
import _omit from 'lodash/omit'

import {
    Article,
    ArticleTranslationWithRating,
    CreateArticleDto,
} from 'models/helpCenter/types'
import { articleRequiredFields } from 'pages/settings/helpCenter/utils/helpCenter.utils'

type UseArticleValidationProps = {
    selectedArticle: CreateArticleDto | Article | null
    selectedTranslation: ArticleTranslationWithRating | null
    selectedCategoryId: number | null
    isLoading: boolean
    isEditorCodeViewActive: boolean
}

type UseArticleValidationReturn = {
    canSaveArticle: boolean
    articleModified: boolean
    requiredFieldsArticle: typeof articleRequiredFields
}

export const useArticleValidation = ({
    selectedArticle,
    selectedTranslation,
    selectedCategoryId,
    isLoading,
    isEditorCodeViewActive,
}: UseArticleValidationProps): UseArticleValidationReturn => {
    return useMemo(() => {
        const currentTranslation = selectedArticle?.translation
        const requiredFieldsArticle: typeof articleRequiredFields = []

        // Omit rating as the field that can't be modified by the user
        const translationHasBeenChanged = !_isEqual(
            _omit(currentTranslation, 'rating'),
            _omit(selectedTranslation, 'rating'),
        )

        // selectedArticle?.category_id is number | undefined | null, we want to compare it to number | null
        const oldCategory = selectedArticle?.translation.category_id ?? null
        const categoryHasBeenChanged = oldCategory !== selectedCategoryId

        const articleModified =
            categoryHasBeenChanged || translationHasBeenChanged

        if (isLoading || !currentTranslation || isEditorCodeViewActive) {
            return {
                canSaveArticle: false,
                articleModified: !!selectedTranslation && articleModified,
                requiredFieldsArticle,
            }
        }

        articleRequiredFields.forEach((key) => {
            const isFieldFilled = Boolean(currentTranslation[key])
            if (!isFieldFilled) {
                requiredFieldsArticle.push(key)
            }
        })
        const hasAllRequiredFields = requiredFieldsArticle.length === 0

        if (!selectedTranslation) {
            return {
                canSaveArticle: hasAllRequiredFields,
                articleModified: false,
                requiredFieldsArticle,
            }
        }

        return {
            canSaveArticle: hasAllRequiredFields && articleModified,
            articleModified: articleModified,
            requiredFieldsArticle,
        }
    }, [
        isLoading,
        selectedArticle,
        selectedTranslation,
        selectedCategoryId,
        isEditorCodeViewActive,
    ])
}
