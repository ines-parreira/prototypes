import { useRef } from 'react'

import classNames from 'classnames'

import { CheckBoxField } from '@gorgias/axiom'

import TextArea from 'pages/common/forms/TextArea'

import { useCheckboxControlledField } from '../hooks/useCheckboxControlledField'

import css from '../KnowledgeEditorSidePanelSectionHelpCenterArticleSettings.less'

export const SeoMetaDescription = ({
    defaultDescription,
    metaDescription,
    onChangeMetaDescription,
}: {
    defaultDescription: string
    metaDescription: string
    onChangeMetaDescription?: (metaDescription: string | null) => void
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
        defaultValue: defaultDescription,
        draftValue: metaDescription,
        onCommit: onChangeMetaDescription,
        defaultChecked: true,
    })

    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    const onCheckboxChange = () => {
        const next = toggleChecked()
        if (!next) setTimeout(() => textAreaRef.current?.focus(), 0)
    }

    return (
        <div className={classNames(css.seoField, css['seoField--description'])}>
            <div className={css.seoField__checkbox}>
                <CheckBoxField
                    value={isChecked}
                    onChange={onCheckboxChange}
                    label="Use as meta description"
                />
            </div>

            {!isChecked && (
                <div className={css.seoField__content}>
                    <div className={css.seoField__controlContainer}>
                        <TextArea
                            ref={textAreaRef}
                            value={value}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows={2}
                            name="excerpt"
                            className={classNames(
                                css.seoField__control,
                                css['seoField__control--textarea'],
                            )}
                            isDisabled={isDisabled}
                            isRequired={isRequired}
                            error={
                                showError ? 'This field is required' : undefined
                            }
                            label="Meta description"
                        />

                        <span className={css.caption}>
                            Article description displayed in search engines.
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
