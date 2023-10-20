import React, {useState} from 'react'
import {Col, Container, Row} from 'reactstrap'
import TextArea from '../../../../../../common/forms/TextArea'
import css from './GorgiasTranslateText.less'

type Props = {
    value: string
    maxLength: number
    keyName: string
    defaultValue: string
    isRequired: boolean
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
    saveValue,
    focus = false,
    trackInputMethod,
}: Props) => {
    const onChange = (value: string) => {
        saveValue(keyName, value)
    }
    const [hasFocus, setHasFocus] = useState(focus)

    return (
        <Container fluid className={css.inputContainer}>
            <Row>
                <Col className={css.pageColumn} md="6">
                    <label htmlFor={keyName}>{defaultValue}</label>
                </Col>
                <Col className={css.pageColumn} md="6">
                    <TextArea
                        aria-label={defaultValue}
                        defaultValue={value}
                        maxLength={maxLength}
                        onChange={onChange}
                        placeholder={'Enter custom value'}
                        key={keyName}
                        autoFocus={focus}
                        rows={1}
                        autoRowHeight
                        isRequired={isRequired}
                        onFocus={() => {
                            setHasFocus(true)
                            trackInputMethod?.(keyName)
                        }}
                        onBlur={() => {
                            setHasFocus(false)
                            saveValue(keyName, value.trim())
                        }}
                        value={value}
                    />
                    {hasFocus && (
                        <p className={css.lengthLeft}>
                            {value.length}/{maxLength} characters
                        </p>
                    )}
                </Col>
            </Row>
        </Container>
    )
}

export default GorgiasTranslateInputField
