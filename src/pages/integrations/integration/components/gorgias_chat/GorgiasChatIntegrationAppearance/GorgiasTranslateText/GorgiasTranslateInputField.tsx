import React, {useState} from 'react'
import {Col, Container, Row} from 'reactstrap'
import {EditorState} from 'draft-js'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import RichField from 'pages/common/forms/RichField/RichField'
import {convertToHTML} from 'utils/editor'
import {sanitizeHtmlDefault} from 'utils/html'
import TextArea from '../../../../../../common/forms/TextArea'
import css from './GorgiasTranslateText.less'

type Props = {
    value: string
    maxLength: number
    keyName: string
    defaultValue: string
    isRequired: boolean
    isRichText: boolean
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
    isRichText,
    saveValue,
    focus = false,
    trackInputMethod,
}: Props) => {
    const [hasTextAreaFocus, setHasTextAreaFocus] = useState(focus)
    const [, setRichArea] = useState<RichField | null>(null)

    const onChangeTextArea = (value: string) => {
        saveValue(keyName, value)
    }

    const onChangeTicketRichField = (value: EditorState) => {
        let html = convertToHTML(value.getCurrentContent())
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
                            className={css.richTextareaWrapper}
                            ref={(ref) => setRichArea(ref)}
                            value={{html: value, text: value}}
                            aria-label={defaultValue}
                            placeholder={'Enter customer value'}
                            maxLength={maxLength}
                            isRequired={false}
                            onChange={onChangeTicketRichField}
                            displayedActions={[
                                ActionName.Bold,
                                ActionName.Italic,
                                ActionName.Underline,
                                ActionName.Link,
                                ActionName.Emoji,
                            ]}
                            allowExternalChanges={false}
                            isFocused={false}
                        />
                    )}
                </Col>
            </Row>
        </Container>
    )
}

export default GorgiasTranslateInputField
