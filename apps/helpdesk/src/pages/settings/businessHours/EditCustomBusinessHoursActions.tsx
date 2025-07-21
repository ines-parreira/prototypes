import { Link } from 'react-router-dom'

import { BusinessHoursDetails } from '@gorgias/helpdesk-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import { FormSubmitButton } from 'core/forms'
import FormActions from 'core/forms/components/FormActions'
import FormActionsGroup from 'core/forms/components/FormActionsGroup'
import useDeleteCustomBusinessHours from 'hooks/businessHours/useDeleteCustomBusinessHours'
import ConfirmButtonWithModal from 'pages/common/components/button/ConfirmButtonWithModal'

import { BUSINESS_HOURS_BASE_URL } from './constants'

type Props = {
    businessHours: BusinessHoursDetails
    isLoading?: boolean
}

export default function EditCustomBusinessHoursActions({
    businessHours,
    isLoading,
}: Props) {
    const { mutate: deleteBusinessHours, isLoading: isDeleting } =
        useDeleteCustomBusinessHours(businessHours)

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
                isLoading={isDeleting}
                intent="destructive"
                fillStyle="ghost"
                leadingIcon="delete_outline"
                confirmationButtonIntent="destructive"
                confirmLabel="Delete"
                confirmationTitle="Delete business hours?"
                confirmationContent={
                    <>
                        <p>
                            Are you sure you want to delete{' '}
                            <strong>{businessHours.name}</strong> custom
                            business hours?
                        </p>
                        <p>
                            The custom schedule will be deleted and all
                            integrations assigned to it will revert to default
                            business hours.
                        </p>
                    </>
                }
                onConfirm={() => deleteBusinessHours({ id: businessHours.id })}
            >
                Delete business hours
            </ConfirmButtonWithModal>
        </FormActions>
    )
}
