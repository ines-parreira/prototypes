import React, { useCallback, useMemo } from 'react'

import { produce } from 'immer'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import {
    DAYS_OPTIONS,
    DEFAULT_SCHEDULE_VALUE,
    MAX_ENTRIES,
} from 'pages/convert/campaigns/components/CampaignCustomSchedule/contants'
import CustomScheduleForm from 'pages/convert/campaigns/components/CampaignCustomSchedule/CustomScheduleForm'
import { CustomScheduleSchema } from 'pages/convert/campaigns/types/CampaignSchedule'

import css from './CampaignCustomSchedule.less'

type Props = {
    customSchedule: CustomScheduleSchema[]
    onChange: (newState: CustomScheduleSchema[]) => void
}

const CampaignCustomSchedule: React.FC<Props> = ({
    customSchedule,
    onChange,
}) => {
    const handleOnChange = (index: number) => (updatedValue: any) => {
        onChange(
            produce(customSchedule, (draft) => {
                draft[index] = updatedValue
            }),
        )
    }

    const handleOnDelete = (index: number) => {
        onChange(
            produce(customSchedule, (draft) => {
                draft.splice(index, 1)
            }),
        )
    }

    const alreadyTaken = useMemo(() => {
        return customSchedule.map((schedule) => schedule.days)
    }, [customSchedule])

    const addCustomSchedule = () => {
        if (customSchedule.length >= MAX_ENTRIES) {
            return
        }

        const nextAllowedOption = DAYS_OPTIONS.filter(
            (option) => !alreadyTaken.includes(option.value),
        )[0]

        onChange(
            produce(customSchedule, (draft) => {
                draft.push({
                    ...DEFAULT_SCHEDULE_VALUE,
                    days: nextAllowedOption.value,
                })
            }),
        )
    }

    const allowedOptions = useCallback(
        (currentSchedule: CustomScheduleSchema) => {
            return DAYS_OPTIONS.filter(
                (option) =>
                    !alreadyTaken.includes(option.value) ||
                    currentSchedule.days === option.value,
            )
        },
        [alreadyTaken],
    )

    return (
        <>
            {customSchedule.map((schedule, idx) => (
                <div className={css.formLine} key={idx}>
                    <CustomScheduleForm
                        options={allowedOptions(schedule)}
                        schedule={schedule}
                        onChange={handleOnChange(idx)}
                    />
                    <div className={css.deleteBtn}>
                        <IconButton
                            className={css.deleteButton}
                            onClick={() => handleOnDelete(idx)}
                            fillStyle="fill"
                            intent="secondary"
                            size="small"
                        >
                            clear
                        </IconButton>
                    </div>
                </div>
            ))}
            <div className={css.actionWrapper}>
                <Button
                    fillStyle="fill"
                    intent="secondary"
                    size="medium"
                    onClick={addCustomSchedule}
                    isDisabled={customSchedule.length >= MAX_ENTRIES}
                    leadingIcon="add"
                >
                    Add Date-Specific Hours
                </Button>
            </div>
        </>
    )
}

export default CampaignCustomSchedule
