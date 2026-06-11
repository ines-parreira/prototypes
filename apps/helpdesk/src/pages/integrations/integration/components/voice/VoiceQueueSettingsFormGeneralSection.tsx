import { FormField } from '@repo/forms'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { DefaultExportInputField as InputField } from 'pages/common/forms/input/InputField'

import css from './VoiceQueueSettingsFormGeneralSection.less'

const PRIORITY_WEIGHT_MAX = 100
const PRIORITY_WEIGHT_MIN = 1

export function VoiceQueueSettingsFormGeneralSection() {
    return (
        <div className={css.container}>
            <FormField name="name" isRequired label="Queue name">
                {(field) => <InputField {...field} />}
            </FormField>
            <FormField
                name="capacity"
                label="Queue capacity"
                caption="Once the limit is reached, calls are sent to voicemail."
            >
                {(field) => (
                    <InputField
                        {...field}
                        type="number"
                        onChange={(value) =>
                            field.onChange(value === '' ? null : Number(value))
                        }
                        min={1}
                    />
                )}
            </FormField>
            <FormField
                name="priority_weight"
                caption="When enabled, calls in this queue are handled before those in other non-priority queues."
                label="Priority queue"
            >
                {(field) => (
                    <ToggleField
                        {...field}
                        value={
                            field.value === PRIORITY_WEIGHT_MAX ? false : true
                        }
                        onChange={(value) =>
                            field.onChange(
                                value
                                    ? PRIORITY_WEIGHT_MIN
                                    : PRIORITY_WEIGHT_MAX,
                            )
                        }
                    />
                )}
            </FormField>
        </div>
    )
}
