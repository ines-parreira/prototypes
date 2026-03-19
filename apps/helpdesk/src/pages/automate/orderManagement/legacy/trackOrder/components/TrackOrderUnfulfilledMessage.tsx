import React, { useEffect, useRef } from 'react'

import classnames from 'classnames'
import type { EditorState } from 'draft-js'
import { fromJS } from 'immutable'

import { UploadType } from 'common/types'
import type { ResponseMessageContent } from 'models/selfServiceConfiguration/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import RichField from 'pages/common/forms/RichField/RichField'
import { convertToHTML } from 'utils/editor'
import { trimHTML } from 'utils/html'

import { AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH } from '../../constants'
import {
    usePropagateError,
    useTrackOrderFlowViewContext,
} from '../TrackOrderFlowViewContext'

import css from './TrackOrderUnfulfilledMessage.less'

type Props = {
    responseMessageContent: ResponseMessageContent
    onChange: (responseMessageContent: ResponseMessageContent) => void
    setIsFocused: (isFocused: boolean) => void
}

export default function TrackOrderUnfulfilledMessage({
    responseMessageContent,
    onChange,
    setIsFocused,
}: Props) {
    const textareaRef = useRef<RichField>(null)
    const hasError =
        responseMessageContent.text.length >
        AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH

    usePropagateError('response_message_content', hasError)

    const { storeIntegration } = useTrackOrderFlowViewContext()

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
    useEffect(() => {
        setIsFocused(textareaRef.current?.state.isFocused || false)
    }, [textareaRef.current?.state.isFocused, setIsFocused])

    return (
        <>
            <div className={css.title}>Response for unfulfilled orders</div>
            <div className={css.description}>
                Display a custom message when customers track orders that have
                not been packed and shipped. This is useful for reminding
                customers of expected shipping timelines or to inform them about
                possible delays.
            </div>
            <ToolbarProvider shopifyIntegrations={fromJS([storeIntegration])}>
                <RichField
                    ref={textareaRef}
                    value={responseMessageContent}
                    allowExternalChanges
                    onChange={handleChange}
                    className={classnames(css.richField, {
                        [css.hasError]: hasError,
                    })}
                    maxLength={AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH}
                    uploadType={UploadType.PublicAttachment}
                />
            </ToolbarProvider>
        </>
    )
}
