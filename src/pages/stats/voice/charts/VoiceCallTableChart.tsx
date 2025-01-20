import React, {useState} from 'react'

import ChartCard from 'pages/stats/ChartCard'
import VoiceCallDirectionFilter from 'pages/stats/voice/components/VoiceCallDirectionFilter/VoiceCallDirectionFilter'
import {VoiceCallTable} from 'pages/stats/voice/components/VoiceCallTable/VoiceCallTable'
import {CALL_LIST_TITLE} from 'pages/stats/voice/constants/voiceOverview'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {VoiceCallFilterOptions} from 'pages/stats/voice/models/types'

export const VoiceCallTableChart = () => {
    const [tableFilterOption, setTableFilterOption] = useState(
        VoiceCallFilterOptions.All
    )
    const {cleanStatsFilters, userTimezone} = useNewVoiceStatsFilters()

    return (
        <ChartCard
            title={CALL_LIST_TITLE}
            noPadding
            titleExtra={
                <VoiceCallDirectionFilter
                    onFilterSelect={(option: VoiceCallFilterOptions) =>
                        setTableFilterOption(option)
                    }
                />
            }
        >
            <VoiceCallTable
                statsFilters={cleanStatsFilters}
                userTimezone={userTimezone}
                filterOption={tableFilterOption}
            />
        </ChartCard>
    )
}
