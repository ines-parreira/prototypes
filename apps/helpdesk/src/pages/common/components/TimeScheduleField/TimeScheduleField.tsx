import { useFieldArray } from '@repo/forms'

import { LegacyButton as Button } from '@gorgias/axiom'

import { DEFAULT_BUSINESS_HOURS_SCHEDULE } from 'pages/settings/businessHours/constants'

import TimeScheduleRow from './TimeScheduleRow'

import css from './TimeScheduleField.less'

type Props = {
    isRemovable?: boolean
    name: string
    root?: HTMLElement
    withCaption?: boolean
}

export default function TimeScheduleField({
    isRemovable = false,
    name,
    root,
    withCaption = true,
}: Props) {
    const { fields, append, remove } = useFieldArray({
        name,
    })

    return (
        <div className={css.container}>
            {fields.length ? (
                <>
                    {withCaption && (
                        <span className={css.caption}>
                            Add one or multiple time ranges to create your
                            custom schedule.
                        </span>
                    )}
                    <div className={css.inputs}>
                        {fields.map((field, index) => (
                            <TimeScheduleRow
                                key={field.id}
                                {...field}
                                index={index}
                                onRemove={remove}
                                name={name}
                                isRemovable={isRemovable || fields.length > 1}
                                root={root}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <span className={css.caption}>
                    You are currently outside business hours. Add one or
                    multiple time ranges to create your custom schedule.
                </span>
            )}

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
