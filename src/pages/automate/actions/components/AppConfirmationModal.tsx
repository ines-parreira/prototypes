import React, {useState, useMemo, useEffect} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import InputField from 'pages/common/forms/input/InputField'

import {ActionAppConfiguration, ActionAppConnected} from '../types'
import css from './AppConfirmationModal.less'
import TemplateActionBanner from './TemplateActionBanner'

type Props = {
    actionAppConnected?: ActionAppConnected
    templateId: string
    templateName: string
    templateDescription?: string | null
    actionAppConfiguration: Extract<ActionAppConfiguration, {type: 'app'}>
    apiKey?: string
    onConfirm: (apiKey: string) => void
    setOpen: (isOpen: boolean) => void
    isOpen: boolean
}

export default function AppConfirmationModal({
    actionAppConnected,
    onConfirm,
    actionAppConfiguration,
    apiKey = '',
    templateId,
    templateName,
    templateDescription,
    isOpen,
    setOpen,
}: Props) {
    const {apps} = useApps()

    const [step, setStep] = useState<'details' | 'input'>(
        !apiKey ? 'details' : 'input'
    )

    const [apiKeyInput, setApiKeyInput] = useState(apiKey)

    const isDirty = apiKeyInput !== apiKey

    useEffect(() => {
        if (!isOpen) {
            setApiKeyInput(apiKey)
        }
    }, [apiKey, actionAppConfiguration.type, isOpen])

    const authSettingsUrl = actionAppConnected?.auth_settings.url

    const modalTitle =
        step === 'details' ? 'Action details' : 'Connect 3rd party app'

    const app = useMemo(
        () => apps.find((app) => app.id === actionAppConfiguration.app_id),
        [actionAppConfiguration, apps]
    )

    useEffect(() => {
        if (step === 'input' && app) {
            logEvent(SegmentEvent.AutomateActionsAppAuthenticationModalOpened, {
                template_id: templateId,
                template_name: templateName,
                app_id: app.id,
                app_name: app.name,
            })
        }
    }, [step, templateId, templateName, app])

    return (
        <Modal isOpen={isOpen} onClose={() => setOpen(false)} size="medium">
            <ModalHeader title={modalTitle} />
            <ModalBody className={css.modalBody}>
                {step === 'details' ? (
                    <>
                        <TemplateActionBanner
                            actionAppConfiguration={actionAppConfiguration}
                            description={templateDescription}
                            name={templateName}
                        />

                        {app && (
                            <span>
                                This Action requires an active {app.name}{' '}
                                account.
                            </span>
                        )}
                    </>
                ) : (
                    <>
                        {app && (
                            <span>
                                Enter the API key from your {app.name} account.
                            </span>
                        )}
                        <div className={css.inputContainer}>
                            <InputField
                                label="API key"
                                isRequired
                                type="text"
                                value={apiKeyInput}
                                onChange={setApiKeyInput}
                            />
                            {authSettingsUrl && app && (
                                <div>
                                    <a
                                        href={authSettingsUrl}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                    >
                                        Find your API key in {app.name}.
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </ModalBody>
            <ModalActionsFooter
                extra={
                    apiKey &&
                    step === 'input' && (
                        <Button
                            isDisabled={!isDirty}
                            intent="destructive"
                            fillStyle="ghost"
                            onClick={() => setApiKeyInput(apiKey)}
                        >
                            Discard changes
                        </Button>
                    )
                }
            >
                <Button intent="secondary" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                {step === 'details' ? (
                    <Button
                        intent="primary"
                        onClick={() => {
                            setStep('input')
                        }}
                    >
                        Use Action
                    </Button>
                ) : (
                    <Button
                        isDisabled={!apiKeyInput}
                        intent="primary"
                        onClick={() => {
                            onConfirm(apiKeyInput)
                            setOpen(false)
                        }}
                    >
                        {!apiKey ? 'Continue' : 'Save Changes'}
                    </Button>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}
