import React, { ReactNode, useMemo, useState } from 'react'

import {
    DeleteTriggerFn,
    UpdateTriggerFn,
} from 'pages/convert/campaigns/types/AdvancedTriggerBaseProps'
import { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'

import TriggersContext from './context'

type Props = {
    children: ReactNode
    triggers: Record<string, CampaignTrigger>
    onUpdateTrigger: UpdateTriggerFn
    onDeleteTrigger: DeleteTriggerFn
}

export const TriggersProvider = ({
    children,
    triggers,
    onUpdateTrigger,
    onDeleteTrigger,
}: Props): JSX.Element => {
    const [triggersValidation, setTriggersValidation] = useState<
        Record<string, boolean | undefined>
    >({})

    const onTriggerValidationUpdate = (triggerId: string, isValid: boolean) => {
        setTriggersValidation((prevState) => ({
            ...prevState,
            [triggerId]: isValid,
        }))
    }

    const onDeleteWrapper = (triggerId: string) => {
        const trigger = triggers[triggerId]
        if (trigger && trigger.id in triggersValidation) {
            setTriggersValidation((prevState) => {
                const { [trigger.id]: __, ...rest } = prevState
                return rest
            })
        }
        onDeleteTrigger(triggerId)
    }

    const areTriggersValid = useMemo<boolean>(() => {
        return Object.values(triggersValidation).every((value) =>
            value === undefined ? true : Boolean(value),
        )
    }, [triggersValidation])

    return (
        <TriggersContext.Provider
            value={{
                triggers,
                onUpdateTrigger,
                onDeleteTrigger: onDeleteWrapper,
                onTriggerValidationUpdate,
                areTriggersValid,
            }}
        >
            {children}
        </TriggersContext.Provider>
    )
}
