import React, {useCallback, FormEvent} from 'react'
import {Map} from 'immutable'
import {Col, Container, Row} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    deleteIntegration,
    updateOrCreateIntegrationRequest,
} from 'state/integrations/actions'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Loader from 'pages/common/components/Loader/Loader'
import Label from 'pages/common/forms/Label/Label'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import settingsCss from 'pages/settings/settings.less'
import useQueryNotify from 'pages/integrations/integration/hooks/useQueryNotify'
import useAuthenticationPolling from 'pages/integrations/integration/hooks/useAuthenticationPolling'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

const Integration = ({integration, loading, redirectUri}: Props) => {
    const dispatch = useAppDispatch()
    useQueryNotify()
    const isAuthenticationPending = useAuthenticationPolling(integration)

    const retriggerOAuthFlow = useCallback(() => {
        window.location.href = redirectUri.replace(
            '{shop_id}',
            integration.getIn(['meta', 'shop_id'], '')
        )
    }, [integration, redirectUri])

    const isActive = !integration.get('deactivated_datetime', null)
    const isSubmitting = Boolean(loading.get('updateIntegration'))
    const isCustomersImportOver = integration.getIn([
        'meta',
        'import_state',
        'customers',
        'is_over',
    ])

    const handleUpdate = useCallback(
        (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()

            void dispatch(updateOrCreateIntegrationRequest(integration))
        },
        [dispatch, integration]
    )

    if (loading.get('integration')) {
        return <Loader />
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Row>
                <Col md="8">
                    {isCustomersImportOver ? (
                        <LinkAlert
                            className="mb-4"
                            actionLabel="Review your customers."
                            actionHref="/app/customers"
                        >
                            All your BigCommerce customers have been imported.
                            You can now see their info in the sidebar.
                        </LinkAlert>
                    ) : (
                        <Alert className="mb-4" type={AlertType.Loading} icon>
                            Import in progress. We will send you an email once
                            it is done. Feel free to leave this page.
                        </Alert>
                    )}

                    <form onSubmit={handleUpdate}>
                        <Label
                            htmlFor="disabled-store-field"
                            isDisabled
                            className="mb-2"
                        >
                            Store name
                        </Label>
                        <InputGroup isDisabled className="mb-4">
                            <TextInput
                                id="disabled-store-field"
                                name="store-name"
                                value={integration.get('name')}
                            />
                            <GroupAddon>.mybigcommerce.com</GroupAddon>
                        </InputGroup>

                        <div>
                            {!isAuthenticationPending && !isActive && (
                                <Button
                                    type="button"
                                    isLoading={isSubmitting}
                                    onClick={retriggerOAuthFlow}
                                >
                                    Reconnect
                                </Button>
                            )}

                            <ConfirmButton
                                className="float-right"
                                id="integration-deletion-confirm-button"
                                onConfirm={() =>
                                    dispatch(deleteIntegration(integration))
                                }
                                confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                intent="destructive"
                            >
                                <ButtonIconLabel icon="delete">
                                    Delete integration
                                </ButtonIconLabel>
                            </ConfirmButton>
                        </div>
                    </form>
                </Col>
            </Row>
        </Container>
    )
}

export default Integration
