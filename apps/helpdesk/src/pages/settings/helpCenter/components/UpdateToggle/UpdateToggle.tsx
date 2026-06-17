import { reportError } from '@repo/logging'
import { toast } from '@gorgias/axiom'
import { useAsyncFn } from '@gorgias/toolkit-react'

import { useAppDispatch } from 'hooks/useAppDispatch'
import type { UpdateHelpCenterDto } from 'models/helpCenter/types'
import { ToggleInput } from 'pages/common/forms/ToggleInput'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useHelpCenterIdParam } from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import { helpCenterUpdated } from 'state/entities/helpCenter/helpCenters/actions'

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
    const { client } = useHelpCenterApi()
    const helpCenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()

    const [{ loading }, toggle] = useAsyncFn(
        async (toggleValue: boolean) => {
            if (client) {
                try {
                    const { data } = await client.updateHelpCenter(
                        { help_center_id: helpCenterId },
                        { [fieldName]: !toggleValue },
                    )
                    void dispatch(helpCenterUpdated(data))
                    toast.success('Help Center updated with success')
                } catch (err) {
                    reportError(err as Error)

                    toast.error('Failed to update the Help Center')
                }
            }
        },
        [client],
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
