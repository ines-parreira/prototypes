import { Box, Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { useCustomSsoProviderModal } from '../hooks'
import type { CustomSSOProviderData, ModalMode } from '../types'
import { AccessManagementForm } from './AccessManagementForm'

const MODAL_TITLES = {
    ADD_PROVIDER: 'Add a custom SSO provider',
    EDIT_PROVIDER: 'Edit SSO provider',
} as const

const BUTTON_LABELS = {
    ADD_SSO_PROVIDER: 'Add SSO Provider',
    SAVE_CHANGES: 'Save Changes',
} as const

type CustomSsoProviderModalProps = {
    accountDomain: string
    editingProviderId?: string | null
    initialData?: CustomSSOProviderData | null
    isOpen: boolean
    mode: ModalMode
    onClose: () => void
    onSave: (
        providerData: CustomSSOProviderData,
        providerId?: string | null,
    ) => void
    isLoading: boolean
}

const CustomSsoProviderModal = ({
    accountDomain,
    editingProviderId,
    initialData,
    isOpen,
    mode,
    onClose,
    onSave,
    isLoading,
}: CustomSsoProviderModalProps) => {
    const {
        name,
        clientId,
        clientSecret,
        metadataUrl,
        isFormValid,
        setName,
        setClientId,
        setMetadataUrl,
        setClientSecret,
        setIsFormValid,
        handleSave,
    } = useCustomSsoProviderModal({
        initialData,
        isOpen,
        mode,
        onSave,
        editingProviderId,
    })

    const callbackUrl = `https://${accountDomain}.gorgias.com/idp/sso/oidc/callback`

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="large">
            <ModalHeader
                title={
                    mode === 'create'
                        ? MODAL_TITLES.ADD_PROVIDER
                        : MODAL_TITLES.EDIT_PROVIDER
                }
                subtitle="Configure your identity provider via OpenID Connect (OIDC)"
            />

            <ModalBody>
                <AccessManagementForm
                    callbackUrl={callbackUrl}
                    clientId={clientId}
                    clientSecret={clientSecret}
                    setClientSecret={setClientSecret}
                    metadataUrl={metadataUrl}
                    mode={mode}
                    onValidationChange={setIsFormValid}
                    providerName={name}
                    setClientId={setClientId}
                    setMetadataUrl={setMetadataUrl}
                    setName={setName}
                />
            </ModalBody>

            <ModalFooter className="d-flex justify-content-end p-3">
                <Box>
                    <Button
                        intent="secondary"
                        onClick={onClose}
                        style={{ marginRight: '16px' }}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="primary"
                        isDisabled={!isFormValid}
                        isLoading={isLoading}
                        onClick={handleSave}
                    >
                        {mode === 'create'
                            ? BUTTON_LABELS.ADD_SSO_PROVIDER
                            : BUTTON_LABELS.SAVE_CHANGES}
                    </Button>
                </Box>
            </ModalFooter>
        </Modal>
    )
}

export default CustomSsoProviderModal
