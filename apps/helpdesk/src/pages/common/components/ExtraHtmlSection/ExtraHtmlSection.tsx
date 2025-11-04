import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { ExtraHTMLDto } from 'models/helpCenter/types'

import CodeEditor from '../CodeEditor/CodeEditor'

import css from './ExtraHtmlSection.less'

export type ContactFormExtraHTML = {
    extra_head: string
    extra_head_deactivated: boolean
}

type ExtraHTML = ExtraHTMLDto | ContactFormExtraHTML

interface ExtraHtmlSectionProps<T extends ExtraHTML> {
    extraHTML: T | null
    isExtraHtmlToggled: boolean
    setIsDirty: (isDirty: boolean) => void
    setExtraHTML: (updater: (prev: T | null) => T | null) => void
}

export const ExtraHtmlSection = <T extends ExtraHTML>({
    extraHTML,
    isExtraHtmlToggled,
    setIsDirty,
    setExtraHTML,
}: ExtraHtmlSectionProps<T>) => {
    return (
        <section>
            <div className={css.heading}>
                <h3>Extra HTML</h3>
                <p>
                    Add extra HTML in the{' '}
                    <a
                        href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML"
                        rel="noreferrer"
                        target="_blank"
                    >
                        head section
                    </a>
                    .
                </p>
            </div>
            <div>
                <ToggleField
                    value={isExtraHtmlToggled}
                    onChange={(value: boolean) => {
                        setIsDirty(true)
                        setExtraHTML(
                            (extraHTML) =>
                                extraHTML && {
                                    ...extraHTML,
                                    extra_head_deactivated: !value,
                                },
                        )
                    }}
                    className={css.toggle}
                    label="Add extra HTML"
                />
            </div>
            {isExtraHtmlToggled && (
                <CodeEditor
                    value={extraHTML?.extra_head}
                    onChange={(value) => {
                        setIsDirty(value !== extraHTML?.extra_head)
                        setExtraHTML(
                            (extraHTML) =>
                                extraHTML && {
                                    ...extraHTML,
                                    extra_head: value,
                                },
                        )
                    }}
                    mode="html"
                    highlightActiveLine={true}
                    width="auto"
                    height="200px"
                />
            )}
        </section>
    )
}
