import { useMemo } from 'react'

import { isValidPhoneNumber } from 'libphonenumber-js'
import { useWatch } from 'react-hook-form'

import { Banner } from '@gorgias/axiom'
import { useListPhoneNumbers } from '@gorgias/helpdesk-queries'
import type { ForwardToExternalNumberStep } from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import type { NodeProps } from 'core/ui/flows'
import { NodeWrapper } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import PhoneSelectField from 'pages/integrations/integration/components/phone/PhoneSelectField'

import { type ForwardToExternalNode } from '../types'
import { VoiceStepNode } from './VoiceStepNode'

type ForwardToNodeProps = NodeProps<ForwardToExternalNode>

export function ForwardToNode(props: ForwardToNodeProps) {
    const { id } = props.data
    const step: ForwardToExternalNumberStep | null = useWatch({
        name: `steps.${id}`,
    })
    const externalNumber = step?.external_number
    const isValid = isValidPhoneNumber(externalNumber || '')

    const { data: existingPhoneNumbers, isLoading } = useListPhoneNumbers(
        {
            search: externalNumber || undefined,
        },
        {
            query: { enabled: isValid, staleTime: Infinity },
        },
    )
    const isInternal = useMemo(() => {
        if (isLoading) {
            return false
        }
        return existingPhoneNumbers?.data.data.length !== 0
    }, [isLoading, existingPhoneNumbers])

    const errors = useMemo(() => {
        const errors: string[] = []
        if (!externalNumber) {
            errors.push('Phone number is required')
        } else {
            if (!isValid) {
                errors.push('Invalid phone number')
            }
            if (isInternal) {
                errors.push('Cannot forward to an internal number')
            }
        }

        return errors
    }, [externalNumber, isInternal, isValid])

    if (!step) {
        return null
    }

    return (
        <NodeWrapper {...props}>
            <VoiceStepNode
                title="Forward to"
                description={externalNumber || 'Select phone number'}
                icon={
                    <StepCardIcon
                        backgroundColor="coral"
                        name="arrow-chevron-right-duo"
                    />
                }
                errors={errors}
                {...props}
            >
                <div>
                    {isInternal && (
                        <Banner type="error" className="mb-4">
                            For forwarding to internal numbers, please use a{' '}
                            <b>Route to</b> step. Using <b>Forward to</b> for
                            internal numbers may lead to unexpected behavior.
                        </Banner>
                    )}
                    <FormField
                        name={`steps.${id}.external_number`}
                        field={PhoneSelectField}
                        label={'Phone number'}
                    />
                </div>
            </VoiceStepNode>
        </NodeWrapper>
    )
}
