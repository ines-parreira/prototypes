import { useEffect, useState } from 'react'

import type { CustomSSOProviderData, ModalMode } from '../types'
import type {
    UseCustomSsoProviderModalProps,
    UseCustomSsoProviderModalStateProps,
} from './types'

/**
 * Processes the metadata URL to ensure it's in the correct format for OpenID Connect
 * - Strips https:// prefix if present
 * - Removes /.well-known/openid-configuration suffix if present
 * - Removes trailing slashes
 * - Returns the processed URL that will be formatted as https://{provider_url}/.well-known/openid-configuration
 */
const processMetadataUrl = (url: string): string => {
    let processedUrl = url.trim()

    // Strip https:// prefix if present
    if (processedUrl.startsWith('https://')) {
        processedUrl = processedUrl.substring(8)
    }

    // Remove /.well-known/openid-configuration suffix if present (including any trailing slashes)
    const wellKnownSuffix = '/.well-known/openid-configuration'
    if (processedUrl.includes(wellKnownSuffix)) {
        const suffixIndex = processedUrl.indexOf(wellKnownSuffix)
        processedUrl = processedUrl.substring(0, suffixIndex)
    }

    // Remove trailing slashes
    processedUrl = processedUrl.replace(/\/+$/, '')

    return processedUrl
}

export const useCustomSsoProviderModal = ({
    initialData,
    isOpen,
    mode,
    onClose,
    onSave,
    editingProviderId,
}: UseCustomSsoProviderModalProps) => {
    const [name, setName] = useState('')
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')
    const [metadataUrl, setMetadataUrl] = useState('')
    const [hasClientSecretChanged, setHasClientSecretChanged] = useState(false)
    const [isFormValid, setIsFormValid] = useState(false)

    // Reset form when modal opens/closes or mode/data changes
    useEffect(() => {
        const isEditWithData = mode === 'edit' && initialData
        const nameValue = isEditWithData ? initialData.name : ''
        const clientIdValue = isEditWithData ? initialData.clientId : ''
        const clientSecretValue = ''
        const metadataUrlValue = isEditWithData ? initialData.metadataUrl : ''
        const hasSecretChangedValue = false

        setName(nameValue)
        setClientId(clientIdValue)
        setClientSecret(clientSecretValue)
        setMetadataUrl(metadataUrlValue)
        setHasClientSecretChanged(hasSecretChangedValue)
    }, [mode, initialData, isOpen])

    const handleSave = () => {
        const processedMetadataUrl = processMetadataUrl(metadataUrl)
        const formattedMetadataUrl = `https://${processedMetadataUrl}/.well-known/openid-configuration`

        const providerData = {
            name,
            clientId,
            metadataUrl: formattedMetadataUrl,
            clientSecret:
                mode === 'edit' && !hasClientSecretChanged ? '' : clientSecret,
        }

        onSave(providerData, editingProviderId)
        handleClose()
    }

    const handleClose = () => {
        setName('')
        setClientId('')
        setClientSecret('')
        setMetadataUrl('')
        setHasClientSecretChanged(false)
        onClose()
    }

    const handleClientSecretChange = (value: string) => {
        setClientSecret(value)
        if (mode === 'edit') {
            setHasClientSecretChanged(value !== '')
        }
    }

    return {
        // Form state
        name,
        clientId,
        clientSecret,
        metadataUrl,
        isFormValid,

        // Form handlers
        setName,
        setClientId,
        setMetadataUrl,
        handleClientSecretChange,
        setIsFormValid,

        // Modal handlers
        handleSave,
        handleClose,
    }
}

export const useCustomSsoProviderModalState = ({
    onSave,
}: UseCustomSsoProviderModalStateProps) => {
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState<ModalMode>('create')
    const [editingProviderId, setEditingProviderId] = useState<string | null>(
        null,
    )
    const [editingProviderData, setEditingProviderData] =
        useState<CustomSSOProviderData | null>(null)

    const openCreateModal = () => {
        setModalMode('create')
        setEditingProviderId(null)
        setEditingProviderData(null)
        setShowModal(true)
    }

    const openEditModal = (
        providerId: string,
        providerData: CustomSSOProviderData,
    ) => {
        setEditingProviderId(providerId)
        setEditingProviderData({
            ...providerData,
            clientSecret: '',
        })
        setModalMode('edit')
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingProviderId(null)
        setEditingProviderData(null)
    }

    const handleSaveProvider = (
        providerData: CustomSSOProviderData,
        providerId?: string | null,
    ) => {
        onSave(providerData, providerId)
        closeModal()
    }

    return {
        // Modal state
        showModal,
        modalMode,
        editingProviderId,
        editingProviderData,

        // Modal actions
        openCreateModal,
        openEditModal,
        closeModal,
        handleSaveProvider,
    }
}
