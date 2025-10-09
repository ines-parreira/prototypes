import type { CustomSSOProviderData, ModalMode } from '../types'

export type UseCustomSsoProviderModalProps = {
    initialData?: CustomSSOProviderData | null
    isOpen: boolean
    mode: ModalMode
    onSave: (
        providerData: CustomSSOProviderData,
        providerId?: string | null,
    ) => void
    editingProviderId?: string | null
}

export type UseCustomSsoProviderModalStateProps = {
    showModal: boolean
    setShowModal: (enabled: boolean) => void
    onSave: (
        providerData: CustomSSOProviderData,
        providerId?: string | null,
    ) => Promise<boolean>
}

export type UseAccessManagementFormProps = {
    clientId: string
    clientSecret?: string
    metadataUrl: string
    mode: ModalMode
    onValidationChange?: (isValid: boolean) => void
    providerName: string
}

export type TouchedFields = {
    clientId: boolean
    clientSecret: boolean
    metadataUrl: boolean
    providerName: boolean
}
