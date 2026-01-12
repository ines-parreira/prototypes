import { FormField } from '@repo/forms'

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

export type AgentStatusFormContentProps = {
    /** Whether the form is in loading state */
    isLoading?: boolean
    /** Callback for cancel button */
    onCancel: () => void
}

/**
 * Form content for creating/editing agent status with custom duration support.
 * Uses useWatch to conditionally show/hide custom duration fields.
 */
export function AgentStatusFormContent({
    isLoading,
    onCancel,
}: AgentStatusFormContentProps) {
    return (
        <>
            <OverlayContent>
                <Box flexDirection="column" gap="md">
                    <Text>
                        Create a new custom agent unavailable status to better
                        track team activity and improve visibility into how time
                        is spent.
                    </Text>

                    <Box flexDirection="column" gap="sm">
                        <FormField
                            name="name"
                            field={TextField}
                            label="Status"
                            placeholder="Lunch break"
                            isRequired
                            maxLength={VALIDATION.NAME_MAX_LENGTH}
                        />

                        <FormField
                            name="description"
                            field={TextField}
                            label="Description"
                            placeholder="Use when agents take their lunch break"
                        />

                        <Box alignItems="flex-start" gap="md">
                            <FormField
                                name="durationOption"
                                field={StatusDurationSelect}
                            />
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
                        Create status
                    </Button>
                </Box>
            </OverlayFooter>
        </>
    )
}
