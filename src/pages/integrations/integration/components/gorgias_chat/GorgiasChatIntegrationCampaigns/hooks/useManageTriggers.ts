import {useCallback, useEffect, useMemo, useState} from 'react'
import {produce} from 'immer'
import _uniqueId from 'lodash/uniqueId'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {createTrigger} from '../utils/createTrigger'
import {isAllowedToUpdateTrigger} from '../utils/isAllowedToUpdateTrigger'

import {CampaignTriggerMap} from '../types/CampaignTriggerMap'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'
import {
    CreateTriggerFn,
    DeleteTriggerFn,
    UpdateTriggerFn,
} from '../types/AdvancedTriggerBaseProps'
import {CampaignTrigger} from '../types/CampaignTrigger'

export function useManageTriggers(defaultTriggers: CampaignTrigger[] = []) {
    const isConvertSubscriber = useIsConvertSubscriber()
    const [triggers, updateTriggers] = useState<CampaignTriggerMap>({
        [_uniqueId()]: createTrigger(CampaignTriggerKey.CurrentUrl),
    })

    useEffect(() => {
        if (defaultTriggers.length > 0) {
            const nextTriggers = defaultTriggers.reduce((acc, trigger) => {
                const id = _uniqueId()
                return {
                    ...acc,
                    [id.toString()]: trigger,
                }
            }, {})
            updateTriggers(nextTriggers)
        }
    }, [defaultTriggers])

    const addTrigger = useCallback<CreateTriggerFn>(
        (key, payload) => {
            const newKey = _uniqueId()
            const newTrigger = payload ?? createTrigger(key)

            const isAllowedToEdit = isAllowedToUpdateTrigger(
                newTrigger,
                isConvertSubscriber
            )

            if (!isAllowedToEdit) return

            updateTriggers(
                produce(triggers, (draft) => {
                    draft[newKey] = newTrigger
                })
            )
        },
        [isConvertSubscriber, triggers, updateTriggers]
    )

    const updateTrigger = useCallback<UpdateTriggerFn>(
        (triggerId, payload) => {
            const currentTrigger = triggers[triggerId]
            const isAllowedToEdit = isAllowedToUpdateTrigger(
                currentTrigger,
                isConvertSubscriber
            )

            if (!isAllowedToEdit) return

            updateTriggers(
                produce(triggers, (draft) => {
                    if (draft[triggerId]) {
                        if (payload.operator) {
                            draft[triggerId].operator = payload.operator
                        }
                        if (payload.value) {
                            draft[triggerId].value = payload.value
                        }
                    }
                })
            )
        },
        [isConvertSubscriber, triggers, updateTriggers]
    )

    const deleteTrigger = useCallback<DeleteTriggerFn>(
        (triggerId) => {
            const currentTrigger = triggers[triggerId]
            const isAllowedToEdit = isAllowedToUpdateTrigger(
                currentTrigger,
                isConvertSubscriber
            )

            if (!isAllowedToEdit) return

            updateTriggers(
                produce(triggers, (draft) => {
                    if (draft[triggerId]) {
                        delete draft[triggerId]
                    }
                })
            )
        },
        [isConvertSubscriber, triggers, updateTriggers]
    )

    const api = useMemo(
        () => ({
            addTrigger,
            updateTrigger,
            deleteTrigger,
            triggers,
        }),
        [addTrigger, deleteTrigger, triggers, updateTrigger]
    )

    return api
}
