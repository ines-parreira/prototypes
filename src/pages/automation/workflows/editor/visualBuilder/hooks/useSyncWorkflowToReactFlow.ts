import {useEffect} from 'react'
import {Edge, Node, useNodesInitialized, useReactFlow} from 'reactflow'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'
import {useWorkflowEntrypointContext} from '../../hooks/useWorkflowEntrypoint'
import {
    AutomatedMessageNodeType,
    ReplyButtonNodeType,
    TriggerButtonNodeType,
} from '../types'
import {WorkflowConfiguration} from '../../../hooks/useWorkflowApi'

export function useSyncWorkflowToReactFlow() {
    const {setNodes, getNodes, setEdges} = useReactFlow()
    const {label: entrypoint_label, isFetchPending: isEntrypointFetchPending} =
        useWorkflowEntrypointContext()
    const {configuration, isFetchPending: isConfigurationFetchPending} =
        useWorkflowConfigurationContext()
    const nodesInitialized = useNodesInitialized()
    useEffect(() => {
        if (isEntrypointFetchPending || isConfigurationFetchPending) return
        const nextNodes = configuration.steps.reduce(
            (ns, step) => ns.concat(stepToNodes(step)),
            [] as Node[]
        )
        const nextEdges = configuration.transitions.reduce(
            (ts, transition) =>
                ts.concat(transitionToEdges(transition, configuration.steps)),
            [] as Edge[]
        )
        const triggerButtonNode: TriggerButtonNodeType = {
            id: 'entrypoint',
            type: 'trigger_button',
            data: {
                entrypoint_label,
            },
            position: {x: 0, y: 0},
        }
        nextNodes.push(triggerButtonNode)
        const initialStep = configuration.steps.find(
            (s) => s.id === configuration.initial_step_id
        )
        if (!initialStep)
            throw new Error(
                'workflow configuration data corrupted, no initial step can be found'
            )
        nextEdges.push(newEdge(triggerButtonNode.id, initialStep.id))
        // to avoid UI blinks we reuse the current node coordinates
        const existingNodes = getNodes()
        const [nextNodesWithPlaceholders, nextEdgesWithPlaceholders] =
            injectPlaceholders(nextNodes, nextEdges)
        setNodes(
            copyPreviousNodesData(existingNodes, nextNodesWithPlaceholders)
        )
        setEdges(nextEdgesWithPlaceholders)
    }, [
        entrypoint_label,
        configuration,
        setNodes,
        setEdges,
        getNodes,
        nodesInitialized,
        isEntrypointFetchPending,
        isConfigurationFetchPending,
    ])
}

/*
 * workflow configuration steps 'choices' maps to several reactflow nodes 'reply_button'
 * Here the id convention for nodes:
 * - node.id = step.id if step.kind !== 'choices'
 * - node.id = `${step.id}-${}
 */
function stepToNodes(step: WorkflowConfiguration['steps'][number]): Node[] {
    if (step.kind === 'messages') {
        const n: AutomatedMessageNodeType = {
            id: step.id,
            type: 'automated_message',
            data: {
                step_id: step.id,
                message: {
                    content: step.settings.messages[0].content,
                },
            },
            position: {x: 0, y: 0},
        }
        return [n]
    } else if (step.kind === 'choices') {
        return step.settings.choices.map(({event_id, label}) => {
            const n: ReplyButtonNodeType = {
                id: `${step.id}-${event_id}`,
                type: 'reply_button',
                data: {
                    step_id: step.id,
                    choice: {
                        event_id,
                        label,
                    },
                },
                position: {x: 0, y: 0},
            }
            return n
        })
    }
    return []
}

/**
 * A transition from parent to step choices maps to several reactflow edges (one per choice)
 * transition id convention: `${fromNode.id}-${toNode.id}`
 */
function transitionToEdges(
    t: WorkflowConfiguration['transitions'][number],
    steps: WorkflowConfiguration['steps']
): Edge[] {
    const destinationStep = steps.find((s) => s.id === t.to_step_id)!
    if (destinationStep.kind === 'choices') {
        return destinationStep.settings.choices.map((choice) =>
            newEdge(`${t.from_step_id}`, `${t.to_step_id}-${choice.event_id}`)
        )
    }
    if (t.event?.kind === 'choices') {
        return [newEdge(`${t.from_step_id}-${t.event.id}`, t.to_step_id)]
    }
    return [newEdge(t.from_step_id, t.to_step_id)]
}

function injectPlaceholders(nodes: Node[], edges: Edge[]): [Node[], Edge[]] {
    const nodesToAdd: Node[] = []
    const edgesToAdd: Edge[] = []
    nodes.forEach((n) => {
        if (n.type === 'automated_message') {
            const existingEdge = edges.find((e) => e.source === n.id)
            if (!existingEdge) {
                nodesToAdd.push(newPlaceholderNode(`${n.id}-placeholder`, n.id))
                edgesToAdd.push(newEdge(n.id, `${n.id}-placeholder`))
            }
        }
    })
    return [nodes.concat(nodesToAdd), edges.concat(edgesToAdd)]
}

function newPlaceholderNode(id: string, parentStepId: string): Node {
    return {
        id,
        type: 'placeholder',
        data: {parentStepId},
        position: {x: 0, y: 0},
    }
}

function newEdge(fromId: string, toId: string): Edge {
    return {
        id: `${fromId}-${toId}`,
        source: fromId,
        target: toId,
        type: 'smoothstep',
        style: {stroke: '#D2D7DE'},
    }
}

function copyPreviousNodesData(
    existingNodes: Node[],
    nextNodes: Node[]
): Node[] {
    const map = existingNodes.reduce(
        (acc, n) => ({...acc, [n.id]: n}),
        {} as Record<string, Node>
    )
    return nextNodes.map((n) =>
        n.id in map
            ? {
                  ...n,
                  position: map[n.id].position,
                  data: {...map[n.id].data, ...n.data},
              }
            : n
    )
}
