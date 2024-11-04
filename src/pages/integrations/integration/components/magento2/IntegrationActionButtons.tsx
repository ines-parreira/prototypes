import {Map} from 'immutable'
import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {useNotificationTextForRemovalMessage} from 'pages/integrations/integration/hooks/useNotificationTextForRemovalMessage'
import {deleteIntegration} from 'state/integrations/actions'

type Props = {
    integration: Map<string, any>
    redirectUri?: string
    isUpdate: boolean
    isSubmitting: boolean
    submitIsDisabled: boolean
}

export const IntegrationActionButtons = ({
    isUpdate,
    isSubmitting,
    submitIsDisabled,
    integration,
    redirectUri,
}: Props) => {
    const dispatch = useAppDispatch()
    const confirmationOfRemovalContent = useNotificationTextForRemovalMessage()
    const isDeactivated = integration.get('deactivated_datetime')
    const isManual = integration.getIn(['meta', 'is_manual']) as boolean

    const reconnect = (integration: Map<string, any>, redirectUri?: string) => {
        const adminUrlSuffix = integration.getIn([
            'meta',
            'admin_url_suffix',
        ]) as string

        const url = integration.getIn(['meta', 'store_url']) as string
        window.location.href = redirectUri!.concat(
            `?store_url=${url}&admin_url_suffix=${adminUrlSuffix}`
        )
    }

    return (
        <div>
            <Button
                type="submit"
                className="mr-2"
                isLoading={isSubmitting}
                isDisabled={submitIsDisabled}
            >
                {isUpdate ? 'Update Connection' : 'Connect App'}
            </Button>
            {isUpdate &&
                isDeactivated &&
                (isManual ? (
                    <Button
                        type="submit"
                        className="mr-2"
                        isLoading={isSubmitting}
                        isDisabled={submitIsDisabled}
                    >
                        Reconnect
                    </Button>
                ) : (
                    <ConfirmButton
                        id="reconnect-integration"
                        isLoading={isSubmitting}
                        onConfirm={() => reconnect(integration, redirectUri)}
                        confirmationContent="You first need to delete the integration on your Magento2 store so that you can re-add it using this button"
                    >
                        Reconnect
                    </ConfirmButton>
                ))}
            {isUpdate && (
                <ConfirmButton
                    id="delete-integration"
                    className="float-right"
                    onConfirm={() => dispatch(deleteIntegration(integration))}
                    confirmationContent={confirmationOfRemovalContent}
                    intent="destructive"
                >
                    <ButtonIconLabel icon="delete">Delete App</ButtonIconLabel>
                </ConfirmButton>
            )}
        </div>
    )
}

export default IntegrationActionButtons
