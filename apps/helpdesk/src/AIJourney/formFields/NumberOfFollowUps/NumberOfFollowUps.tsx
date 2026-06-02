import { Controller, useFormContext } from 'react-hook-form'

import { ListItem, SelectField } from '@gorgias/axiom'

const MAX_NUMBER_OF_FOLLOW_UPS = 3

type FollowUpOption = { id: number; label: string }

const followUpOptions: FollowUpOption[] = Array.from({
    length: MAX_NUMBER_OF_FOLLOW_UPS,
}).map((_, index) => {
    const value = index + 1
    return {
        id: value,
        label: `${value}`,
    }
})

export const NumberOfFollowUps = () => {
    const { control } = useFormContext()

    return (
        <Controller
            name="max_follow_up_messages"
            control={control}
            render={({ field }) => (
                <SelectField
                    label="Number of follow-ups"
                    items={followUpOptions}
                    value={
                        followUpOptions.find(
                            (option) => option.id === field.value,
                        ) ?? followUpOptions[0]
                    }
                    onChange={(option) =>
                        field.onChange((option as FollowUpOption).id)
                    }
                >
                    {(option: FollowUpOption) => (
                        <ListItem key={option.id} label={option.label} />
                    )}
                </SelectField>
            )}
        />
    )
}
