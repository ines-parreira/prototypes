import React from 'react'

import {HelpCenterArticleTranslation} from '../../../../../models/helpCenter/types'

import HelpCenterEditor from './HelpCenterEditor/HelpCenterEditor'

type Props = {
    translation: HelpCenterArticleTranslation
    onChange: (translation: HelpCenterArticleTranslation) => void
}

export const HelpCenterEditArticleForm = ({translation, onChange}: Props) => {
    const onEditArticleContent = (newValue: string) => {
        onChange({
            ...translation,
            content: newValue,
        })
    }

    return (
        <HelpCenterEditor
            articleId={translation.article_id}
            locale={translation.locale}
            value={translation.content}
            onChange={onEditArticleContent}
        />
    )
}

export default HelpCenterEditArticleForm
