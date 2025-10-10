import { useMemo, useRef } from 'react'

import classnames from 'classnames'
import { useParams } from 'react-router-dom'

import { LegacyButton as Button, ToggleField, Tooltip } from '@gorgias/axiom'

import { Accordion } from 'components/Accordion/Accordion'
import ActionsPlatformTemplateConditions from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateConditions'
import ActionsPlatformTemplateConfirmation from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateConfirmation'
import ActionsPlatformTemplateInstructions from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateInstructions'
import ActionsPlatformTemplateName from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateName'
import ActionsPlatformTemplateSteps from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateSteps'
import { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { useGuidanceReferenceContext } from '../providers/GuidanceReferenceContext'
import { SimplifiedStepBuilder } from './SimplifiedStepBuilder'

import css from './ActionFormView.less'

type Props = {
    isTemplate?: boolean
    onEditSteps: () => void
    steps: ActionTemplate[]
    isConditionsRecommendationAlertOpen?: boolean
    onConditionsRecommendationAlertClose?: () => void
}

const ActionFormView = ({
    isTemplate = false,
    onEditSteps,
    steps,
    isConditionsRecommendationAlertOpen,
    onConditionsRecommendationAlertClose,
}: Props) => {
    const { visualBuilderGraph, dispatch, getVariableListForNode } =
        useVisualBuilderContext<LLMPromptTriggerNodeType>()

    const triggerNode = visualBuilderGraph.nodes[0]

    const { canBeDeleted, references } = useGuidanceReferenceContext()
    const variables = useMemo(
        () => getVariableListForNode(triggerNode.id),
        [getVariableListForNode, triggerNode.id],
    )

    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const isAdvanced = visualBuilderGraph.advanced_datetime

    const enabledToggleRef = useRef<HTMLDivElement>(null)
    return (
        <>
            <div className={css.section}>
                <ActionsPlatformTemplateName
                    autoFocus={!isTemplate}
                    value={visualBuilderGraph.name}
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'SET_NAME',
                            name: nextValue,
                        })
                    }}
                    onBlur={() => {
                        dispatch({
                            type: 'SET_TOUCHED',
                            touched: {
                                name: true,
                            },
                        })
                    }}
                    error={visualBuilderGraph.errors?.name}
                />
                <ActionsPlatformTemplateInstructions
                    error={triggerNode.data.errors?.instructions}
                    value={triggerNode.data.instructions}
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS',
                            instructions: nextValue,
                        })
                    }}
                    onBlur={() => {
                        dispatch({
                            type: 'SET_TOUCHED',
                            nodeId: triggerNode.id,
                            touched: {
                                instructions: true,
                            },
                        })
                    }}
                />
            </div>

            <div className={css.section}>
                <ActionsPlatformTemplateConditions
                    variables={variables}
                    type={triggerNode.data.conditionsType}
                    conditions={triggerNode.data.conditions}
                    onConditionDelete={(index) => {
                        dispatch({
                            type: 'DELETE_LLM_PROMPT_TRIGGER_CONDITION',
                            index,
                        })
                    }}
                    onConditionAdd={(condition) => {
                        dispatch({
                            type: 'ADD_LLM_PROMPT_TRIGGER_CONDITION',
                            condition,
                        })
                    }}
                    onConditionTypeChange={(type) => {
                        dispatch({
                            type: 'SET_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
                            conditionsType: type,
                        })
                    }}
                    onConditionChange={(condition, index) => {
                        dispatch({
                            type: 'SET_LLM_PROMPT_TRIGGER_CONDITION',
                            index,
                            condition,
                        })
                    }}
                    onConditionBlur={(index) => {
                        dispatch({
                            type: 'SET_TOUCHED',
                            nodeId: triggerNode.id,
                            touched: {
                                conditions: {
                                    [index]: true,
                                },
                            },
                        })
                    }}
                    errors={triggerNode.data.errors?.conditions}
                    isRecommendationAlertOpen={
                        isConditionsRecommendationAlertOpen
                    }
                    onRecommendationAlertClose={
                        onConditionsRecommendationAlertClose
                    }
                />
                <ActionsPlatformTemplateConfirmation
                    steps={steps}
                    nodes={visualBuilderGraph.nodes}
                    value={triggerNode.data.requires_confirmation}
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION',
                            requiresConfirmation: nextValue,
                        })
                    }}
                />
            </div>

            <div className={classnames(css.section, css.big)}>
                {isAdvanced ? (
                    <ActionsPlatformTemplateSteps
                        error={visualBuilderGraph.errors?.nodes}
                        onEditSteps={onEditSteps}
                    />
                ) : (
                    <SimplifiedStepBuilder
                        graph={visualBuilderGraph}
                        dispatch={dispatch}
                        steps={steps}
                        shopName={shopName}
                        shopType={shopType}
                    />
                )}
                <div className={css.toggle} ref={enabledToggleRef}>
                    <ToggleField
                        value={!triggerNode.data.deactivated_datetime}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_LLM_PROMPT_TRIGGER_DEACTIVATED_DATETIME',
                                deactivated_datetime: nextValue
                                    ? null
                                    : new Date().toISOString(),
                            })
                        }}
                        caption={
                            <div>
                                Enabling will allow AI Agent to perform this
                                Action to resolve customer requests. When
                                enabled, Actions can also be referenced in
                                Guidance to instruct AI Agent how to follow
                                end-to-end processes.
                            </div>
                        }
                        label="Enable Action"
                        isDisabled={!canBeDeleted(visualBuilderGraph.id)}
                    />
                </div>

                {!canBeDeleted(visualBuilderGraph.id) && enabledToggleRef && (
                    <Tooltip placement="top" target={enabledToggleRef}>
                        This Action is currently being used in Guidance. Remove
                        the Action from all Guidance in order to disable.
                    </Tooltip>
                )}
                {references[visualBuilderGraph.id] && (
                    <Accordion.Root>
                        <Accordion.Item value="title">
                            <Accordion.ItemTrigger className={css.trigger}>
                                <Button
                                    fillStyle="ghost"
                                    intent="secondary"
                                    size="medium"
                                    className={css.triggerButton}
                                >
                                    Action is referenced in{' '}
                                    {references[visualBuilderGraph.id].length}{' '}
                                    Guidance
                                    <Accordion.ItemIndicator
                                        className={css.indicator}
                                    >
                                        <i
                                            className={classnames(
                                                css.chevron,
                                                'material-icons',
                                            )}
                                        >
                                            keyboard_arrow_down
                                        </i>
                                    </Accordion.ItemIndicator>
                                </Button>
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                {references[visualBuilderGraph.id].map(
                                    (reference) => (
                                        <div
                                            key={reference.id}
                                            className={css.reference}
                                        >
                                            <a
                                                href={routes.guidanceArticleEdit(
                                                    parseInt(
                                                        reference.sourceId,
                                                    ),
                                                )}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {reference.title}
                                            </a>
                                        </div>
                                    ),
                                )}
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    </Accordion.Root>
                )}
            </div>
        </>
    )
}

export default ActionFormView
