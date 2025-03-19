import { Prompt } from 'react-router-dom'

import UnsavedChangesModal from './UnsavedChangesModal'
import useUnsavedChangesPrompt from './useUnsavedChangesPrompt'

type Props = {
    onDiscard?: () => void
    onSave: () => Promise<unknown> | void
    shouldRedirectAfterSave?: boolean
    when: boolean | undefined
}

const UnsavedChangesPrompt: React.FC<Props> = ({
    onDiscard,
    onSave,
    shouldRedirectAfterSave,
    when,
}) => {
    const { isOpen, onClose, redirectToOriginalLocation, onNavigateAway } =
        useUnsavedChangesPrompt({ when })

    return (
        <>
            <Prompt when={when} message={onNavigateAway} />
            <UnsavedChangesModal
                onDiscard={() => {
                    onClose()
                    onDiscard && onDiscard()
                    redirectToOriginalLocation()
                }}
                isOpen={isOpen}
                onClose={onClose}
                onSave={async () => {
                    if (shouldRedirectAfterSave) {
                        await onSave()
                            ?.then(redirectToOriginalLocation)
                            .catch(() => onClose())
                    } else {
                        await onSave()?.catch(() => onClose())
                    }

                    onClose()
                }}
            />
        </>
    )
}

export default UnsavedChangesPrompt
