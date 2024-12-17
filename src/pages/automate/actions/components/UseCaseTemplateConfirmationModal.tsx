import React, {useState, useMemo} from 'react'

import {useParams, useHistory} from 'react-router-dom'

import {ulid} from 'ulidx'

import orderSelectionIcon from 'assets/img/workflows/icons/order-selection-sm-neutral.svg'
import {useGetWorkflowConfigurationTemplateByIds} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import {getOperatorListByVariable} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/constants'
import {
    ConditionKey,
    VarSchema,
} from 'pages/automate/workflows/models/conditions.types'
import {buildWorkflowVariableFromTrigger} from 'pages/automate/workflows/models/variables.model'
import {WorkflowVariable} from 'pages/automate/workflows/models/variables.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Button from 'pages/common/components/button/Button'
import {Chip} from 'pages/common/components/Chip'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import useUpsertAction from '../hooks/useUpsertAction'

import {
    TemplateConfiguration,
    ActionAppConfigurationReusableLlmPromptCallStep,
    StoreWorkflowsConfiguration,
} from '../types'
import css from './UseCaseTemplateConfirmationModal.less'
import UseCaseTemplateConfirmationStep from './UseCaseTemplateConfirmationStep'

type Props = {
    templateConfiguration: TemplateConfiguration
    setOpen: (isOpen: boolean) => void
    isOpen: boolean
}

export default function UseCaseTemplateConfirmationModal({
    templateConfiguration,
    isOpen,
    setOpen,
}: Props) {
    const history = useHistory()
    const {name, steps} = templateConfiguration
    const [step, setStep] = useState<'selection' | 'confirmation'>('selection')
    const {apps} = useApps()

    const {shopName, shopType} = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()

    const {mutate: upsertAction, isLoading: isActionUpserting} =
        useUpsertAction('create', shopName, shopType)

    const llmPromptSteps = steps.filter(
        (step): step is ActionAppConfigurationReusableLlmPromptCallStep =>
            step.kind === 'reusable-llm-prompt-call'
    )

    const llmPromptStepIds = llmPromptSteps.map(
        (step) => step.settings.configuration_id
    )

    const llmPromptsStepsConfiguration =
        useGetWorkflowConfigurationTemplateByIds(llmPromptStepIds, {
            enabled: isOpen,
        })

    const [selectedStepId, setSelectedStepId] = useState<
        ActionAppConfigurationReusableLlmPromptCallStep['id'][]
    >([])

    const handleSelectStep = (step: string) => {
        if (selectedStepId.includes(step)) {
            setSelectedStepId(selectedStepId.filter((id) => id !== step))
        } else {
            setSelectedStepId([...selectedStepId, step])
        }
    }

    const isConfirmationRequired = useMemo(
        () =>
            templateConfiguration.entrypoints[0].kind === 'llm-conversation' &&
            templateConfiguration.entrypoints[0].settings.requires_confirmation,

        [templateConfiguration.entrypoints]
    )

    const availableVariables = useMemo(() => {
        const graph = transformWorkflowConfigurationIntoVisualBuilderGraph(
            templateConfiguration as WorkflowConfiguration
        )
        const triggerVariable = buildWorkflowVariableFromTrigger(graph)

        const availableVariables: WorkflowVariable[] = []

        if (triggerVariable) {
            if (Array.isArray(triggerVariable)) {
                const orderSelectionVariables = triggerVariable.find(
                    (variable) => variable.nodeType === 'order_selection'
                )
                if (
                    orderSelectionVariables &&
                    'variables' in orderSelectionVariables
                ) {
                    for (const variable of orderSelectionVariables.variables) {
                        availableVariables.push(variable as WorkflowVariable)
                    }
                }
            }
        }
        return availableVariables
    }, [templateConfiguration])

    const orderTriggerMessage = useMemo(() => {
        const trigger = templateConfiguration.triggers?.[0]
        if (trigger?.kind === 'llm-prompt' && trigger.settings.conditions) {
            const conditions = trigger.settings.conditions

            if (!conditions) return

            const orderTriggerMessage: string[] = []
            availableVariables.forEach((variable) => {
                if (
                    variable.nodeType === 'order_selection' &&
                    trigger.settings.conditions
                ) {
                    const valueObject = Object.values(
                        trigger.settings.conditions
                    )[0]

                    const matchingCondition = valueObject.find((value) => {
                        const conditionSchema = Object.values(value)[0] as [
                            VarSchema,
                            string,
                        ]
                        return conditionSchema[0].var === variable.value
                    })

                    if (!matchingCondition) return
                    const matchingConditionKey = Object.keys(
                        matchingCondition
                    )[0] as ConditionKey

                    const machingConditionSchema = Object.values(
                        matchingCondition
                    )[0] as [VarSchema, string]

                    const operatorsForVariable =
                        getOperatorListByVariable(variable)

                    const matchingOperator = operatorsForVariable.find(
                        (operator) => operator.key === matchingConditionKey
                    )
                    const conditionText =
                        matchingOperator?.label.toLocaleLowerCase() || ''

                    if (
                        variable.type === 'string' ||
                        variable.type === 'number'
                    ) {
                        orderTriggerMessage.push(
                            `${variable.name} ${conditionText} ${machingConditionSchema[1]}`
                        )
                    }
                }
            })
            return orderTriggerMessage
        }
    }, [availableVariables, templateConfiguration.triggers])

    const handleCloseModal = () => {
        setOpen(false)
        setSelectedStepId([])
        setStep('selection')
    }

    const handleCreateAndEnable = () => {
        const newTemplateConfiguration: WorkflowConfiguration = {
            id: ulid(),
            internal_id: ulid(),
            name: templateConfiguration.name,
            initial_step_id: null,
            available_languages: [],
            is_draft: false,
            entrypoints: templateConfiguration.entrypoints,
            triggers: templateConfiguration.triggers,
            steps: templateConfiguration.steps.filter((step) =>
                selectedStepId.includes(step.id)
            ) as WorkflowConfiguration['steps'],
            transitions: [],
        }

        upsertAction([
            {
                internal_id: newTemplateConfiguration.internal_id,
                store_name: shopName,
                store_type: shopType,
            },
            newTemplateConfiguration as StoreWorkflowsConfiguration,
        ])

        handleCloseModal()
        history.push(`/app/automation/${shopType}/${shopName}/ai-agent/actions`)
    }

    const handleCustomize = () => {
        history.push(
            `${history.location.pathname}/new?template_id="${templateConfiguration.id}"&step_id="${selectedStepId.join(',')}"`
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="medium">
            <ModalHeader title={name} />
            <ModalBody className={css.modalBody}>
                {step === 'selection' ? (
                    <div className={css.selectionBody}>
                        <p>
                            First, select the apps you need to perform this
                            Action
                        </p>
                        <div className={css.stepChips}>
                            {llmPromptStepIds.map((stepId) => {
                                const query = llmPromptsStepsConfiguration.find(
                                    (step) => step.data?.id === stepId
                                )
                                const isStepSelected =
                                    selectedStepId.includes(stepId)

                                const app = query?.data?.apps[0]

                                const matchedApp = apps.find(({id, type}) =>
                                    app?.type === 'app'
                                        ? type === 'app' && id === app.app_id
                                        : type === app?.type
                                )

                                if (!matchedApp?.name) return null

                                return (
                                    <Chip
                                        key={stepId}
                                        id={stepId}
                                        label={matchedApp.name}
                                        isActive={isStepSelected}
                                        onClick={() => handleSelectStep(stepId)}
                                    ></Chip>
                                )
                            })}
                        </div>
                        <div data-candu-id="action-libray-use-cases-modal"></div>
                    </div>
                ) : (
                    <div className={css.confirmationBody}>
                        <div className={css.confirmationHeader}>
                            <p>AI Agent will perform the following steps</p>
                            {selectedStepId.map((stepId) => {
                                const query = llmPromptsStepsConfiguration.find(
                                    (step) => step.data?.id === stepId
                                )

                                if (!query?.data) return null

                                return (
                                    <UseCaseTemplateConfirmationStep
                                        key={stepId}
                                        name={name}
                                        app={query.data.apps[0]}
                                    />
                                )
                            })}
                        </div>
                        <div className={css.conditionsList}>
                            <p>Action conditions</p>
                            {orderTriggerMessage?.map((message) => {
                                return (
                                    <div key={message}>
                                        <img
                                            src={orderSelectionIcon}
                                            alt="Order Selection Icon"
                                        />
                                        {message}
                                    </div>
                                )
                            })}
                            {isConfirmationRequired && (
                                <div>
                                    <i className="material-icons rounded">
                                        check_circle
                                    </i>
                                    AI Agent will always ask for customer
                                    confirmation before performing the Action
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ModalBody>
            <ModalActionsFooter
                extra={
                    <>
                        {step === 'confirmation' && (
                            <Button
                                fillStyle="fill"
                                intent="secondary"
                                isDisabled={isActionUpserting}
                                onClick={() => setStep('selection')}
                            >
                                Back
                            </Button>
                        )}
                    </>
                }
            >
                {step === 'selection' ? (
                    <div className={css.buttonGroup}>
                        <Button intent="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button
                            intent="primary"
                            isDisabled={selectedStepId.length === 0}
                            onClick={() => setStep('confirmation')}
                        >
                            Continue
                        </Button>
                    </div>
                ) : (
                    <div className={css.buttonGroup}>
                        <Button
                            intent="primary"
                            fillStyle="ghost"
                            onClick={handleCustomize}
                            isDisabled={isActionUpserting}
                            leadingIcon="edit"
                        >
                            Customize
                        </Button>
                        <Button
                            intent="primary"
                            isDisabled={isActionUpserting}
                            onClick={handleCreateAndEnable}
                            leadingIcon="play_arrow"
                        >
                            Create and enable
                        </Button>
                    </div>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}
