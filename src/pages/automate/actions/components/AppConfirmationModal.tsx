import React, {useState, useMemo, useEffect} from 'react'
import {Link} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import InputField from 'pages/common/forms/input/InputField'
import {useGetApps} from 'models/integration/queries'
import {INTEGRATION_TYPE_CONFIG} from 'config'
import {ActionApps} from '../types'
import TemplateActionBanner from './TemplateActionBanner'
import css from './AppConfirmationModal.less'

type Props = {
    templateName: string
    templateDescription: string
    app: ActionApps
    apiKey: string
    onConfirm: (apiKey: string) => void
    setOpen: (isOpen: boolean) => void
    isOpen: boolean
    isNativeIntegrationDisabled: boolean
    isNewAction: boolean
}

const appNameToHelpLinkMap: Record<string, string> = {
    loop: 'https://link.gorgias.com/rpz',
}

export default function AppKeyConfirmationModal({
    onConfirm,
    app,
    apiKey,
    templateName,
    templateDescription,
    isOpen,
    setOpen,
    isNativeIntegrationDisabled,
    isNewAction,
}: Props) {
    const {data: appsList} = useGetApps()

    const [step, stepStep] = useState<'details' | 'input'>(
        isNativeIntegrationDisabled || isNewAction ? 'details' : 'input'
    )

    const [apiKeyInput, setApiKeyInput] = useState(apiKey)

    const isDirty = apiKeyInput !== apiKey

    useEffect(() => {
        if (!isOpen && app.type === 'app') {
            setApiKeyInput(apiKey)
        }
    }, [apiKey, app.type, isOpen])

    const appData = useMemo(
        () =>
            appsList?.find((appItem) =>
                app.type === 'app'
                    ? appItem.id === app.app_id
                    : appItem.name === app.type
            ),
        [app, appsList]
    )

    const integrationTypeConfig = useMemo(
        () => INTEGRATION_TYPE_CONFIG.find((item) => item.type === app.type),
        [app.type]
    )

    const modalTitle =
        step === 'details' ? 'Action Details' : 'Connect 3rd party app'

    const appName = appData?.name || integrationTypeConfig?.title

    const appHelpLink = appData?.name && appNameToHelpLinkMap[appData.name]

    return (
        <Modal isOpen={isOpen} onClose={() => setOpen(false)} size="medium">
            <ModalHeader title={modalTitle} />
            <ModalBody className={css.modalBody}>
                {step === 'details' ? (
                    <>
                        <TemplateActionBanner
                            app={app}
                            description={templateDescription}
                            name={templateName}
                        />
                        {appName && (
                            <>
                                {isNativeIntegrationDisabled ? (
                                    <span>
                                        This Action requires an active {appName}{' '}
                                        integration.{' '}
                                        <Link
                                            to={`/app/settings/integrations/${
                                                integrationTypeConfig?.type ??
                                                ''
                                            }`}
                                        >
                                            You can configure {appName}{' '}
                                            integrations in the App Store.
                                        </Link>
                                    </span>
                                ) : (
                                    <span>
                                        This Action requires an active {appName}{' '}
                                        account.
                                    </span>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {appName && (
                            <span>
                                Enter the API key from your {appName} account.
                            </span>
                        )}
                        <div>
                            <InputField
                                label="API key"
                                isRequired
                                type="text"
                                value={apiKeyInput}
                                onChange={setApiKeyInput}
                            />
                            {appHelpLink && appName && (
                                <a
                                    href={appHelpLink}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                >
                                    Find your API key in {appName}.
                                </a>
                            )}
                        </div>
                    </>
                )}
            </ModalBody>
            <ModalActionsFooter
                extra={
                    !isNewAction &&
                    app.type === 'app' &&
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
                        isDisabled={isNativeIntegrationDisabled}
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
