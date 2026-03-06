import React, { useCallback, useMemo } from 'react'

import classNames from 'classnames'
import { ulid } from 'ulidx'

import { LegacyButton as Button } from '@gorgias/axiom'

import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import type { ConditionSchema } from 'pages/automate/workflows/models/conditions.types'
import type { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'
import type {
    ConditionsNodeType,
    VisualBuilderEdge,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import SortableAccordion from 'pages/common/components/accordion/SortableAccordion'
import SortableAccordionItem from 'pages/common/components/accordion/SortableAccordionItem'
import { Drawer } from 'pages/common/components/Drawer'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import InputField from 'pages/common/forms/input/InputField'

import NodeEditorDrawerHeader from '../../NodeEditorDrawerHeader'
import { ConditionsBranchItem } from './ConditionsBranchItem'
import { buildConditionSchemaByVariableType } from './utils'

import css from '../NodeEditor.less'
import conditionsCss from './ConditionsNodeEditor.less'

export default function ConditionsNodeEditor({
    nodeInEdition,
}: {
    nodeInEdition: ConditionsNodeType
}) {
    const { visualBuilderGraph, dispatch, getVariableListForNode } =
        useVisualBuilderContext()

    const edges = visualBuilderGraph.edges.filter(
        (edge) => edge.source === nodeInEdition.id,
    )
    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id],
    )

    const handleAddConditionBranch = () => {
        const edgeId = ulid()

        dispatch({
            type: 'ADD_CONDITIONS_NODE_BRANCH',
            conditionNodeId: nodeInEdition.id,
            edgeId,
        })
        dispatch({
            type: 'ADD_BRANCH_ID_EDITING',
            branchId: edgeId,
        })
    }

    const handleBranchDelete = (edgeId: string) => () => {
        dispatch({
            type: 'DELETE_CONDITIONS_NODE_BRANCH',
            edgeId,
        })
    }

    const handleStepNameChange = (newName: string) => {
        dispatch({
            type: 'UPDATE_CONDITIONS_NODE_NAME',
            nodeId: nodeInEdition.id,
            name: newName,
        })
    }

    const handleConditionChange = (
        branchId: string,
        data: VisualBuilderEdge['data'],
    ) => {
        dispatch({
            type: 'UPDATE_CONDITIONS_NODE_BRANCH',
            nodeId: branchId,
            data: {
                conditions: data?.conditions,
                name: data?.name,
            },
        })
    }

    const handleReorderBranchItems = (newOrder: string[]) => {
        dispatch({
            type: 'REORDER_CONDITIONS_NODE_BRANCHES',
            nodeId: nodeInEdition.id,
            newOrder,
        })
    }

    const handleConditionTypeChange = useCallback(
        (conditions: ConditionSchema[]) =>
            (branchId: string, type: 'and' | 'or' | null) => {
                const branch = edges.find((e) => e.id === branchId)

                if (!branch) return

                dispatch({
                    type: 'UPDATE_CONDITIONS_NODE_BRANCH',
                    nodeId: branch.id,

                    data: {
                        ...branch.data,
                        conditions:
                            type === 'and'
                                ? {
                                      and: conditions,
                                  }
                                : {
                                      or: conditions,
                                  },
                    },
                })
            },
        [edges, dispatch],
    )

    const handleDeleteCondition =
        (branchId: string, type: 'and' | 'or', conditions: ConditionSchema[]) =>
        (conditionIndex: number) => {
            const edge = edges.find((e) => e.id === branchId)

            if (!edge) return

            const updatedConditions = conditions.filter(
                (_, index) => index !== conditionIndex,
            )

            dispatch({
                type: 'UPDATE_CONDITIONS_NODE_BRANCH',
                nodeId: edge.id,
                data: {
                    name: edge?.data?.name,
                    conditions:
                        type === 'and'
                            ? { and: updatedConditions }
                            : { or: updatedConditions },
                },
            })
        }

    const handleVariableSelect =
        (
            item: VisualBuilderEdge,
            type: 'and' | 'or',
            conditions: ConditionSchema[],
        ) =>
        (variable: WorkflowVariable) => {
            const newCondition = buildConditionSchemaByVariableType(
                variable.type,
                variable.value,
            )

            dispatch({
                type: 'UPDATE_CONDITIONS_NODE_BRANCH',
                nodeId: item.id,
                data: {
                    ...item.data,
                    conditions:
                        type === 'and'
                            ? { and: [...conditions, newCondition] }
                            : { or: [...conditions, newCondition] },
                },
            })
        }

    const hasMultipleChildren = (edge: VisualBuilderEdge) => {
        const targetNode = visualBuilderGraph.nodes.find(
            (node) => node.id === edge.target,
        )
        if (targetNode && targetNode.type !== 'end') {
            return true
        }
        return false
    }

    const inProductData = useMemo(() => {
        switch (visualBuilderGraph.nodes[0].type) {
            case 'llm_prompt_trigger':
            case 'reusable_llm_prompt_trigger':
                return {
                    href: ' https://link.gorgias.com/0gm',
                    text: 'Learn About Conditions in Actions',
                }
            default:
                return {
                    href: 'https://link.gorgias.com/noh',
                    text: 'Learn About Conditions in Flows',
                }
        }
    }, [visualBuilderGraph.nodes])

    const branches = edges.slice(0, edges.length - 1)

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content className={conditionsCss.conditions}>
                <ToolbarProvider workflowVariables={workflowVariables}>
                    <div className={css.container}>
                        <a
                            href={inProductData.href}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <i className="material-icons mr-2">menu_book</i>
                            {inProductData.text}
                        </a>

                        <InputField
                            id="conditions"
                            maxLength={50}
                            label={
                                <>
                                    <span>Step name</span>
                                    <HintTooltip title="Used to help you better understand your Flow, not visible to customers." />
                                </>
                            }
                            value={nodeInEdition.data?.name}
                            onChange={handleStepNameChange}
                            className={conditionsCss.input}
                        />
                        <div className={conditionsCss.header}>
                            <i
                                className={classNames(
                                    'material-icons',
                                    conditionsCss.icon,
                                )}
                            >
                                arrow_downward
                            </i>
                            <h4 className={conditionsCss.title}>
                                branches are evaluated in the order below, names
                                not visible to customers
                            </h4>
                        </div>
                        {edges.length > 0 && (
                            <SortableAccordion
                                onReorder={handleReorderBranchItems}
                                expandedItem={
                                    visualBuilderGraph.branchIdsEditing
                                }
                                onChange={(branchIds) => {
                                    dispatch({
                                        type: 'SET_BRANCH_IDS_EDITING',
                                        branchIds,
                                    })
                                }}
                            >
                                {branches.map((item) => {
                                    const type =
                                        item.data?.conditions &&
                                        'or' in item.data.conditions
                                            ? 'or'
                                            : 'and'
                                    const conditions =
                                        item.data?.conditions?.and ??
                                        item.data?.conditions?.or ??
                                        []

                                    if (!conditions) return null

                                    return (
                                        <SortableAccordionItem
                                            id={item.id}
                                            key={item.id}
                                            isDisabled={false}
                                        >
                                            <ConditionsBranchItem
                                                hasMultipleChildren={hasMultipleChildren(
                                                    item,
                                                )}
                                                name={item.data?.name ?? ''}
                                                branchId={item.id}
                                                availableVariables={
                                                    workflowVariables
                                                }
                                                canDeleteBranch={
                                                    item.id !== branches[0].id
                                                }
                                                onConditionDelete={handleDeleteCondition(
                                                    item.id,
                                                    type,
                                                    conditions,
                                                )}
                                                onVariableSelect={handleVariableSelect(
                                                    item,
                                                    type,
                                                    conditions,
                                                )}
                                                onConditionTypeChange={handleConditionTypeChange(
                                                    conditions,
                                                )}
                                                onNameChange={(newName) =>
                                                    handleConditionChange(
                                                        item.id,
                                                        {
                                                            conditions:
                                                                item.data
                                                                    ?.conditions,
                                                            name: newName,
                                                        },
                                                    )
                                                }
                                                onDeleteBranch={handleBranchDelete(
                                                    item.id,
                                                )}
                                                onConditionChange={(
                                                    updatedCondition: ConditionSchema,
                                                    index: number,
                                                ) => {
                                                    const updatedConditions = [
                                                        ...conditions,
                                                    ]
                                                    updatedConditions[index] =
                                                        updatedCondition

                                                    handleConditionChange(
                                                        item.id,
                                                        {
                                                            name: item?.data
                                                                ?.name,
                                                            conditions:
                                                                type === 'and'
                                                                    ? {
                                                                          and: updatedConditions,
                                                                      }
                                                                    : {
                                                                          or: updatedConditions,
                                                                      },
                                                        },
                                                    )
                                                }}
                                                type={type}
                                                conditions={conditions}
                                                errors={
                                                    nodeInEdition.data.errors
                                                        ?.branches?.[item.id]
                                                }
                                                onNameBlur={() => {
                                                    dispatch({
                                                        type: 'SET_TOUCHED',
                                                        nodeId: nodeInEdition.id,
                                                        touched: {
                                                            branches: {
                                                                [item.id]: {
                                                                    name: true,
                                                                },
                                                            },
                                                        },
                                                    })
                                                }}
                                                onConditionBlur={(index) => {
                                                    dispatch({
                                                        type: 'SET_TOUCHED',
                                                        nodeId: nodeInEdition.id,
                                                        touched: {
                                                            branches: {
                                                                [item.id]: {
                                                                    conditions:
                                                                        {
                                                                            [index]: true,
                                                                        },
                                                                },
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </SortableAccordionItem>
                                    )
                                })}
                            </SortableAccordion>
                        )}

                        <div className={conditionsCss.fallback}>
                            <h4>Fallback</h4>
                            <p>
                                If no branches apply to a customer they will be
                                routed to the fallback branch
                            </p>
                        </div>
                        <div>
                            <Button
                                intent="secondary"
                                onClick={handleAddConditionBranch}
                                leadingIcon="add"
                            >
                                Add Branch
                            </Button>
                        </div>
                    </div>
                </ToolbarProvider>
            </Drawer.Content>
        </>
    )
}
