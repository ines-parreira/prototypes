import {useCallback, useEffect, useMemo, useState} from 'react'
import {produce} from 'immer'

import {ulid} from 'ulidx'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {createTrigger} from '../utils/createTrigger'
import {isAllowedToUpdateTrigger} from '../utils/isAllowedToUpdateTrigger'

import {CampaignTriggerMap} from '../types/CampaignTriggerMap'
import {CampaignTriggerType} from '../types/enums/CampaignTriggerType.enum'
import {
    CreateTriggerFn,
    DeleteTriggerFn,
    UpdateTriggerFn,
} from '../types/AdvancedTriggerBaseProps'
import {CampaignTrigger} from '../types/CampaignTrigger'

export function useManageTriggers(defaultTriggers: CampaignTrigger[] = []) {
    const isConvertSubscriber = useIsConvertSubscriber()

    const defaultTrigger = useMemo(() => {
        return createTrigger(CampaignTriggerType.CurrentUrl)
    }, [])

    const [triggers, updateTriggers] = useState<CampaignTriggerMap>({
        [defaultTrigger.id]: defaultTrigger,
    })

    useEffect(() => {
        if (defaultTriggers.length > 0) {
            const nextTriggers = defaultTriggers.reduce((acc, trigger) => {
                const id = ulid()
                return {
                    ...acc,
                    [id.toString()]: trigger,
                }
            }, {})
            updateTriggers(nextTriggers)
        }
    }, [defaultTriggers])

    const addTrigger = useCallback<CreateTriggerFn>(
        (type, payload) => {
            const newId = ulid()
            const newTrigger = payload ?? createTrigger(type)

            const isAllowedToEdit = isAllowedToUpdateTrigger(
                newTrigger,
                isConvertSubscriber
            )

            if (!isAllowedToEdit) return

            updateTriggers(
                produce(triggers, (draft) => {
                    draft[newId] = newTrigger
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
