import React from 'react'
import {EditorState} from 'draft-js'
import classnames from 'classnames'
import {fromJS} from 'immutable'

import RichField from 'pages/common/forms/RichField/RichField'
import {convertToHTML} from 'utils/editor'
import {ResponseMessageContent} from 'models/selfServiceConfiguration/types'
import {trimHTML} from 'utils/html'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'

import {AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH} from '../../constants'
import {
    usePropagateError,
    useReturnOrderFlowViewContext,
} from '../ReturnOrderFlowViewContext'

import css from './ReturnOrderAutomatedResponseAction.less'

type Props = {
    responseMessageContent: ResponseMessageContent
    onChange: (responseMessageContent: ResponseMessageContent) => void
}

const ReturnOrderAutomatedResponseAction = ({
    responseMessageContent,
    onChange,
}: Props) => {
    const hasError =
        responseMessageContent.text.length >
        AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH

    usePropagateError('response_message_content', hasError)

    const {storeIntegration} = useReturnOrderFlowViewContext()

    const handleChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText()
        const html = convertToHTML(content)

        onChange({
            ...responseMessageContent,
            html: text.length ? html : trimHTML(html),
            text,
        })
    }

    return (
        <>
            <div className={css.title}>Response text</div>
            <div className={css.description}>
                After customers request a return, reply with an automated
                message.
            </div>
            <ToolbarProvider shopifyIntegrations={fromJS([storeIntegration])}>
                <RichField
                    value={responseMessageContent}
                    allowExternalChanges
                    onChange={handleChange}
                    className={classnames(css.richField, {
                        [css.hasError]: hasError,
                    })}
                    maxLength={AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH}
                />
            </ToolbarProvider>
        </>
    )
}

export default ReturnOrderAutomatedResponseAction
