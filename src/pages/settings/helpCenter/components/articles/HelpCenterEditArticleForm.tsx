import React, {useCallback} from 'react'

import {
    CreateArticleTranslationDto,
    LocalArticleTranslation,
} from '../../../../../models/helpCenter/types'

import HelpCenterEditor from './HelpCenterEditor/HelpCenterEditor'

type Props = {
    translation: LocalArticleTranslation | CreateArticleTranslationDto
    onChange: (
        translation: LocalArticleTranslation | CreateArticleTranslationDto,
        extra?: {wordCount: number; charCount: number}
    ) => void
}

export const HelpCenterEditArticleForm: React.FC<Props> = ({
    translation,
    onChange,
}: Props) => {
    const articleId =
        'article_id' in translation ? translation.article_id : undefined

    const onEditArticleContent = useCallback(
        (newValue: string) => {
            onChange({
                ...translation,
                content: newValue,
            })
        },
        [onChange]
    )

    return (
        <HelpCenterEditor
            articleId={articleId}
            locale={translation.locale}
            value={translation.content}
            onChange={onEditArticleContent}
        />
    )
}

export default HelpCenterEditArticleForm
