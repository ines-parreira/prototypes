import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { useAutomatedInteractionsBySkill } from 'domains/reporting/hooks/automate/useAutomatedInteractionsBySkill'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { createCsv } from 'utils/file'

const FILENAME = 'automated-interactions-by-skill'

export const useDownloadAutomatedInteractionsBySkillData = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const { data, isLoading } = useAutomatedInteractionsBySkill(
        statsFilters,
        userTimezone,
    )

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        return [
            ['Skill', 'Automated interactions'],
            ...data.map((row) => [
                row.name,
                formatMetricValue(row.value, 'decimal'),
            ]),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(statsFilters.period, FILENAME)

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
