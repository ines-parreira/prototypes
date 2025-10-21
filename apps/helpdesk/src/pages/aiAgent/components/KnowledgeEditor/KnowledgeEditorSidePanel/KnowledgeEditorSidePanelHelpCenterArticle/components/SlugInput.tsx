import { useState } from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { Icon, IconSize, NewTextField, Tooltip } from '@gorgias/axiom'

import css from '../KnowledgeEditorSidePanelSectionHelpCenterArticleSettings.less'

export type SlugInputProps = {
    slug: string
    onChangeSlug: (slug: string) => void
    articleId: number
}

export const SlugInput = ({
    slug,
    onChangeSlug,
    articleId,
}: NonNullable<SlugInputProps>) => {
    const slugTooltipId = useId()
    const [inputValue, setInputValue] = useState<string>(slug)
    const [hasError, setHasError] = useState<boolean>(false)

    const handleChange = (value: string) => {
        setInputValue(value)
        if (hasError && value.trim()) {
            setHasError(false)
        }
    }

    const handleBlur = () => {
        if (!inputValue.trim()) {
            setHasError(true)
            return
        }
        onChangeSlug(inputValue)
    }

    return (
        <>
            <div className={classNames(css.label, css.slugLabel)}>
                Slug{' '}
                <span id={`tooltip_${slugTooltipId}`} className={css.slugIcon}>
                    <Icon name="info" size={IconSize.Sm} />
                </span>
            </div>
            <div className={css.inputContainer}>
                <div className={css.slugInputWrapper}>
                    <NewTextField
                        value={inputValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={css.slugInput}
                        error={hasError ? 'This field is required' : undefined}
                        isRequired
                        trailingSlot={
                            <div className={css.trailingSlot}>
                                <span>-{articleId.toString()}</span>
                            </div>
                        }
                    />
                </div>
                <div className={css.caption}>
                    This is the article’s URL ending. Example: /returns. Use
                    lowercase letters, numbers, and hyphens only.
                </div>
            </div>
            <Tooltip target={`tooltip_${slugTooltipId}`} placement="top-start">
                The slug is the part of the URL that identifies your article.
                Example: in “yourdomain.com/help/returns-12345,” returns is the
                slug.
            </Tooltip>
        </>
    )
}
