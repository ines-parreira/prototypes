import React, {useCallback, useEffect, useState} from 'react'
import {Form, FormGroup, FormText, Label, FormProps} from 'reactstrap'
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
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import {getAreIntegrationsLoading} from 'state/integrations/selectors'
import {
    LOOP_RETURNS_INTEGRATION_HEADER_NAME,
    LOOP_RETURNS_INTEGRATION_URL,
} from './constants'

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreate: () => void
}

export const NewReturnIntegrationModal = ({
    isOpen,
    onClose,
    onCreate,
}: Props) => {
    const {configuration} = useConfigurationData()

    const [isSubmitting, setIsSubmitting] = useState(false)
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

    const handleSubmit = useCallback<NonNullable<FormProps['onSubmit']>>(
        async (event) => {
            event.preventDefault()
            event.stopPropagation()

            setIsSubmitting(true)

            const integration = {
                type: 'http',
                name: `${configuration?.shop_name as string} returns`,
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

            try {
                await dispatch(
                    updateOrCreateIntegration(
                        fromJS(integration),
                        undefined,
                        true
                    )
                )

                setIsSubmitted(true)
            } finally {
                setIsSubmitting(false)
            }
        },
        [dispatch, configuration?.shop_name, apiKey]
    )

    const isFormValid = Boolean(apiKey)

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title="Create new return integration" />
            <Form onSubmit={handleSubmit}>
                <ModalBody>
                    <FormGroup>
                        <h4>API Key</h4>
                        <Label>
                            Enter the API Key from your return portal to create
                            a new integration.
                        </Label>
                        <InputField
                            placeholder="API Key"
                            value={apiKey}
                            onChange={setApiKey}
                        />
                        <FormText color="inherit">
                            Currently only available to Loop Returns customers.
                            <a
                                href="https://docs.gorgias.com/en-US/loop-returns-81908"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                &nbsp;Find your API Key in Loop Returns.
                            </a>
                        </FormText>
                    </FormGroup>

                    <div className="mt-4">
                        You can manage your integration settings later from the{' '}
                        <Link
                            to="/app/settings/integrations/http"
                            target="_blank"
                        >
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
                        type="submit"
                        isLoading={isSubmitting}
                        isDisabled={!isFormValid}
                    >
                        Create
                    </Button>
                </ModalActionsFooter>
            </Form>
        </Modal>
    )
}
