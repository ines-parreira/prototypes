import React from 'react'
import {produce} from 'immer'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {CustomScheduleSchema} from 'pages/convert/campaigns/types/CampaignSchedule'
import CustomScheduleForm from 'pages/convert/campaigns/components/CampaignCustomSchedule/CustomScheduleForm'
import {
    DEFAULT_SCHEDULE_VALUE,
    MAX_ENTRIES,
} from 'pages/convert/campaigns/components/CampaignCustomSchedule/contants'

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
            })
        )
    }

    const handleOnDelete = (index: number) => {
        onChange(
            produce(customSchedule, (draft) => {
                draft.splice(index, 1)
            })
        )
    }

    const addCustomSchedule = () => {
        if (customSchedule.length >= MAX_ENTRIES) {
            return
        }

        onChange(
            produce(customSchedule, (draft) => {
                draft.push(DEFAULT_SCHEDULE_VALUE)
            })
        )
    }

    return (
        <>
            {customSchedule.map((schedule, idx) => (
                <div className={css.formLine} key={idx}>
                    <CustomScheduleForm
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
                >
                    <ButtonIconLabel icon="add">
                        Add Date-Specific Hours
                    </ButtonIconLabel>
                </Button>
            </div>
        </>
    )
}

export default CampaignCustomSchedule
