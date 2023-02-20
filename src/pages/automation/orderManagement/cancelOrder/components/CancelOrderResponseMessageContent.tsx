import React from 'react'
import {EditorState} from 'draft-js'
import classnames from 'classnames'

import RichField from 'pages/common/forms/RichField/RichField'
import {convertToHTML} from 'utils/editor'
import {ResponseMessageContent} from 'models/selfServiceConfiguration/types'
import {AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH} from 'models/selfServiceConfiguration/constants'

import {usePropagateError} from '../CancelOrderFlowViewContext'

import css from './CancelOrderResponseMessageContent.less'

type Props = {
    responseMessageContent: ResponseMessageContent
    onChange: (responseMessageContent: ResponseMessageContent) => void
}

const CancelOrderResponseMessageContent = ({
    responseMessageContent,
    onChange,
}: Props) => {
    const hasError =
        responseMessageContent.text.length >
        AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH

    usePropagateError('response_message_content', hasError)

    const handleChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText()

        if (text !== responseMessageContent.text) {
            onChange({
                ...responseMessageContent,
                html: convertToHTML(content),
                text,
            })
        }
    }

    return (
        <>
            <div className={css.title}>Response text</div>
            <div className={css.description}>
                After customers request a cancellation, reply with an automated
                message.
            </div>
            <RichField
                value={responseMessageContent}
                allowExternalChanges
                onChange={handleChange}
                className={classnames(css.richField, {
                    [css.hasError]: hasError,
                })}
                // TODO: add once https://linear.app/gorgias/issue/AUTSS-2439 is merged
                // maxLength={AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH}
            />
        </>
    )
}

export default CancelOrderResponseMessageContent
