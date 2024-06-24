import React, {useState} from 'react'

import {PlaygroundInputSection} from '../PlaygroundInputSection/PlaygroundInputSection'
import css from './PlaygroundChat.less'
import {PlaygroundFormValues} from './PlaygroundChat.types'
import {PlaygroundChatEmptyBanner} from './PlaygroundChatEmptyBanner'

const INITIAL_FORM_VALUES: PlaygroundFormValues = {
    message: '',
}

export const PlaygroundChat = () => {
    const [formValues, setFormValues] =
        useState<PlaygroundFormValues>(INITIAL_FORM_VALUES)
    // Fake messages for now
    const [messages] = useState<string[]>([])

    const onFormValuesChange = <Key extends keyof PlaygroundFormValues>(
        key: Key,
        value: PlaygroundFormValues[Key]
    ) => {
        setFormValues({
            ...formValues,
            [key]: value,
        })
    }

    return (
        <div className={css.container}>
            <div className={css.outputSection}>
                {messages.length === 0 ? (
                    <div className={css.emptyState}>
                        <PlaygroundChatEmptyBanner />
                    </div>
                ) : (
                    <div>messages here</div>
                )}
            </div>
            <div>
                <PlaygroundInputSection
                    formValues={formValues}
                    onFormValuesChange={onFormValuesChange}
                />
            </div>
        </div>
    )
}
