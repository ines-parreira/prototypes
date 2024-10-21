import {useEffect, useState} from 'react'
import {emailError as validateEmail} from 'pages/settings/new_billing/utils/validations'

export const useEmailInputField = (form: HTMLFormElement | null) => {
    const [isComplete, setIsComplete] = useState(() =>
        form ? !validateEmailInput(form) : false
    )

    useEffect(() => {
        if (form) {
            const onChange = () => {
                const emailError = validateEmailInput(form)
                setIsComplete(!emailError)
            }

            onChange()

            form.addEventListener('input', onChange)
            form.addEventListener('change', onChange)
            return () => {
                form.removeEventListener('input', onChange)
                form.removeEventListener('change', onChange)
            }
        }
    }, [form])

    return {
        isComplete,
        getValue: () => (form ? getEmail(form) : undefined),
    }
}

const getEmail = (form: HTMLFormElement) =>
    new FormData(form).get('email') as string | null

const validateEmailInput = (form: HTMLFormElement) =>
    validateEmail(getEmail(form) ?? '')
