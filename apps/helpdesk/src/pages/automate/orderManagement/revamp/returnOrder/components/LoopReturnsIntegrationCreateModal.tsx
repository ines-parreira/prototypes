import { useEffect, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { fromJS } from 'immutable'
import { Link } from 'react-router-dom'

import { Box, Button, Heading, Modal, Text, TextField } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ContentType, HttpMethod } from 'models/api/types'
import { HttpIntegrationTriggerType } from 'models/integration/types'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getAreIntegrationsLoading } from 'state/integrations/selectors'

import {
    LOOP_RETURNS_INTEGRATION_HEADER_NAME,
    LOOP_RETURNS_INTEGRATION_URL,
} from '../../../legacy/returnOrder/constants'
import { useReturnOrderFlowViewContext } from '../ReturnOrderFlowViewContext'

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreate: () => void
}

export const LoopReturnsIntegrationCreateModal = ({
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
                    [HttpIntegrationTriggerType.TicketCreated]: true,
                    [HttpIntegrationTriggerType.TicketUpdated]: true,
                    [HttpIntegrationTriggerType.TicketMessageCreated]: true,
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
        <Modal
            isOpen={isOpen}
            onOpenChange={(nextOpen: boolean) => {
                if (!nextOpen && !isSubmitting) onClose()
            }}
        >
            <Box flexDirection="column" gap="md">
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Heading size="md">Create new return integration</Heading>
                    <Button
                        icon="close"
                        variant="tertiary"
                        size="md"
                        aria-label="Close modal"
                        onClick={onClose}
                        isDisabled={isSubmitting}
                    />
                </Box>
                <Box flexDirection="column" gap="xs">
                    <TextField
                        label="API Key"
                        placeholder="API Key"
                        value={apiKey}
                        onChange={setApiKey}
                        caption="Currently only available to Loop Returns customers."
                    />
                    <Text size="sm">
                        <a
                            href="https://link.gorgias.com/rpz"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            Find your API Key in Loop Returns.
                        </a>
                    </Text>
                    <Text size="sm">
                        You can manage your integration settings later from the{' '}
                        <Link
                            to="/app/settings/integrations/http"
                            target="_blank"
                        >
                            HTTP integrations page
                        </Link>
                        .
                    </Text>
                </Box>
                <Box flexDirection="row" justifyContent="flex-end" gap="xs">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        isDisabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        isLoading={isSubmitting}
                        isDisabled={hasError}
                        onClick={handleSubmit}
                    >
                        Create
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}
