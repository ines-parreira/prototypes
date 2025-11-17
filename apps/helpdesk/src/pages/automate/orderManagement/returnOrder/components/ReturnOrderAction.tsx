import React, { useMemo, useRef, useState } from 'react'

import classnames from 'classnames'

import loopReturns from 'assets/img/integrations/loop-returns.png'
import type { ReturnAction } from 'models/selfServiceConfiguration/types'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import Alert from 'pages/common/components/Alert/Alert'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import { DEFAULT_RETURN_ACTION } from '../constants'
import useLoopReturnsIntegrations from '../hooks/useLoopReturnsIntegrations'
import LoopReturnsIntegrationCreateModal from './LoopReturnsIntegrationCreateModal'
import ReturnOrderAutomatedResponseAction from './ReturnOrderAutomatedResponseAction'

import css from './ReturnOrderAction.less'

type Props = {
    action: ReturnAction
    onChange: (action: ReturnAction) => void
}

const LoopReturnsIcon = ({ className }: { className?: string }) => (
    <img
        className={classnames(css.loopReturnsIcon, className)}
        src={loopReturns}
        alt="Loop Returns"
        width={20}
        height={20}
    />
)

const ReturnOrderAction = ({ action, onChange }: Props) => {
    const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const loopReturnsIntegrations = useLoopReturnsIntegrations()

    const label = useMemo(() => {
        switch (action.type) {
            case ReturnActionType.AutomatedResponse:
                return 'Automated response'
            case ReturnActionType.LoopReturns:
                return loopReturnsIntegrations.find(
                    (integration) => integration.id === action.integrationId,
                )!.name
        }
    }, [action, loopReturnsIntegrations])
    const prefix = useMemo(() => {
        switch (action.type) {
            case ReturnActionType.LoopReturns:
                return <LoopReturnsIcon />
            default:
                return undefined
        }
    }, [action.type])
    const value = useMemo(() => {
        switch (action.type) {
            case ReturnActionType.AutomatedResponse:
                return action.type
            case ReturnActionType.LoopReturns:
                return `${action.type}:${action.integrationId}`
        }
    }, [action])

    const handleItemClick = (nextValue: string, nextAction: ReturnAction) => {
        if (value !== nextValue) {
            onChange(nextAction)
        }
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
            <div className={css.title}>Return method</div>
            <SelectInputBox
                floating={floatingRef}
                label={label}
                onToggle={setIsTypeSelectOpen}
                ref={targetRef}
                prefix={prefix}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isTypeSelectOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                        >
                            <DropdownBody>
                                <DropdownItem
                                    option={{
                                        label: 'Automated response',
                                        value: ReturnActionType.AutomatedResponse,
                                    }}
                                    onClick={(value) => {
                                        handleItemClick(
                                            value,
                                            DEFAULT_RETURN_ACTION,
                                        )
                                    }}
                                    shouldCloseOnSelect
                                />
                                {loopReturnsIntegrations.map((integration) => (
                                    <DropdownItem
                                        key={integration.id}
                                        option={{
                                            label: integration.name,
                                            value: `${ReturnActionType.LoopReturns}:${integration.id}`,
                                        }}
                                        onClick={(value) => {
                                            handleItemClick(value, {
                                                type: ReturnActionType.LoopReturns,
                                                integrationId: integration.id,
                                            })
                                        }}
                                        shouldCloseOnSelect
                                    >
                                        <LoopReturnsIcon
                                            className={css.loopReturnsItemIcon}
                                        />
                                        {integration.name}
                                    </DropdownItem>
                                ))}
                                <DropdownItem
                                    className={css.createLoopReturnsItem}
                                    option={{
                                        label: 'Create new Loop Returns integration',
                                        value: false,
                                    }}
                                    onClick={() => {
                                        setIsModalOpen(true)
                                    }}
                                    shouldCloseOnSelect
                                >
                                    <i
                                        className={classnames(
                                            'material-icons',
                                            css.createLoopReturnsItemIcon,
                                        )}
                                    >
                                        add
                                    </i>
                                    Create new Loop Returns integration
                                </DropdownItem>
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            {action.type === ReturnActionType.AutomatedResponse && (
                <ReturnOrderAutomatedResponseAction
                    responseMessageContent={action.responseMessageContent}
                    onChange={(responseMessageContent) => {
                        onChange({
                            ...action,
                            responseMessageContent: responseMessageContent,
                        })
                    }}
                />
            )}
            {action.type === ReturnActionType.LoopReturns && (
                <Alert className={css.loopReturnsAlert} icon>
                    When customers click return, the selected portal will
                    automatically open in a new tab.
                </Alert>
            )}
            <LoopReturnsIntegrationCreateModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                }}
                onCreate={handleLoopReturnsIntegrationCreate}
            />
        </>
    )
}

export default ReturnOrderAction
