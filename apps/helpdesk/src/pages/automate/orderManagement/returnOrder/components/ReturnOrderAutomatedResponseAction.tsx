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

    const { storeIntegration } = useReturnOrderFlowViewContext()

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
                When customers request a return, an automated reply is sent. If
                AI Agent is active, it will replace this message with its own
                response.
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
                    uploadType={UploadType.PublicAttachment}
                />
            </ToolbarProvider>
        </>
    )
}

export default ReturnOrderAutomatedResponseAction
