import { noop } from 'lodash'
import { Link } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FormSubmitButton } from 'core/forms'
import FormActions from 'core/forms/components/FormActions'
import FormActionsGroup from 'core/forms/components/FormActionsGroup'
import ConfirmButtonWithModal from 'pages/common/components/button/ConfirmButtonWithModal'

import { BUSINESS_HOURS_BASE_URL } from './constants'

type Props = {
    isLoading?: boolean
}

export default function EditCustomBusinessHoursActions({ isLoading }: Props) {
    return (
        <FormActions>
            <FormActionsGroup>
                <FormSubmitButton isLoading={isLoading}>
                    Save changes
                </FormSubmitButton>
                <Link to={BUSINESS_HOURS_BASE_URL}>
                    <Button intent="secondary">Cancel</Button>
                </Link>
            </FormActionsGroup>
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
        </FormActions>
    )
}
