import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'

import {INTEGRATION_TYPE_CONFIG} from 'config'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import {ActionAppConfiguration} from '../types'
import css from './AppConfirmationModal.less'
import TemplateActionBanner from './TemplateActionBanner'

type Props = {
    templateName: string
    templateDescription?: string | null
    actionAppConfiguration: Extract<
        ActionAppConfiguration,
        {type: 'shopify' | 'recharge'}
    >
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
    const integrationTypeConfig = useMemo(
        () =>
            INTEGRATION_TYPE_CONFIG.find(
                (item) => item.type === actionAppConfiguration.type
            ),
        [actionAppConfiguration.type]
    )

    const appName = integrationTypeConfig?.title

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
