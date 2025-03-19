type Props = {
    aiAgentLink?: string
}

export const AiAgentRequirements = ({ aiAgentLink }: Props) => {
    return (
        <div>
            Applicable if{' '}
            {aiAgentLink ? (
                <a
                    href={aiAgentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    AI Agent is enabled
                </a>
            ) : (
                'AI Agent is enabled'
            )}
        </div>
    )
}
