import type { FormattedSyncingMessage } from '../../utils/knowledgeSourcesAnalysis'

type SyncingSourcesMessageProps = {
    message: FormattedSyncingMessage
}

export const SyncingSourcesMessage = ({
    message,
}: SyncingSourcesMessageProps) => {
    const { count, sources } = message
    const plural = count > 1 ? 's' : ''

    return (
        <div>
            <strong>{count}</strong> knowledge source{plural} currently syncing:
            <ul className="mt-2 mb-2 list-disc pl-5">
                {sources.map((source, index) => (
                    <li key={index}>
                        {source.label ? source.label + ': ' : ''} {source.name}
                    </li>
                ))}
            </ul>
            The knowledge will become available once syncing is complete.
        </div>
    )
}
