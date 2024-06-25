import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {useGetApps} from 'models/integration/queries'
import {INTEGRATION_TYPE_CONFIG} from 'config'
import {ActionAppConfiguration} from '../types'
import TemplateActionBanner from './TemplateActionBanner'
import css from './AppConfirmationModal.less'

type Props = {
    templateName: string
    templateDescription?: string | null
    actionAppConfiguration: ActionAppConfiguration
    setOpen: (isOpen: boolean) => void
    isOpen: boolean
}

export default function AppIntegrationDisabledModal({
    actionAppConfiguration,
    templateName,
    templateDescription,
    isOpen,
    setOpen,
}: Props) {
    const {data: appsList} = useGetApps()

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

    const appName = appData?.name || integrationTypeConfig?.title

    const handleOnClose = () => {
        setOpen(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={handleOnClose} size="medium">
            <ModalHeader title={'Action Details'} />
            <ModalBody className={css.modalBody}>
                <TemplateActionBanner
                    actionAppConfiguration={actionAppConfiguration}
                    description={templateDescription}
                    name={templateName}
                />
                {appName && (
                    <span>
                        This Action requires an active {appName} integration.{' '}
                        <Link
                            to={`/app/settings/integrations/${
                                integrationTypeConfig?.type ?? ''
                            }`}
                        >
                            <span>
                                You can configure {appName} integrations in the
                                App Store.
                            </span>
                        </Link>
                    </span>
                )}
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={handleOnClose}>
                    Cancel
                </Button>
                <Button isDisabled intent="primary">
                    Use Action
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
