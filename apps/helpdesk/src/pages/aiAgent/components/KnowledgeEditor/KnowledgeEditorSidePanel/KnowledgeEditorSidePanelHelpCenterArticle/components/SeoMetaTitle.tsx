import classNames from 'classnames'

import { CheckBoxField, TextField } from '@gorgias/axiom'

import { useCheckboxControlledField } from '../hooks/useCheckboxControlledField'

import css from '../KnowledgeEditorSidePanelSectionHelpCenterArticleSettings.less'

const SEO_META_TITLE_INPUT_ID = 'seo-meta-title-input'

export const SeoMetaTitle = ({
    title,
    metaTitle,
    onChangeMetaTitle,
}: {
    title: string
    metaTitle: string
    onChangeMetaTitle?: (metaTitle: string) => void
}) => {
    const {
        isChecked,
        value,
        isDisabled,
        isRequired,
        showError,
        toggleChecked,
        handleChange,
        handleBlur,
    } = useCheckboxControlledField({
        defaultValue: title,
        draftValue: metaTitle,
        onCommit: onChangeMetaTitle,
        defaultChecked: true,
    })

    const onCheckboxChange = () => {
        const next = toggleChecked()
        if (!next) {
            setTimeout(() => {
                document.getElementById(SEO_META_TITLE_INPUT_ID)?.focus()
            }, 0)
        }
    }

    return (
        <div
            className={classNames(css.seoField, css.seoFieldMetaTitleGap, {
                [css.disabled]: isChecked,
            })}
        >
            <div className={css.seoField__checkbox}>
                <CheckBoxField
                    value={isChecked}
                    onChange={onCheckboxChange}
                    label="Use current title as meta title"
                />
            </div>

            <div className={css.seoField__content}>
                <div className={css.seoField__controlContainer}>
                    <TextField
                        id={SEO_META_TITLE_INPUT_ID}
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isDisabled={isDisabled}
                        isRequired={isRequired}
                        error={showError ? 'This field is required' : undefined}
                        className={classNames(
                            css.seoField__control,
                            css['seoField__control--text'],
                        )}
                    />

                    <span className={css.caption}>
                        Your article´s title displayed in search engines
                    </span>
                </div>
            </div>
        </div>
    )
}
