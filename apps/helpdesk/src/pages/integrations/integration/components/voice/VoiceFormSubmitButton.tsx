import { FormSubmitButton } from '@repo/forms'
import { useFormState } from 'react-hook-form'

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
