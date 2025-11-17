import type { FormEvent } from 'react'
import React, { useCallback } from 'react'

import type { Map } from 'immutable'
import { Col, Container, Row } from 'reactstrap'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import { getConnectUrl } from 'pages/integrations/integration/components/bigcommerce/Utils'
import SyncNotification from 'pages/integrations/integration/components/SyncNotification'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import useAuthenticationPolling from 'pages/integrations/integration/hooks/useAuthenticationPolling'
import useQueryNotify from 'pages/integrations/integration/hooks/useQueryNotify'
import settingsCss from 'pages/settings/settings.less'
import {
    deleteIntegration,
    updateOrCreateIntegrationRequest,
} from 'state/integrations/actions'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

const Integration = ({ integration, loading }: Props) => {
    const dispatch = useAppDispatch()
    useQueryNotify()
    const isAuthenticationPending = useAuthenticationPolling(integration)

    const retriggerOAuthFlow = useCallback(() => {
        window.location.href = getConnectUrl()
    }, [])

    const isActive = !integration.get('deactivated_datetime', null)
    const isSubmitting = Boolean(loading.get('updateIntegration'))
    const isProductsImportOver = integration.getIn([
        'meta',
        'import_state',
        'products',
        'is_over',
    ])
    const isCustomersImportOver = integration.getIn([
        'meta',
        'import_state',
        'customers',
        'is_over',
    ])
    const isExternalOrdersImportOver = integration.getIn([
        'meta',
        'import_state',
        'external_orders',
        'is_over',
    ])
    const needScopeUpdate = Boolean(
        integration.getIn(['meta', 'need_scope_update'], false),
    )
    const shopName = integration.getIn(['meta', 'shop_name'])

    const handleUpdate = useCallback(
        (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()

            void dispatch(updateOrCreateIntegrationRequest(integration))
        },
        [dispatch, integration],
    )

    if (loading.get('integration')) {
        return <Loader />
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Row>
                <Col md="8">
                    <SyncNotification
                        platform="BigCommerce"
                        shopName={shopName}
                        isSyncComplete={
                            isProductsImportOver &&
                            isCustomersImportOver &&
                            isExternalOrdersImportOver
                        }
                    />

                    <form onSubmit={handleUpdate}>
                        <Label
                            htmlFor="disabled-store-field"
                            isDisabled
                            className="mb-2"
                        >
                            Store domain
                        </Label>
                        <InputGroup isDisabled className="mb-4">
                            <TextInput
                                id="disabled-store-field"
                                name="store-name"
                                value={integration.getIn([
                                    'meta',
                                    'shop_domain',
                                ])}
                            />
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
                            {needScopeUpdate && (
                                <Button
                                    className="ml-2"
                                    isLoading={isSubmitting}
                                    onClick={retriggerOAuthFlow}
                                >
                                    Update App Permissions
                                </Button>
                            )}

                            <ConfirmButton
                                className="float-right"
                                id="integration-deletion-confirm-button"
                                onConfirm={() =>
                                    dispatch(deleteIntegration(integration))
                                }
                                confirmationContent={
                                    INTEGRATION_REMOVAL_CONFIGURATION_TEXT
                                }
                                intent="destructive"
                                leadingIcon="delete"
                            >
                                Delete App
                            </ConfirmButton>
                        </div>
                    </form>
                </Col>
            </Row>
        </Container>
    )
}

export default Integration
