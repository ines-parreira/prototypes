import { useEffect, useMemo, useRef } from 'react'

import { useWatch } from 'react-hook-form'

import { Banner, Label } from '@gorgias/axiom'
import {
    BranchOptions,
    CustomRecordingType,
    IvrMenuStep,
} from '@gorgias/helpdesk-types'
import {
    validateBranchOptions,
    validateVoiceMessage,
} from '@gorgias/helpdesk-validators'

import { FormField } from 'core/forms'
import { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import { getIntermediaryNodeId } from 'core/ui/flows/utils'

import { IvrMenuActionsFieldArray } from '../../IvrMenuActionsFieldArray'
import VoiceMessageField from '../../VoiceMessageField'
import { END_CALL_NODE, VoiceFlowNodeType } from '../constants'
import { type IvrMenuNode, IvrOptionNode } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import { createIvrOptionNode, getFormTargetStepId } from '../utils'
import { VoiceStepNode } from './VoiceStepNode'

import css from './VoiceStepNode.less'

type IvrMenuNodeProps = NodeProps<IvrMenuNode>

export function IvrMenuNode(props: IvrMenuNodeProps) {
    const { data } = props
    const ref = useRef<HTMLDivElement>(null)
    const { updateNodeData, getNodes, addNodes, getNode } = useVoiceFlow()

    const { id } = data
    const step: IvrMenuStep | null = useWatch({
        name: `steps.${id}`,
    })

    useEffect(() => {
        if (!step) return

        if (step.branch_options.length !== data.branch_options.length) {
            // Update node data when the value changes to reflect in children nodes
            updateNodeData(id, step)
        }
    }, [step, id, updateNodeData, data])

    const errors = useMemo(() => {
        const errors: string[] = []

        if (!validateVoiceMessage(step?.message).isValid) {
            errors.push('Greeting message is required')
        }

        const branchOptionsErrors = step?.branch_options?.find(
            (option) => !validateBranchOptions(option).isValid,
        )

        if (branchOptionsErrors) {
            errors.push(
                'Menu options are required and cannot point to end call',
            )
        }

        return errors
    }, [step])

    const intermediaryNode = getNode(getIntermediaryNodeId(id))
    const intermediaryNodeId = intermediaryNode?.id ?? END_CALL_NODE.id
    const nextStepId = intermediaryNode
        ? getFormTargetStepId(intermediaryNode, getNode)
        : null

    const isNestedIvr = useMemo(() => {
        const nodes = getNodes()
        const isParentNodeIvrOption = nodes.find(
            (node) =>
                node.type === VoiceFlowNodeType.IvrOption &&
                node.data.next_step_id === id,
        )

        return isParentNodeIvrOption
    }, [id, getNodes])

    const handleAddOption = (option: BranchOptions, insertAtIndex: number) => {
        const newNode: IvrOptionNode = {
            ...createIvrOptionNode(id, insertAtIndex, intermediaryNodeId),
            position: { x: 0, y: 0 },
        }
        addNodes(newNode)
    }

    if (!step) {
        return null
    }

    return (
        <VoiceStepNode
            title="IVR Menu"
            description="Greeting message"
            icon={<StepCardIcon backgroundColor="teal" name="comm-ivr" />}
            errors={errors}
            drawerRef={ref}
            {...props}
        >
            <div className={css.tightDrawerForm}>
                {isNestedIvr && (
                    <Banner>
                        This menu is a nested IVR. Don’t forget to tell callers
                        how to go back.
                    </Banner>
                )}
                <div className={css.formSection}>
                    <Label>Greeting message</Label>
                    <div>
                        <FormField
                            name={`steps.${id}.message`}
                            field={VoiceMessageField}
                            horizontal={true}
                            shouldUpload={true}
                            allowNone={false}
                            customRecordingType={
                                CustomRecordingType.GreetingMessage
                            }
                            radioButtonId={id}
                        />
                    </div>
                </div>
                <Label>Menu options</Label>
                <IvrMenuActionsFieldArray
                    name={`steps.${id}.branch_options`}
                    onAddOption={handleAddOption}
                    branchNextId={nextStepId}
                />
            </div>
        </VoiceStepNode>
    )
}
