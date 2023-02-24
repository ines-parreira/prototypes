import React, {Component} from 'react'

import css from './ChatIntegrationPreview.less'
import CustomerInitialMessages from './CustomerInitialMessages'
import EmailCaptureMessage from './EmailCaptureMessage'

type Props = {
    conversationColor: string
    name?: string
    language?: string
}

export default class OptionalEmailCapture extends Component<Props> {
    render() {
        const {conversationColor, name, language} = this.props

        return (
            <div className={css.content}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={['hi']}
                />

                <EmailCaptureMessage
                    conversationColor={conversationColor}
                    name={name}
                    language={language}
                />
            </div>
        )
    }
}
