import {fromJS, Map} from 'immutable'
import {AttachmentEnum} from 'common/types'

export const sampleContactFormAttachment: Map<any, any> = fromJS({
    contentType: AttachmentEnum.ContactForm,
    name: 'Foo',
    extra: {
        steps: [
            {
                cta: 'hey',
                fields: [
                    {
                        name: 'email',
                        type: 'email',
                        label: 'oasis is back',
                        required: false,
                    },
                ],
            },
        ],
        on_success_content: {message: 'foo'},
        targets: [
            {
                type: 'shopify',
                subscriber_types: 'email',
                tags: ['foo', 'bar'],
            },
        ],
        discalimer: 'foo',
        disclaimer_default_accepted: true,
    },
})
