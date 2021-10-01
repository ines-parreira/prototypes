import React from 'react'
import {useAsyncFn} from 'react-use'
import {FormGroup, Label} from 'reactstrap'

import ToggleButton from '../../../../common/components/ToggleButton'
import {useHelpcenterApi} from '../../hooks/useHelpcenterApi'
import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {helpCenterUpdated} from '../../../../../state/entities/helpCenters/actions'
import {notify} from '../../../../../state/notifications/actions'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'
import {Components} from '../../../../../../../../rest_api/help_center_api/client.generated'

type Props = {
    activated: boolean
    label: string
    description: string
    fieldName: keyof Components.Schemas.UpdateHelpcenterDto
}

export const UpdateToggle = ({
    activated,
    label,
    description,
    fieldName,
}: Props) => {
    const {client} = useHelpcenterApi()
    const helpCenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()

    const [{loading}, toggle] = useAsyncFn(
        async (toggleValue: boolean) => {
            if (client) {
                try {
                    const {data} = await client.updateHelpCenter(
                        {help_center_id: helpCenterId},
                        {[fieldName]: !toggleValue}
                    )
                    void dispatch(helpCenterUpdated(data))
                    void dispatch(
                        notify({
                            message: 'Help Center successfully updated',
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (err) {
                    console.error(err)

                    void dispatch(
                        notify({
                            message: "Couldn't update the Help Center",
                            status: NotificationStatus.Error,
                        })
                    )
                }
            }
        },
        [client]
    )

    return (
        <FormGroup>
            <div className="d-flex">
                <ToggleButton
                    value={activated}
                    onChange={toggle}
                    loading={loading}
                    disabled={loading}
                />
                <Label className="control-label ml-2">{label}</Label>
            </div>
            <p>{description}</p>
        </FormGroup>
    )
}

export default UpdateToggle
