import React from 'react'
import {produce} from 'immer'
import {
    ConditionSchema,
    DateSchema,
    DoesNotExistSchema,
    ExistsSchema,
    Interval,
} from 'pages/automate/workflows/models/conditions.types'
import InputField from 'pages/common/forms/input/InputField'
import DatePicker from 'pages/common/forms/DatePicker'
import {formatDatetime} from 'utils'
import {DateAndTimeFormatting} from 'constants/datetime'
import NumberInput from 'pages/common/forms/input/NumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {
    getCurrentUser,
    getDateAndTimeFormatter,
} from 'state/currentUser/selectors'
import {StoreState} from 'state/types'
import useAppSelector from 'hooks/useAppSelector'
import {TIMEPERIOD_REGEX} from '../constants'
import css from '../ConditionsNodeEditor.less'

interface Props {
    condition: Exclude<DateSchema, ExistsSchema | DoesNotExistSchema>
    onChange: (condition: ConditionSchema) => void
}
export const DateConditionType = ({condition, onChange}: Props) => {
    const currentUser = useAppSelector(getCurrentUser)

    const key = Object.keys(condition)[0] as AllKeys<typeof condition>

    if (key === 'greaterThan' || key === 'lessThan') {
        const schema = condition[key]

        if (!schema) {
            return null
        }

        const value = schema[1]

        return (
            <DatePicker
                initialSettings={{
                    timePicker: false,
                    singleDatePicker: true,
                    ...(value
                        ? {
                              startDate: value,
                              endDate: value,
                          }
                        : {}),
                }}
                onSubmit={(nextValue) => {
                    onChange(
                        produce(condition, (draft) => {
                            const schema = draft[key]

                            if (!schema) {
                                return
                            }

                            schema[1] = nextValue.toISOString()
                        })
                    )
                }}
            >
                <div className={css.input}>
                    <InputField
                        value={
                            value
                                ? formatDatetime(
                                      value,
                                      getDateAndTimeFormatter({
                                          currentUser,
                                      } as unknown as StoreState)(
                                          DateAndTimeFormatting.ShortDateWithYear
                                      )
                                  ).toString()
                                : ''
                        }
                        placeholder="Choose a date..."
                    />
                </div>
            </DatePicker>
        )
    }

    const schema = condition[key]

    if (!schema) {
        return null
    }

    const value = schema[1]
    const groups = value?.match?.(TIMEPERIOD_REGEX)?.groups

    const unit = (groups?.unit ?? 'd') as Interval

    return (
        <>
            <NumberInput
                value={groups ? Number(groups.value) : 1}
                className={css.numberInput}
                onChange={(nextValue) => {
                    onChange(
                        produce(condition, (draft) => {
                            const schema = draft[key]

                            if (!schema) {
                                return
                            }

                            schema[1] = `${nextValue ?? 1}${unit}`
                        })
                    )
                }}
            />
            <SelectField
                showSelectedOption
                value={unit}
                onChange={(nextValue) => {
                    onChange(
                        produce(condition, (draft) => {
                            const schema = draft[key]

                            if (!schema) {
                                return
                            }

                            schema[1] = `${Number(groups?.value ?? 1) || 1}${
                                nextValue as Interval
                            }`
                        })
                    )
                }}
                options={[
                    {
                        label: 'Minutes ago',
                        value: 'm',
                    },
                    {
                        label: 'Hours ago',
                        value: 'h',
                    },
                    {
                        label: 'Days ago',
                        value: 'd',
                    },
                    {
                        label: 'Weeks ago',
                        value: 'w',
                    },
                ]}
            />
        </>
    )
}
