import React, {FormEvent, useCallback} from 'react'
import {Map} from 'immutable'
import {Col, Container, Row} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    deleteIntegration,
    updateOrCreateIntegrationRequest,
} from 'state/integrations/actions'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Loader from 'pages/common/components/Loader/Loader'
import Label from 'pages/common/forms/Label/Label'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import settingsCss from 'pages/settings/settings.less'
import useQueryNotify from 'pages/integrations/integration/hooks/useQueryNotify'
import useAuthenticationPolling from 'pages/integrations/integration/hooks/useAuthenticationPolling'
import SyncNotification from 'pages/integrations/integration/components/SyncNotification'
import {getConnectUrl} from './Utils'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

const Integration = ({integration, loading}: Props) => {
    const dispatch = useAppDispatch()
    useQueryNotify()
    const isAuthenticationPending = useAuthenticationPolling(integration)

    const retriggerOAuthFlow = useCallback(() => {
        window.location.href = getConnectUrl()
    }, [])

    const isActive = !integration.get('deactivated_datetime', null)
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
    const shopName = integration.getIn(['meta', 'shop_name'])

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
                    <SyncNotification
                        platform="BigCommerce"
                        shopName={shopName}
                        isSyncComplete={isCustomersImportOver}
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
                                confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                intent="destructive"
                            >
                                <ButtonIconLabel icon="delete">
                                    Delete App
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
