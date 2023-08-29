import {useCallback, useMemo, useState} from 'react'
import {produce} from 'immer'

import {CampaignStepsKeys, isCampaignStepsKeys} from '../types/CampaignSteps'

export function usePristineSteps() {
    const [pristine, setPristine] = useState<
        Record<CampaignStepsKeys, boolean>
    >({
        basics: true,
        audience: true,
        message: true,
    })

    const onChangePristine = useCallback(
        (expandedItem: string | null) => {
            if (!isCampaignStepsKeys(expandedItem)) return

            if (pristine[expandedItem]) {
                setPristine(
                    produce((draft) => {
                        draft[expandedItem] = false
                    })
                )
            }
        },
        [pristine]
    )

    const api = useMemo(
        () => ({
            pristine,
            onChangePristine,
        }),
        [onChangePristine, pristine]
    )

    return api
}
