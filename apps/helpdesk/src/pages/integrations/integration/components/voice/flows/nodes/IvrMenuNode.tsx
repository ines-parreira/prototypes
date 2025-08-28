import { useEffect, useMemo, useRef } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'

import { Banner, Label } from '@gorgias/axiom'
import { CustomRecordingType, IvrMenuStep } from '@gorgias/helpdesk-types'
import {
    validateBranchOptions,
    validateVoiceMessage,
} from '@gorgias/helpdesk-validators'

import { FormField } from 'core/forms'
import { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import { findPathFromRoot } from 'core/ui/flows/utils'

import { IvrMenuActionsFieldArray } from '../../IvrMenuActionsFieldArray'
import VoiceMessageField from '../../VoiceMessageField'
import { VoiceFlowNodeType } from '../constants'
import { type IvrMenuNode, VoiceFlowFormValues } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import { getNextNodes } from '../utils'
import { VoiceStepNode } from './VoiceStepNode'

import css from './VoiceStepNode.less'

type IvrMenuNodeProps = NodeProps<IvrMenuNode>

export function IvrMenuNode(props: IvrMenuNodeProps) {
    const { data } = props
    const ref = useRef<HTMLDivElement>(null)
    const { updateNodeData, getNodes, getNode } = useVoiceFlow()
    const { watch } = useFormContext<VoiceFlowFormValues>()

    const { id } = data
    const firstStepId = watch('first_step_id')
    const step: IvrMenuStep = useWatch({ name: `steps.${id}` })

    useEffect(() => {
        // Update node data when the value changes to reflect in children nodes
        updateNodeData(id, step)
    }, [step, id, updateNodeData])

    const errors = useMemo(() => {
        const errors: string[] = []

        if (!validateVoiceMessage(step.message).isValid) {
            errors.push('Greeting message is required')
        }

        const branchOptionsErrors = step.branch_options?.find(
            (option) => !validateBranchOptions(option).isValid,
        )

        if (branchOptionsErrors) {
            errors.push('Menu options are required')
        }

        return errors
    }, [step])

    const isNestedIvr = useMemo(() => {
        const nodes = getNodes()
        const path = findPathFromRoot(nodes, firstStepId, id, getNextNodes)

        return !!path?.find(
            (nodeId) =>
                nodeId !== id &&
                getNode(nodeId)?.type === VoiceFlowNodeType.IvrMenu,
        )
    }, [getNodes, firstStepId, id, getNode])

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
                <IvrMenuActionsFieldArray name={`steps.${id}.branch_options`} />
            </div>
        </VoiceStepNode>
    )
}
