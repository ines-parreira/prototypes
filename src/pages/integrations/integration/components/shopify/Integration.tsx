import React, {FormEvent, useCallback, useState} from 'react'
import {Map} from 'immutable'
import {Col, Container, Row} from 'reactstrap'

import {
    deleteIntegration,
    updateOrCreateIntegrationRequest,
} from 'state/integrations/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import css from 'pages/settings/settings.less'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import Label from 'pages/common/forms/Label/Label'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useQueryNotify from 'pages/integrations/integration/hooks/useQueryNotify'
import useAuthenticationPolling from 'pages/integrations/integration/hooks/useAuthenticationPolling'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

export default function Integration({
    integration,
    loading,
    redirectUri,
}: Props) {
    const dispatch = useAppDispatch()
    useQueryNotify()

    const isAuthenticationPending = useAuthenticationPolling(integration)
    const [mustSyncCustomerNotes, setSyncCustomerNotes] = useState<boolean>(
        integration.getIn(['meta', 'sync_customer_notes'], true)
    )
    const shopName = integration.getIn(['meta', 'shop_name'])

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

    const retriggerOAuthFlow = useCallback(() => {
        window.location.href = redirectUri.replace('{shop_name}', shopName)
    }, [shopName, redirectUri])

    const isActive = !integration.get('deactivated_datetime')
    const isSubmitting = Boolean(loading.get('updateIntegration'))
    const isCustomersImportOver = integration.getIn([
        'meta',
        'import_state',
        'customers',
        'is_over',
    ])

    const needScopeUpdate = Boolean(
        integration.getIn(['meta', 'need_scope_update'], false)
    )

    if (loading.get('integration')) {
        return <Loader />
    }

    return (
        <Container fluid className={css.pageContainer}>
            <Row>
                <Col md="8">
                    {isCustomersImportOver ? (
                        <LinkAlert
                            className="mb-4"
                            actionLabel="Review your customers."
                            actionHref="/app/customers"
                        >
                            All your Shopify customers have been imported. You
                            can now see their info in the sidebar.
                        </LinkAlert>
                    ) : (
                        <Alert className="mb-4" type={AlertType.Loading} icon>
                            Import in progress. We typically sync 3,000
                            customers an hour.We will send you an email once it
                            is done. Feel free to leave this page.
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
                                value={shopName}
                            />
                            <GroupAddon>.myshopify.com</GroupAddon>
                        </InputGroup>

                        <div className="mb-4">
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
                                        Notes will not be synchronized for
                                        customers who are associated with more
                                        than one Shopify store.
                                    </>
                                }
                            >
                                Synchronize customer notes between Gorgias and
                                Shopify
                            </ToggleInput>
                        </div>

                        <div>
                            {needScopeUpdate && (
                                <Button
                                    className="mr-2"
                                    isLoading={isSubmitting}
                                    onClick={retriggerOAuthFlow}
                                >
                                    Update app permissions
                                </Button>
                            )}

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
                                    isSubmitting || isAuthenticationPending
                                }
                            >
                                Update Connection
                            </Button>
                            {!isAuthenticationPending && !isActive && (
                                <Button
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
