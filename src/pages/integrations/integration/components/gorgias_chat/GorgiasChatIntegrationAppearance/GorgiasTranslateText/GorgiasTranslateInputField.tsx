import React, {useState} from 'react'
import {Col, Container, Row} from 'reactstrap'
import TextInput from '../../../../../../common/forms/input/TextInput'
import css from './GorgiasTranslateText.less'

type Props = {
    value: string
    maxLength: number
    keyName: string
    defaultValue: string
    saveValue: (key: string, value: string) => void
    focus?: boolean
}

const GorgiasTranslateInputField = ({
    value,
    maxLength,
    keyName,
    defaultValue,
    saveValue,
    focus = false,
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
                    <TextInput
                        type="text"
                        className="input"
                        aria-label={defaultValue}
                        defaultValue={value}
                        maxLength={maxLength}
                        onChange={onChange}
                        placeholder={'Enter custom value'}
                        key={keyName}
                        autoFocus={focus}
                        onFocus={() => {
                            setHasFocus(true)
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
