import {useCallback, useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {logEvent, SegmentEvent} from 'common/segment'
import {submitSetting} from 'state/currentAccount/actions'
import {getAutoMergeSettings} from 'state/currentAccount/selectors'
import {defaultAutoMergeSettings} from 'pages/settings/autoMerge/constants'
import {AccountSetting, AccountSettingType} from 'state/currentAccount/types'

export default function useAutoMergeSettings() {
    const dispatch = useAppDispatch()
    const autoMergeSettings = useAppSelector(getAutoMergeSettings)

    const initialAutoMergeSettings = useMemo(
        () => autoMergeSettings?.data?.tickets || defaultAutoMergeSettings,
        [autoMergeSettings]
    )

    const saveAutoMergeSettings = useCallback(
        async ({enabled, merging_window_days}) => {
            const payload = {
                id: autoMergeSettings?.id,
                type: AccountSettingType.AutoMerge,
                data: {
                    tickets: {
                        enabled,
                        merging_window_days,
                    },
                },
            } as unknown as AccountSetting

            await dispatch(submitSetting(payload))

            logEvent(SegmentEvent.AutoMergeSettingsUpdated, payload)
        },
        [autoMergeSettings, dispatch]
    )

    return {
        initialAutoMergeSettings,
        saveAutoMergeSettings,
    }
}
