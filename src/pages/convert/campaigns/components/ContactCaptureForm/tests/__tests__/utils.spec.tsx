import {fromJS} from 'immutable'
import {AttachmentEnum} from 'common/types'
import {
    handleContactFormSubmitted,
    transformAttachmentToTransitory,
    transformTransitoryToAttachment,
} from 'pages/convert/campaigns/components/ContactCaptureForm/utils'
import {deleteAttachment} from 'state/newMessage/actions'

describe('CampaignForm Utils', () => {
    describe('transformTransitoryToAttachment', () => {
        const baseExpectedAttachment = {
            disclaimer: 'Lorem ipsum dolor',
            disclaimer_default_accepted: true,
            on_success_content: {
                message: 'Thanks for adding your information!',
            },
            steps: [
                {
                    cta: 'Bar',
                    fields: [
                        {
                            label: 'Foo',
                            name: 'email',
                            required: true,
                            type: 'email',
                        },
                    ],
                },
            ],
            targets: [
                {
                    subscriber_types: ['email'],
                    tags: ['a', 'b', 'c'],
                    type: 'shopify',
                },
            ],
        }

        const baseTransitoryAttachmentData = {
            subscriberTypes: {
                shopify: {
                    enabled: true,
                    isEmailSubscriber: true,
                    isSmsSubscriber: false,
                    tags: ['a', 'b', 'c'],
                },
            },
            forms: {
                email: {
                    label: 'Foo',
                    cta: 'Bar',
                    disclaimerEnabled: true,
                    disclaimer: 'Lorem ipsum dolor',
                    preSelectDisclaimer: true,
                },
            },
            postSubmissionMessage: {
                enabled: true,
                message: 'Thanks for adding your information!',
            },
        }

        it('should transform as expected', () => {
            const input = baseTransitoryAttachmentData
            const output = transformTransitoryToAttachment(input)

            expect(output).toMatchObject(baseExpectedAttachment)
        })

        it('should transform as expected if post submission message is disabled', () => {
            const input = {
                ...baseTransitoryAttachmentData,
                postSubmissionMessage: {
                    enabled: false,
                    message: 'Thanks for adding your information!',
                },
            }
            const output = transformTransitoryToAttachment(input)

            expect(output).toMatchObject({
                ...baseExpectedAttachment,
                on_success_content: {message: ''},
            })
        })

        it('should transform as expected if disclaimer is disabled', () => {
            const input = {
                ...baseTransitoryAttachmentData,
                forms: {
                    email: {
                        label: 'Foo',
                        cta: 'Bar',
                        disclaimerEnabled: false,
                        disclaimer: 'Lorem ipsum dolor',
                        preSelectDisclaimer: true,
                    },
                },
            }
            const output = transformTransitoryToAttachment(input)

            expect(output).toMatchObject({
                ...baseExpectedAttachment,
                disclaimer: '',
            })
        })
    })

    describe('transformAttachmentToTransitory', () => {
        it('should revert to the same state when called on a transformed transitory', () => {
            const baseTransitoryAttachmentData = {
                subscriberTypes: {
                    shopify: {
                        enabled: true,
                        isEmailSubscriber: true,
                        isSmsSubscriber: false,
                        tags: ['a', 'b', 'c'],
                    },
                },
                forms: {
                    email: {
                        label: 'Foo',
                        cta: 'Bar',
                        disclaimerEnabled: true,
                        disclaimer: 'Lorem ipsum dolor',
                        preSelectDisclaimer: true,
                    },
                },
                postSubmissionMessage: {
                    enabled: true,
                    message: 'Thanks for adding your information!',
                },
            }
            const middleState = transformTransitoryToAttachment(
                baseTransitoryAttachmentData
            )
            const output = transformAttachmentToTransitory(middleState)

            expect(output).toMatchObject(baseTransitoryAttachmentData)
        })
    })

    describe('handleContactFormSubmitted', () => {
        it('should delete and then create when attachment exists', () => {
            const mockDispatch = jest.fn()
            handleContactFormSubmitted(
                mockDispatch,
                fromJS([
                    {
                        contentType: AttachmentEnum.ContactForm,
                        name: 'Foo',
                        extra: undefined,
                    },
                ]),
                fromJS({
                    contentType: AttachmentEnum.ContactForm,
                    name: 'Bar',
                    extra: undefined,
                }),
                fromJS({}),
                true
            )
            expect(mockDispatch).toHaveBeenCalledWith(deleteAttachment(0))
            expect(mockDispatch).toHaveBeenCalledTimes(2)
        })

        it('should only create when attachment doesnt exists', () => {
            const mockDispatch = jest.fn()
            handleContactFormSubmitted(
                mockDispatch,
                fromJS([]),
                fromJS({
                    contentType: AttachmentEnum.ContactForm,
                    name: 'Foo',
                    extra: undefined,
                }),
                fromJS({}),
                true
            )
            expect(mockDispatch).toHaveBeenCalledTimes(1)
        })
    })
})
