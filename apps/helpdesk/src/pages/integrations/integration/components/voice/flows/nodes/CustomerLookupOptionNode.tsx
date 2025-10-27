import { useWatch } from 'react-hook-form'

import { CustomerFieldBranchOption } from '@gorgias/helpdesk-types'

import { ActionLabel, NodeProps, NodeWrapper } from 'core/ui/flows'

import { type CustomerLookupOptionNode } from '../types'

type CustomerLookupOptionNodeProps = NodeProps<CustomerLookupOptionNode>

export function CustomerLookupOptionNode(props: CustomerLookupOptionNodeProps) {
    const { data } = props

    const option: CustomerFieldBranchOption | undefined = useWatch({
        name: `steps.${data.parentId}.branch_options.${data.optionIndex}`,
    })

    return (
        <NodeWrapper {...props}>
            <ActionLabel
                label={
                    data.isDefaultOption
                        ? 'Other'
                        : option?.branch_name ||
                          `${transformFieldValue(option?.field_value)}` ||
                          `${(data?.optionIndex ?? 0) + 1}`
                }
            />
        </NodeWrapper>
    )
}

const transformFieldValue = (
    fieldValue: string | undefined,
): string | undefined => {
    if (fieldValue === 'True') {
        return 'Yes'
    }

    if (fieldValue === 'False') {
        return 'No'
    }

    return fieldValue
}
