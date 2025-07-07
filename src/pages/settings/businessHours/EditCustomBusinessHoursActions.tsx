import { noop } from 'lodash'
import { Link } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FormSubmitButton } from 'core/forms'
import Actions from 'pages/common/components/Actions/Actions'
import ActionsGroup from 'pages/common/components/Actions/ActionsGroup'
import ConfirmButtonWithModal from 'pages/common/components/button/ConfirmButtonWithModal'

import { BUSINESS_HOURS_BASE_URL } from './constants'

export default function EditCustomBusinessHoursActions() {
    return (
        <Actions>
            <ActionsGroup>
                <FormSubmitButton>Save changes</FormSubmitButton>
                <Link to={BUSINESS_HOURS_BASE_URL}>
                    <Button intent="secondary">Cancel</Button>
                </Link>
            </ActionsGroup>
            <ConfirmButtonWithModal
                intent="destructive"
                fillStyle="ghost"
                leadingIcon="delete_outline"
                confirmationButtonIntent="destructive"
                confirmLabel="Delete"
                confirmationTitle="Delete business hours?"
                confirmationContent={
                    <>
                        <p>
                            {/* TODO: Add business hours name */}
                            Are you sure you want to delete these custom
                            business hours?
                        </p>
                        <p>
                            The custom schedule will be deleted and all
                            integrations assigned to it will revert to default
                            business hours.
                        </p>
                    </>
                }
                onConfirm={noop}
                onCancel={noop}
            >
                Delete business hours
            </ConfirmButtonWithModal>
        </Actions>
    )
}
