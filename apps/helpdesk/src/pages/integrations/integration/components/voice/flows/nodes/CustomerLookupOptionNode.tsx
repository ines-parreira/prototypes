import { useWatch } from 'react-hook-form'

import type { CustomerFieldBranchOption } from '@gorgias/helpdesk-types'

import type { NodeProps } from 'core/ui/flows'
import { ActionLabel, NodeWrapper } from 'core/ui/flows'

import type { CustomerLookupOptionNode } from '../types'

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
                        : getOptionLabel(option, data.optionIndex)
                }
            />
        </NodeWrapper>
    )
}

const getOptionLabel = (
    option: CustomerFieldBranchOption | undefined,
    optionIndex: number | null,
): string => {
    const optionIndexLabel = `${(optionIndex ?? 0) + 1}`

    if (!option) {
        return optionIndexLabel
    }

    if (option.branch_name) {
        return option.branch_name
    }

    if (Array.isArray(option.field_value)) {
        return option.field_value.length > 0
            ? option.field_value.map(transformFieldValue).join(', ')
            : optionIndexLabel
    }

    return transformFieldValue(option.field_value) || optionIndexLabel
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
