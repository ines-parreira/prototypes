import type { ComponentProps } from 'react'

import type { Form } from '@repo/forms'
import type { FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

import { useNotify } from 'hooks/useNotify'
import type { UnsavedChangesModalProps } from 'pages/common/components/UnsavedChangesModal'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

type Props<T extends FieldValues> = {
    onSave: ComponentProps<typeof Form<T>>['onValidSubmit']
} & Pick<
    UnsavedChangesModalProps,
    'shouldShowDiscardButton' | 'shouldShowSaveButton' | 'body' | 'title'
>

function FormUnsavedChangesPrompt<T extends FieldValues>({
    onSave,
    ...modalProps
}: Props<T>) {
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
        <UnsavedChangesPrompt
            when={formState.isDirty}
            onSave={handleOnSave}
            {...modalProps}
        />
    )
}

export default FormUnsavedChangesPrompt
