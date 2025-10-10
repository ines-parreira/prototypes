import React, { useEffect, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { fromJS } from 'immutable'
import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ContentType, HttpMethod } from 'models/api/types'
import { EventType } from 'models/event/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import InputField from 'pages/common/forms/input/InputField'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getAreIntegrationsLoading } from 'state/integrations/selectors'

import {
    LOOP_RETURNS_INTEGRATION_HEADER_NAME,
    LOOP_RETURNS_INTEGRATION_URL,
} from '../constants'
import { useReturnOrderFlowViewContext } from '../ReturnOrderFlowViewContext'

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
    const { storeIntegration } = useReturnOrderFlowViewContext()
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

    const [{ loading: isSubmitting }, handleSubmit] = useAsyncFn(async () => {
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
            updateOrCreateIntegration(fromJS(integration), undefined, true),
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
                        href="https://link.gorgias.com/rpz"
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
