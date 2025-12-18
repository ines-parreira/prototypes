type FormState = {
    subdomain: string
    loginEmail: string
    apiKey: string
}

type FormErrors = {
    emailError: string
}

type FormActions = {
    setSubdomain: (value: string) => void
    setLoginEmail: (value: string) => void
    setApiKey: (value: string) => void
}

export type ZendeskImportFormProps = {
    formState: FormState
    formErrors: FormErrors
    formActions: FormActions
    onSubmit: (e: React.FormEvent) => void
}
