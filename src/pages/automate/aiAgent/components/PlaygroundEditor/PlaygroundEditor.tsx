import React from 'react'
import FroalaEditorComponent from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js'
import {FROALA_KEY} from 'config'

import css from './PlaygroundEditor.less'

// cf https://froala.com/wysiwyg-editor/docs/options
const config = {
    key: FROALA_KEY,
    attribution: false, // Remove copyrights
    toolbarSticky: false,
    typingTimer: 150, // allows updating the model much faster
    toolbarBottom: true,
    quickInsertEnabled: false,
    charCounterCount: false,
    toolbarButtons: [
        'bld',
        'italic',
        'underline',
        'insertLink',
        'formatUL',
        'formatOLSimple',
        'emoticons',
    ],
}

type Props = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export const PlaygroundEditor = ({value, placeholder, onChange}: Props) => {
    return (
        <FroalaEditorComponent
            model={value}
            tag="textarea"
            config={{
                ...config,
                editorClass: css.editor,
                placeholderText: placeholder,
            }}
            onModelChange={onChange}
        />
    )
}
