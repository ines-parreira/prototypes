import React from 'react'

import EmailCaptureMessage from './EmailCaptureMessage'
import BotMessages from './BotMessages'

type Props = {
    mainColor: string
    chatTitle: string
    language?: string
}

const OptionalEmailCapture: React.FC<Props> = ({chatTitle, language}) => {
    return (
        <BotMessages chatTitle={chatTitle} language={language}>
            <EmailCaptureMessage language={language} required={false} />
        </BotMessages>
    )
}

export default OptionalEmailCapture
