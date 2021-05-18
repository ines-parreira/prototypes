import {Button} from 'reactstrap'
import React from 'react'
import classNames from 'classnames'

import {Map} from 'immutable'

import ConfirmButton from '../../../../common/components/ConfirmButton'

type Props = {
    integration: Map<string, any>
    actions: {
        updateOrCreateIntegration: (
            integration: Map<string, any>
        ) => Promise<void>
        deleteIntegration: (integration: Map<string, any>) => Promise<void>
    }
    redirectUri?: string
    isUpdate: boolean
    isSubmitting: boolean
    submitIsDisabled: boolean
}

const Magento2IntegrationActionButtons = ({
    isUpdate,
    isSubmitting,
    submitIsDisabled,
    actions,
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
                <ConfirmButton
                    color="success"
                    loading={isSubmitting}
                    content="You first need to delete the integration on your Magento2 store so that you can re-add it using this button"
                    confirm={() =>
                        _onReactivateOneClick(integration, redirectUri)
                    }
                >
                    Reconnect
                </ConfirmButton>
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
                <ConfirmButton
                    className="float-right"
                    color="secondary"
                    confirm={() => actions.deleteIntegration(integration)}
                    content="Are you sure you want to delete this integration?"
                >
                    <i className="material-icons mr-1 text-danger">delete</i>
                    Delete integration
                </ConfirmButton>
            ) : null}
        </div>
    )
}

export default Magento2IntegrationActionButtons
