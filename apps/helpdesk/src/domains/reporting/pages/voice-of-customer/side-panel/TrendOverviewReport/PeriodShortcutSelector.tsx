import { useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { LegacyButton as Button } from '@gorgias/axiom'

import {
    ACTION_MENU_LABEL,
    ActionMenuItem,
} from 'domains/reporting/pages/common/components/ActionMenu'
import {
    getDefaultSetOfRanges,
    PAST_7_DAYS,
    PAST_30_DAYS,
    PAST_60_DAYS,
} from 'domains/reporting/pages/constants'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'

const SHOW_DATE_RANGE = 'Show Date Range'

export function PeriodShortcutSelector() {
    const dispatch = useAppDispatch()
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const actions = [PAST_7_DAYS, PAST_30_DAYS, PAST_60_DAYS]

    const periods = getDefaultSetOfRanges()

    const periodShortcutOnClick = (selectedPeriod: string) => {
        const periodDates = periods[selectedPeriod]
        if (periodDates !== undefined) {
            dispatch(
                mergeStatsFilters({
                    period: {
                        start_datetime: periodDates[0].format(),
                        end_datetime: periodDates[1].format(),
                    },
                }),
            )
            logEvent(SegmentEvent.VocSidePanelTrendOverviewTimeRange, {
                period: selectedPeriod,
            })
        }
    }

    return (
        <div>
            <Button
                as="button"
                ref={triggerRef}
                intent="secondary"
                fillStyle="ghost"
                trailingIcon="arrow_drop_down"
                onClick={() => setIsOpen(true)}
                aria-label={ACTION_MENU_LABEL}
            >
                {SHOW_DATE_RANGE}
            </Button>
            <Dropdown
                target={triggerRef}
                isOpen={isOpen}
                onToggle={setIsOpen}
                placement="bottom-end"
                offset={4}
            >
                <DropdownBody>
                    {actions.map((action) => (
                        <ActionMenuItem
                            key={action}
                            label={action}
                            onClick={() => periodShortcutOnClick(action)}
                        />
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
