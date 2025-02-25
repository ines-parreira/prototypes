import React from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import { FROALA_KEY } from 'config'
import FroalaEditorComponent from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js'

import css from './GuidanceEditor.less'

const ALLOWED_HTML_TAGS = [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'u',
    's',
    'a',
] as const

// cf https://froala.com/wysiwyg-editor/docs/options
const config = {
    key: FROALA_KEY,
    attribution: false, // Remove copyrights
    htmlAllowedTags: ALLOWED_HTML_TAGS,
    toolbarSticky: false,
    typingTimer: 150, // allows updating the model much faster
    toolbarBottom: true,
    quickInsertEnabled: false,
    toolbarButtons: [
        'bold',
        'italic',
        'underline',
        'insertLink',
        'formatUL',
        'formatOLSimple',
        'charCounter',
    ],
}

const TOOLBAR_HEIGHT = 48

type Props = {
    onChange: (value: string) => void
    placeholder?: string
    maxChars?: number
    value: string
    height?: number
    label: string
}

export const GuidanceEditor = ({
    placeholder,
    onChange,
    value,
    label,
    maxChars,
    height,
}: Props) => {
    return (
        <div>
            <Label className={css.label} isRequired>
                {label}
            </Label>

            <FroalaEditorComponent
                model={value}
                tag="textarea"
                config={{
                    ...config,
                    editorClass: css.editor,
                    placeholderText: placeholder,
                    charCounterMax: maxChars,
                    heightMin:
                        height !== undefined
                            ? height - TOOLBAR_HEIGHT
                            : undefined,
                }}
                onModelChange={onChange}
            />
        </div>
    )
}
