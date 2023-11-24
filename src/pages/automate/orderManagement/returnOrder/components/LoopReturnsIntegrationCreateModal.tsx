import React, {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'

import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {EventType} from 'models/event/types'
import {ContentType, HttpMethod} from 'models/api/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import InputField from 'pages/common/forms/input/InputField'
import {getAreIntegrationsLoading} from 'state/integrations/selectors'

import {useReturnOrderFlowViewContext} from '../ReturnOrderFlowViewContext'
import {
    LOOP_RETURNS_INTEGRATION_HEADER_NAME,
    LOOP_RETURNS_INTEGRATION_URL,
} from '../constants'

import css from './LoopReturnsIntegrationCreateModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreate: () => void
}

const LoopReturnsIntegrationCreateModal = ({
    isOpen,
    onClose,
    onCreate,
}: Props) => {
    const {storeIntegration} = useReturnOrderFlowViewContext()
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [apiKey, setApiKey] = useState('')

    const dispatch = useAppDispatch()
    const areIntegrationsLoading = useAppSelector(getAreIntegrationsLoading)

    useEffect(() => {
        if (isSubmitted && !areIntegrationsLoading) {
            setIsSubmitted(false)
            onCreate()
        }
    }, [isSubmitted, areIntegrationsLoading, onCreate])

    const storeIntegrationName = storeIntegration?.name || ''

    const [{loading: isSubmitting}, handleSubmit] = useAsyncFn(async () => {
        const integration = {
            type: 'http',
            name: `${storeIntegrationName} returns`,
            http: {
                headers: {
                    [LOOP_RETURNS_INTEGRATION_HEADER_NAME]: apiKey,
                },
                url: LOOP_RETURNS_INTEGRATION_URL,
                method: HttpMethod.Get,
                request_content_type: ContentType.Json,
                response_content_type: ContentType.Json,
                triggers: {
                    [EventType.TicketCreated]: true,
                    [EventType.TicketUpdated]: true,
                    [EventType.TicketMessageCreated]: true,
                },
            },
        }

        await dispatch(
            updateOrCreateIntegration(fromJS(integration), undefined, true)
        )

        setIsSubmitted(true)
    }, [storeIntegrationName, apiKey])

    const hasError = !apiKey

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title="Create new return integration" />
            <ModalBody>
                <div className={css.label}>API Key</div>
                <div className={css.description}>
                    Enter the API Key from your return portal to create a new
                    integration.
                </div>
                <InputField
                    placeholder="API Key"
                    value={apiKey}
                    onChange={setApiKey}
                />
                <div className={css.caption}>
                    Currently only available to Loop Returns customers.
                    <a
                        href="https://docs.gorgias.com/en-US/loop-returns-81908"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        {' '}
                        Find your API Key in Loop Returns.
                    </a>
                </div>
                <div>
                    You can manage your integration settings later from the{' '}
                    <Link to="/app/settings/integrations/http" target="_blank">
                        HTTP integrations page
                    </Link>
                    .
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button
                    intent="secondary"
                    onClick={onClose}
                    isLoading={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    isLoading={isSubmitting}
                    isDisabled={hasError}
                    onClick={handleSubmit}
                >
                    Create
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default LoopReturnsIntegrationCreateModal
