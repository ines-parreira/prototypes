import {useCallback, useMemo, useState} from 'react'

import {AccountSettingAutoMerge} from 'state/currentAccount/types'
import {defaultAutoMergeSettings} from 'pages/settings/autoMerge/constants'

export default function useAutoMerge(
    initialAutoMergeSettings?: AccountSettingAutoMerge['data']['tickets']
) {
    const [state, setState] = useState<
        NonNullable<AccountSettingAutoMerge['data']['tickets']>
    >(initialAutoMergeSettings || defaultAutoMergeSettings)

    const onChangeEnabled = useCallback((enabled: boolean) => {
        setState((state) => ({
            ...state,
            enabled,
        }))
    }, [])

    const onChangeMergingWindowDays = useCallback(
        (merging_window_days: number) => {
            setState((state) => ({
                ...state,
                merging_window_days,
            }))
        },
        []
    )

    return useMemo(
        () => ({
            ...state,
            onChangeEnabled,
            onChangeMergingWindowDays,
        }),
        [state, onChangeEnabled, onChangeMergingWindowDays]
    )
}
