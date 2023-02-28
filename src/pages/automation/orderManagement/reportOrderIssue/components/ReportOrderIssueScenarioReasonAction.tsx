import React from 'react'
import {EditorState} from 'draft-js'
import classnames from 'classnames'

import {ReportIssueCaseReasonAction} from 'models/selfServiceConfiguration/types'
import {AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH} from 'models/selfServiceConfiguration/constants'
import RichField from 'pages/common/forms/RichField/RichField'
import {convertToHTML} from 'utils/editor'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {trimHTML} from 'utils/html'

import {usePropagateError} from './ReportOrderIssueScenarioFormContext'

import css from './ReportOrderIssueScenarioReasonAction.less'

type Props = {
    value: ReportIssueCaseReasonAction
    onChange: (nextValue: ReportIssueCaseReasonAction) => void
}

const ReportOrderIssueScenarioReasonAction = ({value, onChange}: Props) => {
    const hasError =
        value.responseMessageContent.text.length >
        AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH

    usePropagateError('action', hasError)

    const handleResponseMessageContentChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText()
        const html = convertToHTML(content)

        onChange({
            ...value,
            responseMessageContent: {
                html: text.length ? html : trimHTML(html),
                text,
            },
            showHelpfulPrompt: text.length ? value.showHelpfulPrompt : false,
        })
    }
    const handleShowHelpfulPromptChange = (nextShowHelpfulPrompt: boolean) => {
        onChange({...value, showHelpfulPrompt: nextShowHelpfulPrompt})
    }

    return (
        <>
            <div className={css.title}>Response text</div>
            <div className={css.description}>
                After customers choose this option, reply with an automated
                message.
            </div>
            <RichField
                value={value.responseMessageContent}
                allowExternalChanges
                onChange={handleResponseMessageContentChange}
                className={classnames(css.richField, {
                    [css.hasError]: hasError,
                })}
                maxLength={AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH}
            />
            <ToggleInput
                className={css.showHelpfulPromptToggleInput}
                isDisabled={!value.responseMessageContent.text.length}
                isToggled={value.showHelpfulPrompt}
                onClick={handleShowHelpfulPromptChange}
                caption="A ticket is created only if customers need more help"
            >
                Ask customers if your response was helpful
            </ToggleInput>
        </>
    )
}

export default ReportOrderIssueScenarioReasonAction
