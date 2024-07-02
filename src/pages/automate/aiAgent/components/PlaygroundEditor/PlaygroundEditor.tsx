import React from 'react'
import FroalaEditorComponent from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js'
import {FROALA_KEY} from 'config'

import {PlaygroundPredefinedMessages} from '../PlaygroundPredefinedMessages/PlaygroundPredefinedMessages'
import css from './PlaygroundEditor.less'

const TOOLBAR_CONTAINER_ID = 'froalaToolbarContainer'

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
    toolbarContainer: `#${TOOLBAR_CONTAINER_ID}`,
}

type Props = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    enablePredefinedMessages?: boolean
}

export const PlaygroundEditor = ({
    value,
    placeholder,
    onChange,
    enablePredefinedMessages,
}: Props) => {
    return (
        <div className={css.editor}>
            <FroalaEditorComponent
                model={value}
                tag="textarea"
                config={{
                    ...config,
                    placeholderText: placeholder,
                }}
                onModelChange={onChange}
            />
            {!value && enablePredefinedMessages && (
                <PlaygroundPredefinedMessages onMessageSelect={onChange} />
            )}
            <div id={TOOLBAR_CONTAINER_ID} />
        </div>
    )
}
