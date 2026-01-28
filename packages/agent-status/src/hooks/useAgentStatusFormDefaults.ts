import { useMemo } from 'react'

import type { DurationUnit } from '@gorgias/helpdesk-queries'

import { DURATION_OPTIONS } from '../constants'
import type { AgentStatusWithSystem, DurationOption } from '../types'
import { findDurationOption } from '../utils'

export type AgentStatusFormValues = {
    statusName: string
    description: string
    durationOption: DurationOption
    customDurationValue?: number
    customDurationUnit?: DurationUnit
}

/**
 * Hook that returns default form values for agent status forms.
 * Handles both create mode (no status) and edit mode (with status).
 */
export function useAgentStatusFormDefaults(
    status?: AgentStatusWithSystem,
): AgentStatusFormValues {
    return useMemo<AgentStatusFormValues>(() => {
        if (!status) {
            return {
                statusName: '',
                description: '',
                durationOption: DURATION_OPTIONS[0],
                customDurationValue: 1,
                customDurationUnit: 'hours',
            }
        }

        const durationOption = findDurationOption(
            status.duration_unit ?? null,
            status.duration_value ?? null,
        )

        return {
            statusName: status.name,
            description: status.description || '',
            durationOption,
            customDurationValue: status.duration_value ?? 1,
            customDurationUnit: (status.duration_unit ??
                'hours') as DurationUnit,
        }
    }, [status])
}
