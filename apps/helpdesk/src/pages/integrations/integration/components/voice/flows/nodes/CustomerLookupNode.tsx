import { useMemo, useRef } from 'react'

import { FormField } from '@repo/forms'
import { useFormContext, useWatch } from 'react-hook-form'

import type { SelectFieldProps } from '@gorgias/axiom'
import { ListItem, SelectField } from '@gorgias/axiom'
import type {
    CustomerFieldsConditionalStep,
    CustomField,
} from '@gorgias/helpdesk-types'
import { ObjectType } from '@gorgias/helpdesk-types'

import type { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import { getIntermediaryNodeId } from 'core/ui/flows/utils'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'

import { CustomerLookupActionsFieldArray } from '../../CustomerLookupActionsFieldArray'
import { useUpdateNodes } from '../hooks/useUpdateNodes'
import type {
    CustomerLookupNode as CustomerLookupNodeType,
    VoiceFlowFormValues,
} from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import { getFormTargetStepId } from '../utils'
import { useDeleteNode } from '../utils/useDeleteNode'
import { validateCustomerLookupStep } from '../utils/validationUtils'
import { VoiceStepNode } from './VoiceStepNode'

import css from './VoiceStepNode.less'

export function CustomerLookupNode(props: NodeProps<CustomerLookupNodeType>) {
    const { data, id } = props
    const { data: customFieldsData, isLoading } = useCustomFieldDefinitions({
        object_type: ObjectType.Customer,
        archived: false,
    })

    const ref = useRef<HTMLDivElement>(null)

    const { getNode } = useVoiceFlow()
    const step: CustomerFieldsConditionalStep | null = useWatch({
        name: `steps.${data.id}`,
    })
    const updateNodes = useUpdateNodes()

    const intermediaryNode = getNode(getIntermediaryNodeId(id))
    const nextStepId = intermediaryNode
        ? getFormTargetStepId(intermediaryNode, getNode)
        : null

    const errors = useMemo(
        () => (step ? validateCustomerLookupStep(step) : []),
        [step],
    )

    if (!step) {
        return null
    }

    const customFields = customFieldsData?.data?.filter(
        (field) =>
            field.definition.input_settings.input_type === 'dropdown' ||
            field.definition.data_type === 'boolean',
    )
    const selectedCustomField = customFields?.find(
        (field) => field.id === step.custom_field_id,
    )

    return (
        <VoiceStepNode
            title="Customer lookup"
            description={selectedCustomField?.label ?? 'Select customer field'}
            icon={
                <StepCardIcon
                    backgroundColor="fuchsia"
                    name="search-magnifying-glass"
                />
            }
            errors={errors}
            drawerRef={ref}
            {...props}
        >
            <div className={css.formWithSeparator}>
                <FormField
                    name={`steps.${data.id}.custom_field_id`}
                    field={FieldNameSelectField<CustomField>}
                    stepId={data.id}
                    isDisabled={isLoading || customFields?.length === 0}
                    placeholder={customFields?.length ? 'Select' : 'No fields'}
                    label="Customer fields retrieved"
                    items={customFields ?? []}
                    outputTransform={(field) => field.id}
                    inputTransform={(fieldId: number) =>
                        customFields?.find((field) => field.id === fieldId)
                    }
                >
                    {(option: CustomField) => <ListItem label={option.label} />}
                </FormField>
                <CustomerLookupActionsFieldArray
                    stepName={`steps.${data.id}`}
                    branchNextId={
                        step.branch_options.length
                            ? nextStepId
                            : step.default_next_step_id
                    }
                    selectedCustomField={selectedCustomField}
                    onAddOption={() => updateNodes()}
                />
            </div>
        </VoiceStepNode>
    )
}

function FieldNameSelectField<T extends object>({
    onChange,
    stepId,
    ...props
}: SelectFieldProps<T> & { stepId: string }): JSX.Element {
    const { setValue } = useFormContext<VoiceFlowFormValues>()
    const { removeUnlinkedSteps } = useDeleteNode()

    const handleChange = () => {
        setValue(`steps.${stepId}.branch_options`, [])
        removeUnlinkedSteps()
    }

    return (
        <SelectField
            {...props}
            onChange={(nextValue) => {
                onChange?.(nextValue)
                handleChange()
            }}
        />
    )
}
