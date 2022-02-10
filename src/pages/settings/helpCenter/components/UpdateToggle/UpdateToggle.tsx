import React from 'react'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import {UpdateHelpCenterDto} from 'models/helpCenter/types'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {helpCenterUpdated} from 'state/entities/helpCenters/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {useHelpCenterApi} from '../../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'

import css from './UpdateToggle.less'

type Props = {
    activated: boolean
    label: string
    description: string
    fieldName: keyof UpdateHelpCenterDto
}

export const UpdateToggle = ({
    activated,
    label,
    description,
    fieldName,
}: Props) => {
    const {client} = useHelpCenterApi()
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
                            message: 'Help Center updated with success',
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (err) {
                    console.error(err)

                    void dispatch(
                        notify({
                            message: 'Failed to update the Help Center',
                            status: NotificationStatus.Error,
                        })
                    )
                }
            }
        },
        [client]
    )

    return (
        <ToggleInput
            isToggled={activated}
            onClick={toggle}
            isLoading={loading}
            isDisabled={loading}
            className={css.toggle}
            caption={description}
        >
            {label}
        </ToggleInput>
    )
}

export default UpdateToggle
