import React from 'react'
import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {deleteIntegration} from '../../../../../state/integrations/actions'

type Props = {
    integration: Map<string, any>
    redirectUri?: string
    isUpdate: boolean
    isSubmitting: boolean
    submitIsDisabled: boolean
} & ConnectedProps<typeof connector>

export const Magento2IntegrationActionButtons = ({
    isUpdate,
    isSubmitting,
    submitIsDisabled,
    deleteIntegration,
    integration,
    redirectUri,
}: Props) => {
    const isActive = !integration.get('deactivated_datetime')
    const isManual = integration.getIn(['meta', 'is_manual']) as boolean

    const _onReactivateOneClick = (
        integration: Map<string, any>,
        redirectUri?: string
    ) => {
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
                {isUpdate ? 'Update integration' : 'Add integration'}
            </Button>
            {isUpdate && !isActive && !isManual ? (
                <ConfirmButton
                    isLoading={isSubmitting}
                    onConfirm={() =>
                        _onReactivateOneClick(integration, redirectUri)
                    }
                    confirmationContent="You first need to delete the integration on your Magento2 store so that you can re-add it using this button"
                >
                    Reconnect
                </ConfirmButton>
            ) : null}
            {isUpdate && !isActive && isManual ? (
                <Button
                    type="submit"
                    className="mr-2"
                    isLoading={isSubmitting}
                    isDisabled={submitIsDisabled}
                >
                    Reconnect
                </Button>
            ) : null}
            {isUpdate ? (
                <ConfirmButton
                    className="float-right"
                    onConfirm={() => deleteIntegration(integration)}
                    confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                    intent="destructive"
                >
                    <ButtonIconLabel icon="delete">
                        Delete integration
                    </ButtonIconLabel>
                </ConfirmButton>
            ) : null}
        </div>
    )
}

const connector = connect(null, {
    deleteIntegration,
})

export default connector(Magento2IntegrationActionButtons)
