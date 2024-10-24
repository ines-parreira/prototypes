import {produce} from 'immer'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {ulid} from 'ulidx'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {getDefaultTriggers} from 'pages/convert/campaigns/utils/getDefaultTriggers'

import {
    CreateTriggerFn,
    DeleteTriggerFn,
    UpdateTriggerFn,
} from '../types/AdvancedTriggerBaseProps'
import {CampaignTrigger} from '../types/CampaignTrigger'
import {CampaignTriggerMap} from '../types/CampaignTriggerMap'
import {createTrigger} from '../utils/createTrigger'
import {isAllowedToUpdateTrigger} from '../utils/isAllowedToUpdateTrigger'

export function useManageTriggers(defaultTriggers: CampaignTrigger[] = []) {
    const isConvertSubscriber = useIsConvertSubscriber()

    const initialTriggers = useMemo<CampaignTriggerMap>(() => {
        return getDefaultTriggers(isConvertSubscriber)
    }, [isConvertSubscriber])

    const [triggers, updateTriggers] =
        useState<CampaignTriggerMap>(initialTriggers)

    useEffect(() => {
        if (defaultTriggers.length > 0) {
            const nextTriggers = defaultTriggers.reduce((acc, trigger) => {
                const id = ulid()
                return {
                    ...acc,
                    [trigger?.id ?? id.toString()]: trigger,
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

                        // We need to allow '' value
                        draft[triggerId].value = payload.value
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
