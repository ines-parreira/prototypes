import { useMemo, useState } from 'react'

import { ListItem, SelectField, Text } from '@gorgias/axiom'

import loopReturns from 'assets/img/integrations/loop-returns.png'
import type { ReturnAction } from 'models/selfServiceConfiguration/types'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'

import { DEFAULT_RETURN_ACTION } from '../../../legacy/returnOrder/constants'
import { useLoopReturnsIntegrations } from '../hooks/useLoopReturnsIntegrations'
import { LoopReturnsIntegrationCreateModal } from './LoopReturnsIntegrationCreateModal'
import { ReturnOrderAutomatedResponseAction } from './ReturnOrderAutomatedResponseAction'

import css from './ReturnOrderAction.less'

type ActionOption = {
    id: string
    label: string
    icon?: string
    isCreateAction?: boolean
}

type Props = {
    action: ReturnAction
    onChange: (action: ReturnAction) => void
}

const AUTOMATED_RESPONSE_ID = ReturnActionType.AutomatedResponse
const CREATE_LOOP_RETURNS_ID = '__create_loop_returns__'

export const ReturnOrderAction = ({ action, onChange }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const loopReturnsIntegrations = useLoopReturnsIntegrations()

    const items: ActionOption[] = useMemo(() => {
        const options: ActionOption[] = [
            {
                id: AUTOMATED_RESPONSE_ID,
                label: 'Automated response',
            },
            ...loopReturnsIntegrations.map((integration) => ({
                id: `${ReturnActionType.LoopReturns}:${integration.id}`,
                label: integration.name,
                icon: loopReturns,
            })),
            {
                id: CREATE_LOOP_RETURNS_ID,
                label: 'Create new Loop Returns integration',
                isCreateAction: true,
            },
        ]
        return options
    }, [loopReturnsIntegrations])

    const selectedItem = useMemo(() => {
        if (action.type === ReturnActionType.AutomatedResponse) {
            return (
                items.find((item) => item.id === AUTOMATED_RESPONSE_ID) ??
                undefined
            )
        }
        if (action.type === ReturnActionType.LoopReturns) {
            return (
                items.find(
                    (item) =>
                        item.id ===
                        `${ReturnActionType.LoopReturns}:${action.integrationId}`,
                ) ?? undefined
            )
        }
        return undefined
    }, [action, items])

    const handleChange = (item: ActionOption | undefined) => {
        if (!item) return

        if (item.id === CREATE_LOOP_RETURNS_ID) {
            setIsModalOpen(true)
            return
        }

        if (item.id === AUTOMATED_RESPONSE_ID) {
            onChange(DEFAULT_RETURN_ACTION)
            return
        }

        const integrationId = parseInt(item.id.split(':')[1], 10)
        onChange({
            type: ReturnActionType.LoopReturns,
            integrationId,
        })
    }

    const handleLoopReturnsIntegrationCreate = () => {
        const newIntegration = loopReturnsIntegrations.reduce(
            (prevIntegration, integration) =>
                integration.id > prevIntegration.id
                    ? integration
                    : prevIntegration,
        )

        onChange({
            type: ReturnActionType.LoopReturns,
            integrationId: newIntegration.id,
        })
        setIsModalOpen(false)
    }

    return (
        <>
            <div className={css.section}>
                <Text size="md" variant="medium">
                    Return method
                </Text>
                <SelectField<ActionOption>
                    items={items}
                    value={selectedItem}
                    onChange={handleChange}
                    keyName="id"
                    aria-label="Return method"
                >
                    {(option: ActionOption) => (
                        <ListItem
                            id={option.id}
                            label={option.label}
                            leadingSlot={
                                option.icon ? (
                                    <img
                                        src={option.icon}
                                        alt="Loop Returns"
                                        width={20}
                                        height={20}
                                    />
                                ) : undefined
                            }
                        />
                    )}
                </SelectField>
                {action.type === ReturnActionType.LoopReturns && (
                    <Text size="sm" className={css.loopReturnsInfo}>
                        When a customer clicks Return, the selected portal will
                        automatically open in a new tab.
                    </Text>
                )}
            </div>
            {action.type === ReturnActionType.AutomatedResponse && (
                <ReturnOrderAutomatedResponseAction
                    responseMessageContent={action.responseMessageContent}
                    onChange={(responseMessageContent) => {
                        onChange({
                            ...action,
                            responseMessageContent,
                        })
                    }}
                />
            )}
            <LoopReturnsIntegrationCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleLoopReturnsIntegrationCreate}
            />
        </>
    )
}
