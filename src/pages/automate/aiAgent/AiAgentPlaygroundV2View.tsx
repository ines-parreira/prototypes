import React, {useState} from 'react'
import css from './AiAgentPlaygroundV2View.less'
import {PlaygroundInputStep} from './components/PlaygroundInputStep/PlaygroundInputStep'
import {PlaygroundOutputStep} from './components/PlaygroundOutputStep/PlaygroundOutputStep'

enum PlaygroundStep {
    INPUT = 'input',
    OUTPUT = 'output',
}

export const AiAgentPlaygroundV2View = () => {
    const [step] = useState(PlaygroundStep.INPUT)

    return (
        <div className={css.container}>
            <div>
                <h1 className="heading-section-semibold">Test your AI Agent</h1>
                <p className="mb-0">
                    Here you can test how your AI Agent would reply to inquiries
                    from real customers. You can choose one of your customer’s
                    email addresses to check how the AI Agent would reply to
                    each person.
                </p>
            </div>

            {step === PlaygroundStep.INPUT ? (
                <PlaygroundInputStep />
            ) : (
                <PlaygroundOutputStep />
            )}
        </div>
    )
}
