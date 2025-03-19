import BotMessages from './BotMessages'
import EmailCaptureMessage from './EmailCaptureMessage'

type Props = {
    mainColor: string
    chatTitle: string
    language?: string
}

const OptionalEmailCapture: React.FC<Props> = ({ chatTitle, language }) => {
    return (
        <BotMessages chatTitle={chatTitle} language={language}>
            <EmailCaptureMessage language={language} required={false} />
        </BotMessages>
    )
}

export default OptionalEmailCapture
