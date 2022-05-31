import React, {useCallback, useState, FormEvent} from 'react'
import {Map} from 'immutable'
import {Col, Container, Row} from 'reactstrap'

import {PENDING_AUTHENTICATION_STATUS} from 'constants/integration'
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
import ToggleInput from 'pages/common/forms/ToggleInput'
import settingsCss from 'pages/settings/settings.less'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

const Integration = ({integration, loading, redirectUri}: Props) => {
    const dispatch = useAppDispatch()

    const [mustSyncCustomerNotes, setSyncCustomerNotes] = useState<boolean>(
        integration.getIn(['meta', 'sync_customer_notes'], true)
    )

    const retriggerOAuthFlow = useCallback(() => {
        window.location.href = redirectUri.replace(
            '{shop_id}',
            integration.getIn(['meta', 'shop_id'], '')
        )
    }, [integration, redirectUri])

    const handleUpdate = useCallback(
        (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()

            void dispatch(
                updateOrCreateIntegrationRequest(
                    integration.mergeDeep({
                        meta: {
                            sync_customer_notes: mustSyncCustomerNotes,
                        },
                    })
                )
            )
        },
        [dispatch, integration, mustSyncCustomerNotes]
    )

    const isActive = !integration.get('deactivated_datetime', null)
    const isSubmitting = !!loading.get('updateIntegration')
    const isCustomersImportOver = integration.getIn([
        'meta',
        'import_state',
        'customers',
        'is_over',
    ])
    const authenticationPending =
        integration.getIn(['meta', 'oauth', 'status']) ===
        PENDING_AUTHENTICATION_STATUS

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
                                name="name"
                                value={integration.get('name')}
                            />
                            <GroupAddon>.mybigcommerce.com</GroupAddon>
                        </InputGroup>

                        <div key="input" className="mb-4">
                            <ToggleInput
                                name="sync_customer_notes"
                                isToggled={mustSyncCustomerNotes}
                                onClick={(value) => setSyncCustomerNotes(value)}
                                caption={
                                    <>
                                        When editing notes in both places at the
                                        same time, the first one saved will be
                                        synchronized.
                                        <br />
                                        Notes will not be synchrorized for
                                        customers who are associated with more
                                        than one BigCommerce store.
                                    </>
                                }
                            >
                                Synchronize customer notes between Gorgias and
                                BigCommerce
                            </ToggleInput>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="mr-2"
                                isDisabled={
                                    isSubmitting ||
                                    integration.getIn([
                                        'meta',
                                        'sync_customer_notes',
                                    ]) === mustSyncCustomerNotes
                                }
                                isLoading={
                                    isSubmitting || authenticationPending
                                }
                            >
                                Update Connection
                            </Button>
                            {!authenticationPending && !isActive && (
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
