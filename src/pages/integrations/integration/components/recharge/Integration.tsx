import classnames from 'classnames'
import React from 'react'
import {List, Map} from 'immutable'
import {useRouteMatch} from 'react-router-dom'
import {Col, Container, Label, Row} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import {deleteIntegration} from 'state/integrations/actions'
import {IntegrationType} from 'models/integration/constants'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import * as integrationHelpers from 'state/integrations/helpers'
import Loader from 'pages/common/components/Loader/Loader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import settingsCss from 'pages/settings/settings.less'
import useQueryNotify from 'pages/integrations/integration/hooks/useQueryNotify'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import css from './Integration.less'

type Props = {
    integration: Map<any, any>
    availableShopifyIntegrations: List<Map<any, any>>
    loading: Map<any, any>
    redirectUri: string
}

export default function Integration({
    integration,
    availableShopifyIntegrations,
    loading,
    redirectUri,
}: Props) {
    const dispatch = useAppDispatch()
    useQueryNotify()
    const match = useRouteMatch<{integrationId: string}>()
    const isUpdate = match.params.integrationId !== 'new'
    const isSubmitting = loading.get('updateIntegration')
    const isActive = !integration.get('deactivated_datetime')

    const needScopeUpdate = integration.getIn(['meta', 'need_scope_update'])
    const isSyncOver = integration.getIn([
        'meta',
        'sync_state',
        'is_initialized',
    ])

    function triggerOAuthFlow(shopifyShopName?: string) {
        window.location.href = redirectUri
            .concat('?store_name=')
            .concat(
                shopifyShopName || integration.getIn(['meta', 'store_name'])
            )
    }

    if (loading.get('integration')) {
        return <Loader />
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Row>
                <Col md="8">
                    {isUpdate ? (
                        <>
                            {isSyncOver !== undefined &&
                                (isSyncOver ? (
                                    <LinkAlert
                                        className="mb-4"
                                        actionLabel="Review your customers."
                                        actionHref="/app/customers"
                                    >
                                        All your Recharge customers have been
                                        imported. You can now see their info in
                                        the sidebar.
                                    </LinkAlert>
                                ) : (
                                    <Alert
                                        className="mb-4"
                                        type={AlertType.Loading}
                                        icon
                                    >
                                        We're currently importing all your
                                        Recharge customers. We will send you an
                                        email once it is done. Feel free to
                                        leave this page.
                                    </Alert>
                                ))}

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
                                <GroupAddon>.myshopify.com</GroupAddon>
                            </InputGroup>
                            <div>
                                {(needScopeUpdate || !isActive) && (
                                    <Button
                                        type="button"
                                        isLoading={isSubmitting}
                                        onClick={() => triggerOAuthFlow()}
                                    >
                                        {!isActive
                                            ? 'Reconnect'
                                            : 'Update app permissions'}
                                    </Button>
                                )}
                                <ConfirmButton
                                    id="confirm-button-delete"
                                    className="float-right"
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
                        </>
                    ) : (
                        <div>
                            <Label className="control-label">
                                Select an existing Shopify integration
                            </Label>
                            {availableShopifyIntegrations
                                .map((integration, index) => {
                                    return (
                                        <Button
                                            type="button"
                                            key={index}
                                            onClick={() =>
                                                triggerOAuthFlow(
                                                    integration!.getIn([
                                                        'meta',
                                                        'shop_name',
                                                    ])
                                                )
                                            }
                                            className={classnames(
                                                css.installButton,
                                                'mb-2'
                                            )}
                                            intent="secondary"
                                        >
                                            <img
                                                alt="shopify logo"
                                                className={css.shopifyLogo}
                                                src={integrationHelpers.getIconFromType(
                                                    IntegrationType.Shopify
                                                )}
                                            />
                                            Install Recharge for{' '}
                                            {integration!.get('name')}
                                        </Button>
                                    )
                                })
                                .toArray()}
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    )
}
