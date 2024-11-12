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
    value?: string
    onConfirm: (value: string, key: 'api_key' | 'refresh_token') => void
    setOpen: (isOpen: boolean) => void
    isOpen: boolean
}

export default function AppConfirmationModal({
    actionAppConnected,
    onConfirm,
    actionAppConfiguration,
    value = '',
    templateId,
    templateName,
    templateDescription,
    isOpen,
    setOpen,
}: Props) {
    const {apps} = useApps()

    const [step, setStep] = useState<'details' | 'input'>(
        !value ? 'details' : 'input'
    )

    const [inputValue, setInputValue] = useState(value)

    const isDirty = inputValue !== value

    useEffect(() => {
        if (!isOpen) {
            setInputValue(value)
        }
    }, [value, actionAppConfiguration.type, isOpen])

    const authSettingsUrl = actionAppConnected?.auth_settings.url

    const modalTitle =
        step === 'details' ? 'Action details' : 'Connect 3rd party app'

    const app = useMemo(
        () => apps.find((app) => app.id === actionAppConfiguration.app_id),
        [actionAppConfiguration, apps]
    )

    const isAppTypeOauth2Token = useMemo(
        () => actionAppConnected?.auth_type === 'oauth2-token',
        [actionAppConnected?.auth_type]
    )

    const inputConfig = useMemo(() => {
        if (!app) return null
        if (isAppTypeOauth2Token)
            return {
                description: `Enter the refresh token from your ${app.name} account`,
                label: 'Refresh token',
                inputDescription: `Find your refresh token in ${app.name}.`,
            }
        return {
            description: `Enter the API key from your ${app.name} account.`,
            label: 'API key',
            inputDescription: `Find your API key in ${app.name}.`,
        }
    }, [app, isAppTypeOauth2Token])

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
                    inputConfig && (
                        <>
                            {app && <span>{inputConfig.description}</span>}
                            <div className={css.inputContainer}>
                                <InputField
                                    label={inputConfig.label}
                                    isRequired
                                    type="text"
                                    value={inputValue}
                                    onChange={setInputValue}
                                />
                                {authSettingsUrl && app && (
                                    <div>
                                        <a
                                            href={authSettingsUrl}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                        >
                                            {inputConfig.inputDescription}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                )}
            </ModalBody>
            <ModalActionsFooter
                extra={
                    value &&
                    step === 'input' && (
                        <Button
                            isDisabled={!isDirty}
                            intent="destructive"
                            fillStyle="ghost"
                            onClick={() => setInputValue(value)}
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
                        isDisabled={!inputValue}
                        intent="primary"
                        onClick={() => {
                            onConfirm(
                                inputValue,
                                isAppTypeOauth2Token
                                    ? 'refresh_token'
                                    : 'api_key'
                            )
                            setOpen(false)
                        }}
                    >
                        {!value ? 'Continue' : 'Save Changes'}
                    </Button>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}
