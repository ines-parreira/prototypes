import { useRef } from 'react'

import { useWatch } from 'react-hook-form'

import { ListItem, SelectField } from '@gorgias/axiom'
import { CustomerFieldsConditionalStep } from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import { getIntermediaryNodeId } from 'core/ui/flows/utils'

import { CustomerLookupActionsFieldArray } from '../../CustomerLookupActionsFieldArray'
import { END_CALL_NODE, VoiceFlowNodeType } from '../constants'
import { useUpdateNodes } from '../hooks/useUpdateNodes'
import { CustomerLookupNode as CustomerLookupNodeType } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import { getFormTargetStepId } from '../utils'
import { useDeleteNode } from '../utils/useDeleteNode'
import { VoiceStepNode } from './VoiceStepNode'

import css from './VoiceStepNode.less'

export function CustomerLookupNode(props: NodeProps<CustomerLookupNodeType>) {
    const { data, id } = props

    const ref = useRef<HTMLDivElement>(null)

    const { getNode } = useVoiceFlow()
    const { deleteBranch } = useDeleteNode()
    const step: CustomerFieldsConditionalStep | null = useWatch({
        name: `steps.${data.id}`,
    })
    const updateNodes = useUpdateNodes()

    const intermediaryNode = getNode(getIntermediaryNodeId(id))
    const nextStepId = intermediaryNode
        ? getFormTargetStepId(intermediaryNode, getNode)
        : null

    if (!step) {
        return null
    }

    return (
        <VoiceStepNode
            title="Customer lookup"
            description={'Select customer field'}
            icon={
                <StepCardIcon
                    backgroundColor="teal"
                    name="search-magnifying-glass"
                />
            }
            errors={[]}
            drawerRef={ref}
            {...props}
        >
            <div className={css.formWithSeparator}>
                <FormField
                    name={`steps.${data.id}.field_id`}
                    field={SelectField<{ id: string; name: string }>}
                    label="Customer fields retrieved"
                    placeholder="Select"
                    items={[]}
                >
                    {(option: { id: string; name: string }) => (
                        <ListItem label={option.name} />
                    )}
                </FormField>
                <CustomerLookupActionsFieldArray
                    stepName={`steps.${data.id}`}
                    branchNextId={
                        step.branch_options.length
                            ? nextStepId
                            : step.default_next_step_id
                    }
                    onAddOption={() => updateNodes()}
                    onRemoveOption={(index) => {
                        deleteBranch(
                            VoiceFlowNodeType.CustomerLookupOption,
                            index,
                            id,
                            intermediaryNode?.id ?? END_CALL_NODE.id,
                        )
                    }}
                />
            </div>
        </VoiceStepNode>
    )
}
