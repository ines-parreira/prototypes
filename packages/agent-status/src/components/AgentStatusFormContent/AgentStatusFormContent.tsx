import { useMemo } from 'react'

import { FormField, useWatch } from '@repo/forms'

import {
    Box,
    Button,
    OverlayContent,
    OverlayFooter,
    Text,
    TextField,
} from '@gorgias/axiom'

import { VALIDATION } from '../../constants'
import { StatusDurationSelect } from '../StatusDurationSelect'
import { StatusDurationUnitSelect } from '../StatusDurationUnitSelect'
import { StatusDurationValueField } from '../StatusDurationValueField'
import type { AgentStatusFormContentProps } from './types'

/**
 * Form content for creating/editing agent status with custom duration support.
 * Uses useWatch to conditionally show/hide custom duration fields.
 */
export function AgentStatusFormContent({
    isLoading,
    onCancel,
    submitButtonText,
    description,
}: AgentStatusFormContentProps) {
    const durationOption = useWatch({ name: 'durationOption' })
    const nameValue = useWatch({ name: 'statusName' })
    const descriptionValue = useWatch({ name: 'description' })

    const isCustom = useMemo(
        () => durationOption?.id === 'custom',
        [durationOption],
    )

    const nameCaption = useMemo(() => {
        const count = (nameValue || '').length
        return `${count}/${VALIDATION.NAME_MAX_LENGTH} characters`
    }, [nameValue])

    const descriptionCaption = useMemo(() => {
        const count = (descriptionValue || '').length
        return `${count}/${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`
    }, [descriptionValue])

    return (
        <>
            <OverlayContent>
                <Box flexDirection="column" gap="md" flex={1}>
                    {description && <Text>{description}</Text>}

                    <Box flexDirection="column" gap="sm">
                        <FormField
                            name="statusName"
                            field={TextField}
                            label="Status"
                            placeholder="Lunch break"
                            isRequired
                            maxLength={VALIDATION.NAME_MAX_LENGTH}
                            caption={nameCaption}
                        />

                        <FormField
                            name="description"
                            field={TextField}
                            label="Description"
                            placeholder="Use when agents take their lunch break"
                            maxLength={VALIDATION.DESCRIPTION_MAX_LENGTH}
                            caption={descriptionCaption}
                        />

                        <Box alignItems="flex-start" gap="md">
                            <FormField
                                name="durationOption"
                                field={StatusDurationSelect}
                            />

                            {isCustom && (
                                <Box
                                    flexDirection="row"
                                    gap="xs"
                                    flex={1}
                                    alignItems="flex-start"
                                >
                                    <Box flexGrow={0}>
                                        <FormField
                                            name="customDurationValue"
                                            field={StatusDurationValueField}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <FormField
                                            name="customDurationUnit"
                                            field={StatusDurationUnitSelect}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </OverlayContent>

            <OverlayFooter hideCancelButton>
                <Box gap="sm">
                    <Button variant="tertiary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isDisabled={isLoading}
                        isLoading={isLoading}
                    >
                        {submitButtonText}
                    </Button>
                </Box>
            </OverlayFooter>
        </>
    )
}
