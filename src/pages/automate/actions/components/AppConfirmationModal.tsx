import React, {useState, useMemo, useEffect} from 'react'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import InputField from 'pages/common/forms/input/InputField'
import {useGetApps} from 'models/integration/queries'
import {INTEGRATION_TYPE_CONFIG} from 'config'
import {ActionAppConfiguration, ActionAppConnected} from '../types'
import TemplateActionBanner from './TemplateActionBanner'
import css from './AppConfirmationModal.less'

type Props = {
    actionAppConnected?: ActionAppConnected
    templateName: string
    templateDescription?: string | null
    actionAppConfiguration: ActionAppConfiguration
    apiKey: string
    onConfirm: (apiKey: string) => void
    setOpen: (isOpen: boolean) => void
    isOpen: boolean
    isNewAction: boolean
}

export default function AppConfirmationModal({
    actionAppConnected,
    onConfirm,
    actionAppConfiguration,
    apiKey,
    templateName,
    templateDescription,
    isOpen,
    setOpen,
    isNewAction,
}: Props) {
    const {data: appsList} = useGetApps()

    const [step, stepStep] = useState<'details' | 'input'>(
        isNewAction ? 'details' : 'input'
    )

    const [apiKeyInput, setApiKeyInput] = useState(apiKey)

    const isDirty = apiKeyInput !== apiKey

    useEffect(() => {
        if (!isOpen && actionAppConfiguration.type === 'app') {
            setApiKeyInput(apiKey)
        }
    }, [apiKey, actionAppConfiguration.type, isOpen])

    const appData = useMemo(
        () =>
            appsList?.find((appItem) =>
                actionAppConfiguration.type === 'app'
                    ? appItem.id === actionAppConfiguration.app_id
                    : appItem.name === actionAppConfiguration.type
            ),
        [actionAppConfiguration, appsList]
    )

    const integrationTypeConfig = useMemo(
        () =>
            INTEGRATION_TYPE_CONFIG.find(
                (item) => item.type === actionAppConfiguration.type
            ),
        [actionAppConfiguration.type]
    )

    const authSettingsUrl = actionAppConnected?.auth_settings.url

    const modalTitle =
        step === 'details' ? 'Action details' : 'Connect 3rd party app'

    const appName = appData?.name || integrationTypeConfig?.title

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

                        {appName && (
                            <span>
                                This Action requires an active {appName}{' '}
                                account.
                            </span>
                        )}
                    </>
                ) : (
                    <>
                        {appName && (
                            <span>
                                Enter the API key from your {appName} account.
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
                            {authSettingsUrl && appName && (
                                <div>
                                    <a
                                        href={authSettingsUrl}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                    >
                                        Find your API key in {appName}.
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </ModalBody>
            <ModalActionsFooter
                extra={
                    !isNewAction &&
                    actionAppConfiguration.type === 'app' &&
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
                            stepStep('input')
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
                        {isNewAction ? 'Continue' : 'Save Changes'}
                    </Button>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}
