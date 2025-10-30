import TextToSpeechContext from './TextToSpeechContext'

export default function TextToSpeechProvider({
    integrationId,
    children,
}: {
    integrationId: number
    children: React.ReactNode
}) {
    return (
        <TextToSpeechContext.Provider value={{ integrationId }}>
            {children}
        </TextToSpeechContext.Provider>
    )
}
