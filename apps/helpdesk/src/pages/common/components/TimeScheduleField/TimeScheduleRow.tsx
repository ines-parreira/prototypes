import { IconButton } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import SelectDropdownField from 'pages/common/forms/SelectDropdownField'
import { DAYS_OPTIONS } from 'pages/settings/businessHours/constants'

import TimeInputField from './TimeInputField'

import css from './TimeScheduleRow.less'

type Props = {
    index: number
    name: string
    onRemove: (index?: number) => void
    isRemovable: boolean
    root?: HTMLElement
}

export default function TimeScheduleRow({
    name,
    index,
    isRemovable,
    onRemove,
    root,
}: Props) {
    const namePrefix = `${name}.${index}`

    return (
        <div className={css.container}>
            <div className={css.selectField}>
                <FormField
                    name={`${namePrefix}.days`}
                    field={SelectDropdownField<string>}
                    options={DAYS_OPTIONS.map((option) => option.label)}
                    outputTransform={(option) =>
                        DAYS_OPTIONS.find(
                            (daysOption) => daysOption.label === option,
                        )?.value
                    }
                    inputTransform={(option) => {
                        return (
                            DAYS_OPTIONS.find(
                                (daysOption) => daysOption.value === option,
                            )?.label ?? ''
                        )
                    }}
                    root={root}
                />
            </div>

            <FormField
                name={`${namePrefix}.from_time`}
                field={TimeInputField}
            />

            <div>to</div>

            <FormField name={`${namePrefix}.to_time`} field={TimeInputField} />

            {isRemovable && (
                <IconButton
                    fillStyle="ghost"
                    intent="destructive"
                    onClick={() => onRemove(index)}
                    icon="close"
                />
            )}
        </div>
    )
}
