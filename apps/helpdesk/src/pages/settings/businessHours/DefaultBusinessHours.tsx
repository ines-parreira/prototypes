import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import classnames from 'classnames'

import { IconButton } from '@gorgias/axiom'
import {
    queryKeys,
    useListAccountSettings,
    useUpdateAccountSetting,
} from '@gorgias/helpdesk-queries'
import { BusinessHoursTimeframe } from '@gorgias/helpdesk-types'

import { useAppNode } from 'appNode'
import { Drawer } from 'components/Drawer/Drawer'
import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import BusinessHoursDisplay from './BusinessHoursDisplay'
import { DefaultBusinessHoursDrawer } from './DefaultBusinessHoursDrawer'

import settingsCss from '../settings.less'
import css from './DefaultBusinessHours.less'

const DefaultBusinessHours = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const appNode = useAppNode()
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const { data } = useListAccountSettings({ type: 'business-hours' })
    const queryKey = queryKeys.account.listAccountSettings({
        type: 'business-hours',
    })
    const businessHoursSettingsData = data?.data.data[0]
    const value = businessHoursSettingsData?.data as
        | {
              timezone: string
              business_hours: BusinessHoursTimeframe[]
          }
        | undefined

    const { mutate: updateAccountSetting, isLoading: isUpdateLoading } =
        useUpdateAccountSetting({
            mutation: {
                onSettled: () => {
                    void queryClient.invalidateQueries({
                        queryKey,
                    })
                },
                onError: (error) => {
                    void dispatch(
                        notify({
                            message:
                                (error as GorgiasApiError).response?.data?.error
                                    ?.msg ??
                                'Something went wrong, please try again',
                            status: NotificationStatus.Error,
                        }),
                    )
                },
                onSuccess: () => {
                    setIsDrawerOpen(false)
                    void dispatch(
                        notify({
                            message:
                                'Successfully updated default business hours',
                            status: NotificationStatus.Success,
                        }),
                    )
                },
            },
        })

    const onEditClick = () => {
        setIsDrawerOpen(true)
    }

    return (
        <div
            className={classnames(
                'body-regular',
                settingsCss.contentWrapper,
                'mb-5',
            )}
        >
            <div
                className={classnames(settingsCss.inputField, settingsCss.mb32)}
            >
                <div className={css.title}>Default Business Hours</div>
                <div className={css.description}>
                    These hours serve as the default schedule used across
                    Gorgias for all integrations where no custom hours are
                    defined. If no custom hours are specified, the system
                    defaults to treating all time as outside business hours.
                </div>
                <div className={css.businessHours}>
                    <BusinessHoursDisplay />
                    <div className={css.cell}>{value?.timezone}</div>
                    <IconButton
                        className={css.edit}
                        icon="edit"
                        intent="secondary"
                        size="small"
                        fillStyle="ghost"
                        onClick={onEditClick}
                        aria-label="Edit default business hours"
                    />
                </div>
            </div>
            <Drawer.Root
                container={appNode}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                direction="right"
                handleOnly
                modal
            >
                <Drawer.Portal>
                    <Drawer.Overlay className={css.overlay} />
                    <DefaultBusinessHoursDrawer
                        businessHoursSettingsData={businessHoursSettingsData}
                        updateAccountSetting={updateAccountSetting}
                        setIsDrawerOpen={setIsDrawerOpen}
                        isLoading={isUpdateLoading}
                    />
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    )
}

export default DefaultBusinessHours
