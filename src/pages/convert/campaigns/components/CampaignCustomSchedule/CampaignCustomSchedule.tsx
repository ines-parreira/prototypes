import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import CustomScheduleForm from 'pages/convert/campaigns/components/CampaignCustomSchedule/CustomScheduleForm'
import {
    DEFAULT_SCHEDULE_VALUE,
    MAX_ENTRIES,
} from 'pages/convert/campaigns/components/CampaignCustomSchedule/contants'
import {CustomSchedule} from './types'

import css from './CampaignCustomSchedule.less'

type Props = {
    onChange?: (data: CustomSchedule[]) => void
}

const CampaignCustomSchedule: React.FC<Props> = ({onChange}) => {
    const [customSchedule, setCustomSchedule] = useState<CustomSchedule[]>([])

    const handleOnChange =
        (index: number) => (updatedValue: CustomSchedule) => {
            const newCustomSchedule = [...customSchedule]
            newCustomSchedule[index] = updatedValue
            setCustomSchedule(newCustomSchedule)

            // TODO: Fix when integrating with API
            onChange?.(newCustomSchedule)
        }

    const handleOnDelete = (index: number) => {
        customSchedule.splice(index, 1)
        setCustomSchedule([...customSchedule])

        // TODO: Fix when integrating with API
        onChange?.([...customSchedule])
    }

    const addCustomSchedule = () => {
        if (customSchedule.length >= MAX_ENTRIES) {
            return
        }

        const newCustomSchedule = [...customSchedule, DEFAULT_SCHEDULE_VALUE]

        setCustomSchedule(newCustomSchedule)
        // TODO: Fix when integrating with API
        onChange?.([...customSchedule])
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
