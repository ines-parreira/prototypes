import React from 'react'

import classnames from 'classnames'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import {PlaygroundEditor} from '../PlaygroundEditor/PlaygroundEditor'
import {PlaygroundFormValues} from '../PlaygroundChat/PlaygroundChat.types'
import {PlaygroundCustomerSelection} from '../PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import css from './PlaygroundInputSection.less'

type Props = {
    formValues: PlaygroundFormValues
    onFormValuesChange: <Key extends keyof PlaygroundFormValues>(
        key: Key,
        value: PlaygroundFormValues[Key]
    ) => void
}

export const PlaygroundInputSection = ({
    formValues,
    onFormValuesChange,
}: Props) => {
    const handleMessageChange = (message: string) => {
        onFormValuesChange('message', message)
    }

    const handleSubjectChange = (subject: string) => {
        onFormValuesChange('subject', subject)
    }

    const handleCustomerEmailChange = (customerEmail: string) => {
        onFormValuesChange('customerEmail', customerEmail)
    }

    return (
        <div className={css.container}>
            <div className={css.section}>
                <PlaygroundCustomerSelection
                    customerEmail={formValues.customerEmail ?? ''}
                    onCustomerEmailChange={handleCustomerEmailChange}
                />
            </div>
            <div className={css.section}>
                <TextInput
                    className={css.subjectInput}
                    value={formValues.subject}
                    onChange={handleSubjectChange}
                    maxLength={135}
                    prefix={<span className="body-semibold">Subject: </span>}
                />
            </div>
            <div className={classnames(css.section, css.noPaddings)}>
                <PlaygroundEditor
                    value={formValues.message}
                    onChange={handleMessageChange}
                />
            </div>
            <div className={classnames(css.section, css.footer)}>
                <Button>Send</Button>
                <Button intent="secondary">New Conversation</Button>
            </div>
        </div>
    )
}
