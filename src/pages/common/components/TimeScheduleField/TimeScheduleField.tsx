import { Button } from '@gorgias/merchant-ui-kit'

import { useFieldArray } from 'core/forms'
import { DEFAULT_BUSINESS_HOURS_SCHEDULE } from 'pages/settings/businessHours/constants'

import TimeScheduleRow from './TimeScheduleRow'

import css from './TimeScheduleField.less'

type Props = {
    name: string
}

export default function TimeScheduleField({ name }: Props) {
    const { fields, append, remove } = useFieldArray({
        name,
    })

    return (
        <div className={css.container}>
            <div className={css.inputs}>
                {fields.map((field, index) => (
                    <TimeScheduleRow
                        key={field.id}
                        {...field}
                        index={index}
                        onRemove={remove}
                        name={name}
                        isRemovable={fields.length > 1}
                    />
                ))}
            </div>

            <Button
                onClick={() => append(DEFAULT_BUSINESS_HOURS_SCHEDULE)}
                leadingIcon="add"
                intent="secondary"
            >
                Add time range
            </Button>
        </div>
    )
}
