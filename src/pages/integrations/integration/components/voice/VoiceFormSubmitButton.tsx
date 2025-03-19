import { useFormState } from 'react-hook-form'

import { FormSubmitButton } from 'core/forms'

type Props = {
    children: React.ReactNode
}

export default function VoiceFormSubmitButton({ children }: Props) {
    const { isDirty, isValid } = useFormState()

    return (
        <FormSubmitButton isDisabled={!isValid || !isDirty}>
            {children}
        </FormSubmitButton>
    )
}
