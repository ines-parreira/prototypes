import { useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { useZendeskImportForm } from './form/hooks/useZendeskImportForm'
import { ZendeskImportForm } from './form/ZendeskImportForm'

import css from './ZendeskImportModalWizard.less'

type ZendeskImportModalWizzardProps = {
    onClose: () => void
}

export const ZendeskImportModalWizard = ({
    onClose,
}: ZendeskImportModalWizzardProps) => {
    const [hasError, setHasError] = useState(false)

    const handleSuccess = () => {
        setHasError(false)
        onClose()
    }

    const handleError = () => {
        setHasError(true)
    }

    const {
        formState,
        formErrors,
        formActions,
        handleSubmit,
        isLoading,
        isFormValid,
    } = useZendeskImportForm({
        onSuccess: handleSuccess,
        onError: handleError,
    })

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            size="small"
            className={css.importModalWithDropdowns}
        >
            <ModalHeader title="Import Zendesk data" />
            <ModalBody>
                <p>
                    Import up to 2 years of customers, macros, and tags from
                    Zendesk. Your data will then stay automatically synced with
                    Gorgias.
                </p>

                {hasError && (
                    <div className={css.errorText}>
                        <p>There was an error during import creation.</p>
                        <p>Please try again.</p>
                    </div>
                )}
                <ZendeskImportForm
                    formState={formState}
                    formErrors={formErrors}
                    formActions={formActions}
                    onSubmit={handleSubmit}
                />
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={() => handleSubmit()}
                    isDisabled={isLoading || !isFormValid}
                    isLoading={isLoading}
                >
                    Import
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
