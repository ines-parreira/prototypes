import React, {FormEvent, useCallback, useEffect, useState} from 'react'
import {Map} from 'immutable'
import {Col, Container, Row} from 'reactstrap'
import {Label} from '@gorgias/ui-kit'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {
    deleteIntegration,
    updateOrCreateIntegrationRequest,
} from 'state/integrations/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import css from 'pages/settings/settings.less'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import ToggleInput from 'pages/common/forms/ToggleInput'
import useQueryNotify from 'pages/integrations/integration/hooks/useQueryNotify'
import useAuthenticationPolling from 'pages/integrations/integration/hooks/useAuthenticationPolling'

import SyncNotification from 'pages/integrations/integration/components/SyncNotification'
import BackToConvertButton from 'pages/convert/onboarding/components/BackToConvertButton'
import {FeatureFlagKey} from 'config/featureFlags'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal'

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
    const isShopifyDefaultAddressPhoneMatchingEnabled =
        useFlags()[FeatureFlagKey.ShopifyDefaultAddressPhoneMatching]

    const dispatch = useAppDispatch()
    useQueryNotify()

    const isAuthenticationPending = useAuthenticationPolling(integration)
    const [syncCustomerNotes, setSyncCustomerNotes] = useState<boolean>(true)
    const [
        defaultAddressPhoneMatchingEnabled,
        setDefaultAddressPhoneMatchingEnabled,
    ] = useState<boolean>(false)
    const shopName = integration.getIn(['meta', 'shop_name'])

    const integrationSyncCustomerNotes = integration.getIn(
        ['meta', 'sync_customer_notes'],
        true
    )
    const integrationDefaultAddressPhoneMatchingEnabled = integration.getIn(
        ['meta', 'default_address_phone_matching_enabled'],
        false
    )

    const [isConfirmationModalShown, setIsConfirmationModalShown] =
        useState(false)

    const saveIntegrationMeta = useCallback(async () => {
        await dispatch(
            updateOrCreateIntegrationRequest(
                integration.mergeDeep({
                    meta: isShopifyDefaultAddressPhoneMatchingEnabled
                        ? {
                              sync_customer_notes: syncCustomerNotes,
                              default_address_phone_matching_enabled:
                                  defaultAddressPhoneMatchingEnabled,
                          }
                        : {sync_customer_notes: syncCustomerNotes},
                })
            )
        )
    }, [
        dispatch,
        integration,
        isShopifyDefaultAddressPhoneMatchingEnabled,
        syncCustomerNotes,
        defaultAddressPhoneMatchingEnabled,
    ])

    const handleUpdate = useCallback(
        async (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()

            const isDefaultAddressPhoneMatchingBeingEnabled =
                defaultAddressPhoneMatchingEnabled &&
                integrationDefaultAddressPhoneMatchingEnabled !==
                    defaultAddressPhoneMatchingEnabled
            if (isDefaultAddressPhoneMatchingBeingEnabled) {
                setIsConfirmationModalShown(true)
            } else {
                await saveIntegrationMeta()
            }
        },
        [
            setIsConfirmationModalShown,
            saveIntegrationMeta,
            defaultAddressPhoneMatchingEnabled,
            integrationDefaultAddressPhoneMatchingEnabled,
        ]
    )

    const onConfirmationModalSave = async () => {
        try {
            await saveIntegrationMeta()
        } finally {
            setIsConfirmationModalShown(false)
        }
    }

    const onConfirmationModalDiscard = () => {
        setSyncCustomerNotes(integrationSyncCustomerNotes)
        setDefaultAddressPhoneMatchingEnabled(
            integrationDefaultAddressPhoneMatchingEnabled
        )
        setIsConfirmationModalShown(false)
    }

    const onConfirmationModalContinueEditing = () =>
        setIsConfirmationModalShown(false)

    useEffect(() => {
        // important, otherwise the value will remain the default one, since at the start we will not yet have the integration data loaded
        setSyncCustomerNotes(integrationSyncCustomerNotes)
        setDefaultAddressPhoneMatchingEnabled(
            integrationDefaultAddressPhoneMatchingEnabled
        )
    }, [
        integration,
        integrationSyncCustomerNotes,
        integrationDefaultAddressPhoneMatchingEnabled,
    ])

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

    const areIntegrationOptionsDirty =
        integrationSyncCustomerNotes !== syncCustomerNotes ||
        integrationDefaultAddressPhoneMatchingEnabled !==
            defaultAddressPhoneMatchingEnabled

    return (
        <Container fluid className={css.pageContainer}>
            <Row>
                <Col md="8">
                    <SyncNotification
                        platform="Shopify"
                        shopName={shopName}
                        isSyncComplete={isCustomersImportOver}
                    />

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
                                isToggled={syncCustomerNotes}
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

                        {isShopifyDefaultAddressPhoneMatchingEnabled && (
                            <div className="mb-4">
                                <ToggleInput
                                    name="default_address_phone_matching_enabled"
                                    isToggled={
                                        defaultAddressPhoneMatchingEnabled
                                    }
                                    onClick={(value) =>
                                        setDefaultAddressPhoneMatchingEnabled(
                                            value
                                        )
                                    }
                                    caption={
                                        <>
                                            Gorgias will search for Shopify
                                            customer’s default address for
                                            customer matching.
                                            <br />
                                            <b>
                                                Do not enable if you use the
                                                same phone number across
                                                multiple customers
                                            </b>
                                            , as this will lead to incorrect
                                            customer merges.
                                        </>
                                    }
                                >
                                    Match customer by Shopify default address
                                    phone number
                                </ToggleInput>
                            </div>
                        )}

                        <div>
                            {needScopeUpdate && (
                                <Button
                                    className="mr-2"
                                    isLoading={isSubmitting}
                                    onClick={retriggerOAuthFlow}
                                >
                                    Update App Permissions
                                </Button>
                            )}

                            <Button
                                type="submit"
                                className="mr-2"
                                isDisabled={
                                    isSubmitting || !areIntegrationOptionsDirty
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
                                    Delete App
                                </ButtonIconLabel>
                            </ConfirmButton>
                        </div>
                    </form>

                    <BackToConvertButton />
                </Col>
            </Row>
            <PendingChangesModal
                when={false} // we don't want to show it when we are leaving the page
                show={isConfirmationModalShown}
                onSave={onConfirmationModalSave}
                onDiscard={onConfirmationModalDiscard}
                onContinueEditing={onConfirmationModalContinueEditing}
                message={
                    <>
                        Matching customers by default address can lead to
                        incorrectly merged customers, especially if the number
                        is shared across multiple customers. Are you sure you
                        want to activate this setting?{' '}
                        <a href="https://docs.gorgias.com/en-US/shopify-faqs-81985">
                            Learn more
                        </a>
                    </>
                }
            />
        </Container>
    )
}
