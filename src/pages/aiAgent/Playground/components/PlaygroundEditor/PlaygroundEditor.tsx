import { FROALA_KEY } from 'config'
import FroalaEditorComponent from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js'

import { PlaygroundTemplateMessage } from '../../types'
import { PlaygroundActions } from '../PlaygroundActions/PlaygroundActions'
import { PlaygroundAction } from '../PlaygroundActions/types'
import { PlaygroundPredefinedMessages } from '../PlaygroundPredefinedMessages/PlaygroundPredefinedMessages'

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
    onMessageChange: (value: string) => void
    onSubjectChange: (value: string) => void
    placeholder?: string
    enablePredefinedMessages?: boolean
    customActions?: PlaygroundAction[]
}

export const PlaygroundEditor = ({
    value,
    placeholder,
    onMessageChange,
    onSubjectChange,
    customActions,
    enablePredefinedMessages,
}: Props) => {
    const onMessageSelect = (message: PlaygroundTemplateMessage) => {
        onMessageChange(message.content)
        onSubjectChange(message.title)
    }

    const hasCustomActions =
        customActions !== undefined && customActions.length > 0

    return (
        <div className={css.editor}>
            <FroalaEditorComponent
                model={value}
                tag="textarea"
                config={{
                    ...config,
                    placeholderText: placeholder,
                }}
                onModelChange={onMessageChange}
            />

            {hasCustomActions ? (
                <PlaygroundActions actions={customActions} />
            ) : null}

            {!value && enablePredefinedMessages && !hasCustomActions && (
                <PlaygroundPredefinedMessages
                    onMessageSelect={onMessageSelect}
                />
            )}
            <div id={TOOLBAR_CONTAINER_ID} />
        </div>
    )
}
