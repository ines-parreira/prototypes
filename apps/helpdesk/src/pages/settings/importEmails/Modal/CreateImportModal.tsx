import { useState } from 'react'

import moment from 'moment-timezone'

import { Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { EmailMultiselect } from './form/EmailMultiselect'
import { useEmailIntegrations } from './form/hooks/useEmailIntegrations'
import { TimeFrameField } from './form/TimeFrameField'

import css from './CreateImportModal.less'

type CreateImportModalProps = {
    isOpen: boolean
    onClose: () => void
}

const CreateImportModal = ({ isOpen, onClose }: CreateImportModalProps) => {
    const [email, setEmail] = useState('')
    const [forwardingProvider, setForwardingProvider] = useState<
        'gmail' | 'outlook'
    >('gmail')
    const [timeframe, setTimeframe] = useState('')
    const [isFormSubmitting, setIsFormSubmitting] = useState(false)
    const [importCreationError, setImportCreationError] = useState(false)

    const emailOptions = useEmailIntegrations()
    const isFormValid = !!(email && timeframe)

    const handleProviderChange = (provider: string) => {
        setForwardingProvider(provider as 'gmail' | 'outlook')
    }

    const handleSubmit = async () => {
        setIsFormSubmitting(true)
        setImportCreationError(false)
        try {
            // Find the selected email option to determine the provider
            const selectedEmailOption = emailOptions.find(
                (option) => option.email === email,
            )

            // For forwarding emails (IntegrationType.Email), use the selected forwarding provider
            // For direct provider emails (Gmail/Outlook), use the provider from the email option
            let selectedProvider = forwardingProvider

            if (
                selectedEmailOption &&
                (selectedEmailOption.provider === 'gmail' ||
                    selectedEmailOption.provider === 'outlook')
            ) {
                selectedProvider = selectedEmailOption.provider
            }

            const redirectUrl = new URL(
                '/integrations/' +
                    selectedProvider +
                    '/auth/import/oauth-redirect',
                window.location.origin,
            )

            redirectUrl.searchParams.set('provider_address', email)

            const [startDate, endDate]: string[] = timeframe.split(' to ')

            redirectUrl.searchParams.set(
                'import_window_start',
                moment(startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            )
            redirectUrl.searchParams.set(
                'import_window_end',
                moment(endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            )

            window.location.href = redirectUrl.toString()
            setEmail('')
            setTimeframe('')

            onClose()
        } catch {
            setImportCreationError(true)
        } finally {
            setIsFormSubmitting(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="small"
            className={css.importModalWithDropdowns}
        >
            <ModalHeader title="Import email history" />
            <ModalBody>
                <p>
                    Import historical emails from your Gmail or Microsoft 365
                    account.
                </p>
                <div className={css.helpText}>
                    <h2 className={css.heading}>What will be imported?</h2>
                    <ul>
                        <li>Emails – including full message content.</li>
                        <li>Attachments – any files sent with those emails.</li>
                        <li>Timeframe – up to 2 years of historical data.</li>
                    </ul>
                </div>

                {importCreationError && (
                    <div className={css.errorText}>
                        <p>There was an error during import creation.</p>
                        <p>Please try again.</p>
                    </div>
                )}
                <form>
                    <EmailMultiselect
                        email={email}
                        setEmail={setEmail}
                        handleProviderChange={handleProviderChange}
                        forwardingProvider={forwardingProvider}
                    />
                    <TimeFrameField
                        timeframe={timeframe}
                        setTimeframe={setTimeframe}
                        onCancel={() => {
                            setEmail('')
                            setTimeframe('')
                            setImportCreationError(false)
                        }}
                    />
                </form>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    isDisabled={!isFormValid}
                    isLoading={isFormSubmitting}
                >
                    Authenticate and import
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default CreateImportModal
