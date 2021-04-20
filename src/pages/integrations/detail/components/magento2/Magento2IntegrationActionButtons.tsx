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
        deactivateIntegration: (integration: Map<string, any>) => Promise<void>
        activateIntegration: (integration: Map<string, any>) => Promise<void>
        deleteIntegration: (integration: Map<string, any>) => Promise<void>
    }
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
}: Props) => {
    const isActive = !integration.get('deactivated_datetime')

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

            {isUpdate && isActive ? (
                <Button
                    type="button"
                    color="warning"
                    outline
                    className={classNames({
                        'btn-loading': isSubmitting,
                    })}
                    disabled={isSubmitting}
                    onClick={() =>
                        actions.deactivateIntegration(integration.get('id'))
                    }
                >
                    Deactivate integration
                </Button>
            ) : null}
            {isUpdate && !isActive ? (
                <Button
                    type="button"
                    color="success"
                    className={classNames({
                        'btn-loading': isSubmitting,
                    })}
                    disabled={isSubmitting}
                    onClick={() =>
                        actions.activateIntegration(integration.get('id'))
                    }
                >
                    Re-activate integration
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
