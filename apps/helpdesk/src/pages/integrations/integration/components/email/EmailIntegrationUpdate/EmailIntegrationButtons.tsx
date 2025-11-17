import type React from 'react'

import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import css from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationUpdate.less'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

type EmailIntegrationButtonsProps = {
    hasErrors: boolean
    isDirty: boolean
    isSubmitting: boolean
    isDeleting: boolean
    isDeactivated: boolean
    isGmail: boolean
    onSaveCallback: (e: React.FormEvent) => void
    onCancelCallback: VoidFunction
    onReactivateCallback: (e: React.MouseEvent) => void
    onDeleteCallback: VoidFunction
}

const EmailIntegrationButtons: React.FC<EmailIntegrationButtonsProps> = ({
    hasErrors,
    isDirty,
    isSubmitting,
    isDeleting,
    isDeactivated,
    isGmail,
    onSaveCallback,
    onCancelCallback,
    onReactivateCallback,
    onDeleteCallback,
}) => {
    const isDisabled = !isDirty || isSubmitting || isDeleting || hasErrors

    return (
        <div className={css.buttonsWrapper}>
            <div>
                <Button
                    intent="primary"
                    isDisabled={isDisabled}
                    className={classNames({
                        'btn-loading': isSubmitting,
                    })}
                    onClick={onSaveCallback}
                >
                    Save changes
                </Button>
                <Button
                    intent="secondary"
                    className="ml-2"
                    onClick={onCancelCallback}
                >
                    Cancel
                </Button>
                {isDeactivated && isGmail && (
                    <Button
                        className="ml-2"
                        color="success"
                        onClick={onReactivateCallback}
                    >
                        Re-activate
                    </Button>
                )}
            </div>

            <ConfirmButton
                confirmationTitle="Delete email integration?"
                confirmationButtonIntent="destructive"
                confirmationContent={INTEGRATION_REMOVAL_CONFIGURATION_TEXT}
                intent="destructive"
                fillStyle="ghost"
                leadingIcon="delete"
                onConfirm={onDeleteCallback}
            >
                Delete Integration
            </ConfirmButton>
        </div>
    )
}

export default EmailIntegrationButtons
