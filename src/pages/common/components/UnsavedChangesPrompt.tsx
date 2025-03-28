import { Prompt } from 'react-router-dom'

import UnsavedChangesModal, {
    UnsavedChangesModalProps,
} from './UnsavedChangesModal'
import useUnsavedChangesPrompt from './useUnsavedChangesPrompt'

type UnsavedChangesPromptProps = {
    onDiscard?: () => void
    onSave: () => Promise<unknown> | void
    shouldRedirectAfterSave?: boolean
    when: boolean | undefined
} & Pick<
    UnsavedChangesModalProps,
    'shouldShowDiscardButton' | 'shouldShowSaveButton' | 'body' | 'title'
>

const UnsavedChangesPrompt: React.FC<UnsavedChangesPromptProps> = ({
    onDiscard,
    onSave,
    shouldRedirectAfterSave,
    when,
    ...modalProps
}) => {
    const { isOpen, onClose, redirectToOriginalLocation, onNavigateAway } =
        useUnsavedChangesPrompt({ when })

    return (
        <>
            <Prompt when={when} message={onNavigateAway} />
            <UnsavedChangesModal
                {...modalProps}
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
