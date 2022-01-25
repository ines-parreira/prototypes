import {Button} from 'reactstrap'
import React from 'react'
import classNames from 'classnames'
import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import DEPRECATED_ConfirmButton from '../../../../common/components/DEPRECATED_ConfirmButton'
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
                color="success"
                className={classNames('mr-2', {
                    'btn-loading': isSubmitting,
                })}
                disabled={submitIsDisabled}
            >
                {isUpdate ? 'Update integration' : 'Add integration'}
            </Button>
            {isUpdate && !isActive && !isManual ? (
                <DEPRECATED_ConfirmButton
                    color="success"
                    loading={isSubmitting}
                    content="You first need to delete the integration on your Magento2 store so that you can re-add it using this button"
                    confirm={() =>
                        _onReactivateOneClick(integration, redirectUri)
                    }
                >
                    Reconnect
                </DEPRECATED_ConfirmButton>
            ) : null}
            {isUpdate && !isActive && isManual ? (
                <Button
                    type="submit"
                    color="success"
                    className={classNames('mr-2', {
                        'btn-loading': isSubmitting,
                    })}
                    disabled={submitIsDisabled}
                >
                    Reconnect
                </Button>
            ) : null}
            {isUpdate ? (
                <DEPRECATED_ConfirmButton
                    className="float-right"
                    color="secondary"
                    confirm={() => deleteIntegration(integration)}
                    content="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                >
                    <i className="material-icons mr-1 text-danger">delete</i>
                    Delete integration
                </DEPRECATED_ConfirmButton>
            ) : null}
        </div>
    )
}

const connector = connect(null, {
    deleteIntegration,
})

export default connector(Magento2IntegrationActionButtons)
