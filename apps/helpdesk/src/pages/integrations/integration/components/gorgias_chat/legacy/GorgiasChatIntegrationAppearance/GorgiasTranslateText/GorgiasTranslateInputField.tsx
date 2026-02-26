import React, { useState } from 'react'

import classnames from 'classnames'
import type { EditorState } from 'draft-js'
import { Col, Container, Row } from 'reactstrap'

import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import type RichField from 'pages/common/forms/RichField/RichField'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import { convertToHTML } from 'utils/editor'
import { sanitizeHtmlDefault } from 'utils/html'

import TextArea from '../../../../../../../common/forms/TextArea'

import css from './GorgiasTranslateText.less'

type Props = {
    value: string
    maxLength: number
    keyName: string
    defaultValue: string
    isRequired: boolean
    isRichText?: boolean
    saveValue: (key: string, value: string) => void
    focus?: boolean
    trackInputMethod?: (key: string) => void
}

const GorgiasTranslateInputField = ({
    value,
    maxLength,
    keyName,
    defaultValue,
    isRequired,
    isRichText = false,
    saveValue,
    focus = false,
    trackInputMethod,
}: Props) => {
    const [hasTextAreaFocus, setHasTextAreaFocus] = useState(focus)
    const [, setRichArea] = useState<RichField | null>(null)

    const onChangeTextArea = (newValue: string) => {
        saveValue(keyName, newValue)
    }

    const onChangeTicketRichField = (newValue: EditorState) => {
        let html = convertToHTML(newValue.getCurrentContent())

        // Ignore initial callback from TicketRichField. This is to avoid flagging the form as dirty when the user has not changed anything.
        if (
            value === html ||
            // Value might not be HTML at first, if we've just set it using our translations.
            value === html.replace('<div>', '').replace('</div>', '')
        ) {
            return
        }

        // Sanitize the HTML to remove unwanted tags coming from draftjs.
        // This is commomly done in the Helpdesk when extracting the HTML from the rich text editor.
        // This one is especially usefull to add `noreferrer noopener` to links.
        // TODO. See why `noreferrer noopener` are not added.
        html = sanitizeHtmlDefault(html)

        // `TicketRichField` component can return a value of '<div><br></div>'/'<div><br /></div>' when the user deletes all the text.
        if (html === `<div><br></div>'` || html === '<div><br /></div>') {
            html = ''
        }

        saveValue(keyName, html)
    }

    // Synced with https://github.com/gorgias/gorgias-chat/blob/main/packages/api/src/endpoints/applications/applicationSchemas.ts#L542
    const strippedValue = value?.replace(/<[^>]*>?/gm, '')

    const hasError = strippedValue?.length > maxLength

    return (
        <Container fluid className={css.inputContainer}>
            <Row>
                <Col className={css.pageColumn} md="6">
                    <label htmlFor={keyName}>{defaultValue}</label>
                </Col>
                <Col className={css.pageColumn} md="6">
                    {!isRichText ? (
                        <>
                            <TextArea
                                aria-label={defaultValue}
                                defaultValue={value}
                                maxLength={maxLength}
                                onChange={onChangeTextArea}
                                placeholder={'Enter custom value'}
                                key={keyName}
                                autoFocus={focus}
                                rows={1}
                                autoRowHeight
                                isRequired={isRequired}
                                onFocus={() => {
                                    setHasTextAreaFocus(true)
                                    trackInputMethod?.(keyName)
                                }}
                                onBlur={() => {
                                    setHasTextAreaFocus(false)
                                    saveValue(keyName, value.trim())
                                }}
                                value={value}
                            />
                            {hasTextAreaFocus && (
                                <p className={css.lengthLeft}>
                                    {value.length}/{maxLength} characters
                                </p>
                            )}
                        </>
                    ) : (
                        <TicketRichField
                            //className={css.richTextareaWrapper} // TODO. Fix me https://linear.app/gorgias/issue/AUTWD-1820/bug-fix-tone-of-voice-text-overflow-not-scrolling
                            className={classnames({
                                [css.hasError]: hasError,
                            })}
                            ref={(ref) => setRichArea(ref)}
                            value={{ html: value, text: value }}
                            aria-label={defaultValue}
                            placeholder={'Enter customer value'}
                            maxLength={maxLength}
                            pattern={`^.{0,${maxLength}}$`}
                            isRequired={isRequired}
                            onChange={onChangeTicketRichField}
                            displayedActions={[
                                ActionName.Bold,
                                ActionName.Italic,
                                ActionName.Underline,
                                ActionName.Link,
                                ActionName.Emoji,
                            ]}
                            canDropFiles={false}
                            canInsertInlineImages={false}
                        />
                    )}
                </Col>
            </Row>
        </Container>
    )
}

export default GorgiasTranslateInputField
