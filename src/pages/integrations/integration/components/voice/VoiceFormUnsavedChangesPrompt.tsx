import { ComponentProps } from 'react'

import { FieldValues, useFormContext } from 'react-hook-form'

import { Form } from 'core/forms'
import { useNotify } from 'hooks/useNotify'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

function VoiceFormUnsavedChangesPrompt<T extends FieldValues>({
    onSave,
}: {
    onSave: ComponentProps<typeof Form<T>>['onValidSubmit']
}) {
    const { formState, handleSubmit } = useFormContext<T>()
    const notify = useNotify()

    const handleOnSave = async () => {
        if (formState.isValid) {
            handleSubmit(onSave)()
        } else {
            void notify.error(
                'Please make sure all fields are filled out correctly before saving',
            )
        }
    }

    return (
        <UnsavedChangesPrompt when={formState.isDirty} onSave={handleOnSave} />
    )
}

export default VoiceFormUnsavedChangesPrompt
