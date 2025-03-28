import { ToggleField } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'

import css from './VoiceQueueSettingsFormGeneralSection.less'

const PRIORITY_WEIGHT_MAX = 100
const PRIORITY_WEIGHT_MIN = 1

export default function VoiceQueueSettingsFormGeneralSection() {
    return (
        <div className={css.container}>
            <FormField label="Queue name" name="name" isRequired />
            <FormField
                label="Queue capacity"
                type="number"
                name="capacity"
                caption="Once the limit is reached, calls are sent to voicemail."
                outputTransform={(value) =>
                    value === '' ? null : Number(value)
                }
            />
            <FormField
                name="priority_weight"
                caption="When enabled, calls in this queue are handled before those in other non-priority queues."
                field={ToggleField}
                inputTransform={(value) =>
                    value === PRIORITY_WEIGHT_MAX ? false : true
                }
                outputTransform={(value) =>
                    value ? PRIORITY_WEIGHT_MIN : PRIORITY_WEIGHT_MAX
                }
                label="Priority queue"
            />
        </div>
    )
}
