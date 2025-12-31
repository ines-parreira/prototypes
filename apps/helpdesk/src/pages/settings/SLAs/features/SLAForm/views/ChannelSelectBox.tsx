import { FormField, useFormContext } from '@repo/forms'

import { ListItem, MultiSelectField } from '@gorgias/axiom'

import { getChannels } from 'services/channels'

import type { SLAFormValues } from '../controllers/useFormValues'

type Option = {
    id: string
    name: string
}

const FIELD_NAME = 'target_channels'
const PHONE_CHANNEL_SLUG = 'phone'

export function ChannelSelectBox() {
    const { watch } = useFormContext<SLAFormValues>()

    const value = watch(FIELD_NAME)

    const options: Option[] = getChannels()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((channel) => ({
            id: channel.slug,
            name: channel.slug === PHONE_CHANNEL_SLUG ? 'Voice' : channel.name,
        }))

    const hasSelection = !!value.length
    const isVoiceChannelSelected = value.includes(PHONE_CHANNEL_SLUG)
    const isVoiceChannelDisabled = hasSelection && !isVoiceChannelSelected

    return (
        <>
            <FormField
                field={MultiSelectField<Option>}
                isSearchable
                label="Channels"
                isRequired
                placeholder="Select"
                caption="Choose the channels this SLA should apply to. Voice cannot be combined with other channels."
                name={FIELD_NAME}
                items={options}
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
                            isDisabled={isVoiceChannelDisabled}
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
