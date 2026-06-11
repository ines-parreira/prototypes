import { FormField, useFormContext } from '@repo/forms'

import type { MultiSelectFieldProps } from '@gorgias/axiom'
import {
    Box,
    Icon,
    Label,
    MultiSelectField,
    MultiSelectItem,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { useListSlaPolicies } from '@gorgias/helpdesk-queries'
import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { getChannels } from 'services/channels'

import type { SLAFormValues } from '../controllers/useFormValues'
import useFormValues from '../controllers/useFormValues'

import css from './ChannelSelectBox.less'

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
        <Box flexDirection="column">
            <Box alignItems="center" gap="xxxxs" marginBottom="xxxxs">
                <Label className={css.channelsLabel} as="span" isRequired>
                    Channels
                </Label>
                <Tooltip
                    trigger={
                        <span
                            tabIndex={0}
                            aria-label="More information"
                            className={css.infoIcon}
                        >
                            <Icon name="info" size="sm" />
                        </span>
                    }
                >
                    <TooltipContent title="Select one or more channels. This SLA will apply to tickets from any of the selected channels." />
                </Tooltip>
            </Box>
            <FormField
                name={FIELD_NAME}
                isRequired
                caption="Choose the channels this SLA should apply to. Voice cannot be combined with other channels."
            >
                {(field) => (
                    <ChannelSelectField
                        {...field}
                        isSearchable
                        placeholder="Select"
                        items={options}
                        maxHeight={300}
                        onChannelChange={handleChannelChange}
                        value={options.filter((option) =>
                            field.value.includes(option.id),
                        )}
                        onChange={(options: Option[]) =>
                            field.onChange(options.map((option) => option.id))
                        }
                    >
                        {(option: { id: string; name: string }) =>
                            option.id === PHONE_CHANNEL_SLUG ? (
                                <MultiSelectItem
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
                                <MultiSelectItem
                                    label={option.name}
                                    isDisabled={isVoiceChannelSelected}
                                />
                            )
                        }
                    </ChannelSelectField>
                )}
            </FormField>
        </Box>
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
