import {fromJS} from 'immutable'
import React, {useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAsyncFn from 'hooks/useAsyncFn'
import {AircallIntegration} from 'models/integration/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {formatPhoneNumberInternational} from 'pages/phoneNumbers/utils'
import {
    deleteIntegration,
    activateIntegration,
    deactivateIntegration,
} from 'state/integrations/actions'

type Props = {
    integration: AircallIntegration
}

export default function AircallIntegrationListItem({
    integration,
}: Props): JSX.Element {
    const [isDisabled, setIsDisabled] = useState(
        integration.deactivated_datetime !== null
    )

    const dispatch = useAppDispatch()

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        await dispatch(deleteIntegration(fromJS(integration)))
    }, [integration, dispatch])

    const handleToggle = () => {
        setIsDisabled(!isDisabled)
        return isDisabled
            ? dispatch(activateIntegration(integration.id))
            : dispatch(deactivateIntegration(integration.id))
    }

    return (
        <tr>
            <td className="smallest align-middle">
                <ToggleInput isToggled={!isDisabled} onClick={handleToggle} />
            </td>
            <td className="align-middle link-full-td">
                <div className="cell-content">
                    <b className="mr-2">{integration.name}</b>
                    <span className="text-faded">
                        {formatPhoneNumberInternational(
                            integration.meta?.address
                        )}
                    </span>
                </div>
            </td>
            <td>
                <div className="align-middle">
                    <ConfirmButton
                        id={`delete-button-${integration.id}`}
                        className="float-right"
                        intent="destructive"
                        isDisabled={isDeleting || isDisabled}
                        isLoading={isDeleting}
                        onConfirm={handleDelete}
                        confirmationContent={
                            <div>
                                To ensure this integration is fully
                                disconnected, please check that you have removed
                                the Gorgias integration from within{' '}
                                <a
                                    href="https://dashboard-v2.aircall.io/integrations"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <b>your Aircall dashboard</b>
                                </a>{' '}
                                before deleting your Aircall integration in
                                Gorgias.
                            </div>
                        }
                    >
                        <ButtonIconLabel icon="delete">
                            Delete integration
                        </ButtonIconLabel>
                    </ConfirmButton>
                </div>
            </td>
        </tr>
    )
}
