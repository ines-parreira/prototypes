import { FormField, useFormContext } from '@repo/forms'

import type { MultiSelectFieldProps } from '@gorgias/axiom'
import { ListItem, MultiSelectField } from '@gorgias/axiom'
import { useListSlaPolicies } from '@gorgias/helpdesk-queries'
import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { getChannels } from 'services/channels'

import type { SLAFormValues } from '../controllers/useFormValues'
import useFormValues from '../controllers/useFormValues'

type Option = {
    id: string
    name: string
}

const FIELD_NAME = 'target_channels'
const PHONE_CHANNEL_SLUG = 'phone'

export function ChannelSelectBox() {
    const { data: voicePolicies } = useListSlaPolicies({
        target_channel: 'phone',
    })
    const { watch, setValue } = useFormContext<SLAFormValues>()
    const defaultValues = useFormValues()

    const value = watch(FIELD_NAME)

    const options: Option[] = getChannels()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((channel) => ({
            id: channel.slug,
            name: channel.slug === PHONE_CHANNEL_SLUG ? 'Voice' : channel.name,
        }))

    const hasSelection = !!value.length
    const isVoiceChannelSelected = value.includes(PHONE_CHANNEL_SLUG)
    const isNonVoiceChannelSelected = hasSelection && !isVoiceChannelSelected
    const hasExistingVoicePolicy = !!voicePolicies?.data.data.length
    const isVoiceChannelDisabled =
        hasExistingVoicePolicy || isNonVoiceChannelSelected

    const handleChannelChange = (newValue: Option[]) => {
        const isNewChannelVoice = newValue.find(
            (option) => option.id === PHONE_CHANNEL_SLUG,
        )

        if (!isVoiceChannelSelected && isNewChannelVoice) {
            setValue(
                'metrics',
                [
                    {
                        name: SLAPolicyMetricType.WaitTime,
                        threshold: 1,
                        unit: SLAPolicyMetricUnit.Minute,
                    },
                ],
                { shouldDirty: true },
            )
        } else if (isVoiceChannelSelected && !isNewChannelVoice) {
            setValue('metrics', defaultValues.metrics, { shouldDirty: true })
            setValue('target', undefined)
        }
    }

    return (
        <>
            <FormField
                field={ChannelSelectField}
                isSearchable
                label="Channels"
                isRequired
                placeholder="Select"
                caption="Choose the channels this SLA should apply to. Voice cannot be combined with other channels."
                name={FIELD_NAME}
                items={options}
                onChannelChange={handleChannelChange}
                outputTransform={(options: Option[]) =>
                    options.map((option) => option.id)
                }
                inputTransform={(value: string | string[]) =>
                    options.filter((option) => value.includes(option.id))
                }
            >
                {(option: { id: string; name: string }) =>
                    option.id === PHONE_CHANNEL_SLUG ? (
                        <ListItem
                            label={option.name}
                            textValue={option.name}
                            isDisabled={isVoiceChannelDisabled}
                            caption={
                                hasExistingVoicePolicy
                                    ? 'A Voice SLA has already been created.'
                                    : `Voice uses a different SLA policy and cannot be combined with other channels.`
                            }
                        />
                    ) : (
                        <ListItem
                            label={option.name}
                            isDisabled={isVoiceChannelSelected}
                        />
                    )
                }
            </FormField>
        </>
    )
}

function ChannelSelectField({
    onChannelChange,
    onChange,
    ...rest
}: MultiSelectFieldProps<Option> & {
    onChannelChange: (newValue: Option[]) => void
}) {
    const handleChange = (newValue: Option[]) => {
        onChannelChange(newValue)
        onChange?.(newValue)
    }

    return <MultiSelectField<Option> {...rest} onChange={handleChange} />
}
