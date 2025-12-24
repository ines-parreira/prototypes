import { useEffect, useState } from 'react'

import { FormField, useFormContext } from '@repo/forms'

import type { PhoneIntegration } from '@gorgias/helpdesk-queries'

import AccordionRadioFieldSet from 'pages/common/forms/AccordionRadioFieldSet'
import VoiceQueueSelectField from 'pages/integrations/integration/components/voice/VoiceQueueSelectField'

import {
    getDefaultIvrFlow,
    getRouteToQueueFlow,
    getSendToVoicemailFlow,
} from './utils'

const BASIC_TEMPLATE = 'basic'
const IVR_TEMPLATE = 'ivr'
const VOICEMAIL_TEMPLATE = 'voicemail'

function RoutingTemplateRadioFieldSet() {
    const [template, setTemplate] = useState<string>(BASIC_TEMPLATE)
    const { watch, setValue } = useFormContext<PhoneIntegration>()

    const [queue_id] = watch(['meta.queue_id'])

    useEffect(() => {
        switch (template) {
            case BASIC_TEMPLATE:
                setValue('meta.flow', getRouteToQueueFlow(queue_id!))
                setValue('meta.send_calls_to_voicemail', false)
                break
            case IVR_TEMPLATE:
                setValue('meta.flow', getDefaultIvrFlow())
                setValue('meta.send_calls_to_voicemail', true) // todo fix backend
                break
            case VOICEMAIL_TEMPLATE:
                setValue('meta.flow', getSendToVoicemailFlow())
                setValue('meta.send_calls_to_voicemail', true)
                break
        }
    }, [template, queue_id, setValue])

    return (
        <AccordionRadioFieldSet
            name="routing_template"
            defaultExpandedItem={BASIC_TEMPLATE}
            options={[
                {
                    label: 'Basic routing',
                    caption:
                        'Route calls to a queue inside business hours and to voicemail outside business hours.',
                    value: BASIC_TEMPLATE,
                    body: (
                        <FormField
                            field={VoiceQueueSelectField}
                            name="meta.queue_id"
                        />
                    ),
                },
                {
                    label: 'Send all calls to voicemail',
                    caption: 'Route all incoming calls directly to voicemail.',
                    value: VOICEMAIL_TEMPLATE,
                },
                {
                    label: 'IVR',
                    caption:
                        'Add an IVR menu (e.g. press 1, press 2) to route callers to the right place.',
                    value: IVR_TEMPLATE,
                },
            ]}
            value={template}
            onChange={setTemplate}
        />
    )
}

export default RoutingTemplateRadioFieldSet
