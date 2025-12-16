import { useEffect, useState } from 'react'

import TextArea from 'pages/common/forms/TextArea'
import { HELP_CENTER_TITLE_MAX_LENGTH } from 'pages/settings/helpCenter/constants'

import css from '../KnowledgeEditorSidePanelSectionHelpCenterArticleSettings.less'

export type ExcerptInputProps = {
    excerpt: string
    onChangeExcerpt?: (excerpt: string) => void
}

export const ExcerptInput = ({
    excerpt,
    onChangeExcerpt,
}: ExcerptInputProps) => {
    const [inputValue, setInputValue] = useState<string>(excerpt)

    useEffect(() => {
        setInputValue(excerpt)
    }, [excerpt])

    const handleChange = (value: string) => {
        setInputValue(value)
        if (onChangeExcerpt) {
            onChangeExcerpt(value)
        }
    }

    return (
        <div className={css.inputContainer}>
            <TextArea
                value={inputValue}
                onChange={handleChange}
                rows={4}
                name="excerpt"
                maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                className={css.excerptInput}
                isDisabled={!onChangeExcerpt}
                label="Description"
            />
            <div className={css.caption}>
                Short summary displayed below article title.
            </div>
        </div>
    )
}
