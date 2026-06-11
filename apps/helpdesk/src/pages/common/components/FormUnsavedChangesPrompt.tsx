import type { ComponentProps } from 'react'

import type { Form } from '@repo/forms'
import type { FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

import { toast } from '@gorgias/axiom'

import type { UnsavedChangesModalProps } from 'pages/common/components/UnsavedChangesModal'
import { UnsavedChangesPrompt } from 'pages/common/components/UnsavedChangesPrompt'

type Props<T extends FieldValues> = {
    onSave: ComponentProps<typeof Form<T>>['onValidSubmit']
    onDiscard?: () => void
    shouldRedirectAfterSave?: boolean
} & Pick<
    UnsavedChangesModalProps,
    'shouldShowDiscardButton' | 'shouldShowSaveButton' | 'body' | 'title'
>

function FormUnsavedChangesPrompt<T extends FieldValues>({
    onSave,
    onDiscard,
    shouldRedirectAfterSave,
    ...modalProps
}: Props<T>) {
    const { formState, handleSubmit } = useFormContext<T>()

    const handleOnSave = async () => {
        await handleSubmit(onSave, () =>
            toast.error(
                'Please make sure all fields are filled out correctly before saving',
            ),
        )()
    }

    return (
        <UnsavedChangesPrompt
            when={formState.isDirty}
            onSave={handleOnSave}
            onDiscard={onDiscard}
            shouldRedirectAfterSave={shouldRedirectAfterSave}
            {...modalProps}
        />
    )
}

export { FormUnsavedChangesPrompt }
