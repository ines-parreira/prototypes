import { render, screen } from '@testing-library/react'

import {
    CreateAnActionBody,
    EnableAIAgentOnChatBody,
    EnableAIAgentOnEmailBody,
    EnableAskAnythingBody,
    EnableSuggestedProductsBody,
    EnableTriggerOnSearchBody,
    MonitorAiAgentBody,
    UpdateShopifyPermissionsBody,
    VerifyEmailDomainBody,
} from '../SetupTaskBodies'

describe('SetupTaskBodies', () => {
    describe('VerifyEmailDomainBody', () => {
        it('should render description and button', () => {
            render(<VerifyEmailDomainBody />)

            expect(
                screen.getByText(
                    'Ensure customers receive emails from the AI Agent by verifying your domain.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Verify' }),
            ).toBeInTheDocument()
        })
    })

    describe('UpdateShopifyPermissionsBody', () => {
        it('should render description and button', () => {
            render(<UpdateShopifyPermissionsBody />)

            expect(
                screen.getByText(
                    'Update Shopify permissions to give AI Agent to information about your customers, orders and products.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Update' }),
            ).toBeInTheDocument()
        })
    })

    describe('EnableTriggerOnSearchBody', () => {
        it('should render description and toggle', () => {
            render(<EnableTriggerOnSearchBody />)

            expect(
                screen.getByText(
                    'Guide shoppers to right products by having AI Agent start a conversation after they use search.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('EnableSuggestedProductsBody', () => {
        it('should render description and toggle', () => {
            render(<EnableSuggestedProductsBody />)

            expect(
                screen.getByText(
                    'Show dynamic, AI-generated questions on product pages to address common shopper questions. Brands that enable this feature see a significant lift in conversions.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('EnableAskAnythingBody', () => {
        it('should render description and toggle', () => {
            render(<EnableAskAnythingBody />)

            expect(
                screen.getByText(
                    'Transform your chat bubble into a persistent input bar that invites shoppers to ask questions anytime. Encourage engagement by keeping support top-of-mind while shoppers browse.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('CreateAnActionBody', () => {
        it('should render description and button', () => {
            render(<CreateAnActionBody />)

            expect(
                screen.getByText(
                    'Allow AI Agent to perform support tasks with your third-party apps, such as canceling orders, editing shipping addresses, and more.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Create' }),
            ).toBeInTheDocument()
        })
    })

    describe('MonitorAiAgentBody', () => {
        it('should render description and button', () => {
            render(<MonitorAiAgentBody />)

            expect(
                screen.getByText(
                    'Give feedback on AI Agent interactions to improve its accuracy and response quality for future customer requests.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Review' }),
            ).toBeInTheDocument()
        })
    })

    describe('EnableAIAgentOnChatBody', () => {
        it('should render description and toggle', () => {
            render(<EnableAIAgentOnChatBody />)

            expect(
                screen.getByText(
                    'Start automating conversations on email to save time and provide faster, more personalized responses to your customers.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('EnableAIAgentOnEmailBody', () => {
        it('should render description and toggle', () => {
            render(<EnableAIAgentOnEmailBody />)

            expect(
                screen.getByText(
                    'Start automating conversations on chat to save time and provide faster, more personalized responses to your customers.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('Component structure', () => {
        it('should apply consistent CSS class to all task bodies', () => {
            const { container: container1 } = render(<VerifyEmailDomainBody />)
            const { container: container2 } = render(
                <UpdateShopifyPermissionsBody />,
            )
            const { container: container3 } = render(
                <EnableTriggerOnSearchBody />,
            )

            expect(
                container1.querySelector('.setupTaskBodies'),
            ).toBeInTheDocument()
            expect(
                container2.querySelector('.setupTaskBodies'),
            ).toBeInTheDocument()
            expect(
                container3.querySelector('.setupTaskBodies'),
            ).toBeInTheDocument()
        })

        it('should wrap description text in setupTaskDescription div', () => {
            const { container } = render(<VerifyEmailDomainBody />)

            const descriptionDiv = container.querySelector(
                '.setupTaskDescription',
            )
            expect(descriptionDiv).toBeInTheDocument()
            expect(descriptionDiv).toHaveTextContent(
                'Ensure customers receive emails from the AI Agent by verifying your domain.',
            )
        })
    })

    describe('Component consistency', () => {
        const testCases = [
            {
                Component: VerifyEmailDomainBody,
                description:
                    'Ensure customers receive emails from the AI Agent by verifying your domain.',
                buttonText: 'Verify',
                hasButton: true,
            },
            {
                Component: UpdateShopifyPermissionsBody,
                description:
                    'Update Shopify permissions to give AI Agent to information about your customers, orders and products.',
                buttonText: 'Update',
                hasButton: true,
            },
            {
                Component: EnableTriggerOnSearchBody,
                description:
                    'Guide shoppers to right products by having AI Agent start a conversation after they use search.',
                buttonText: undefined,
                hasButton: false,
            },
            {
                Component: EnableSuggestedProductsBody,
                description:
                    'Show dynamic, AI-generated questions on product pages to address common shopper questions. Brands that enable this feature see a significant lift in conversions.',
                buttonText: undefined,
                hasButton: false,
            },
            {
                Component: EnableAskAnythingBody,
                description:
                    'Transform your chat bubble into a persistent input bar that invites shoppers to ask questions anytime. Encourage engagement by keeping support top-of-mind while shoppers browse.',
                buttonText: undefined,
                hasButton: false,
            },
            {
                Component: CreateAnActionBody,
                description:
                    'Allow AI Agent to perform support tasks with your third-party apps, such as canceling orders, editing shipping addresses, and more.',
                buttonText: 'Create',
                hasButton: true,
            },
            {
                Component: MonitorAiAgentBody,
                description:
                    'Give feedback on AI Agent interactions to improve its accuracy and response quality for future customer requests.',
                buttonText: 'Review',
                hasButton: true,
            },
            {
                Component: EnableAIAgentOnChatBody,
                description:
                    'Start automating conversations on email to save time and provide faster, more personalized responses to your customers.',
                buttonText: undefined,
                hasButton: false,
            },
            {
                Component: EnableAIAgentOnEmailBody,
                description:
                    'Start automating conversations on chat to save time and provide faster, more personalized responses to your customers.',
                buttonText: undefined,
                hasButton: false,
            },
        ]

        testCases.forEach(
            ({ Component, description, buttonText, hasButton }) => {
                it(`should have consistent structure for ${Component.name}`, () => {
                    const { container } = render(<Component />)

                    const mainContainer =
                        container.querySelector('.setupTaskBodies')
                    expect(mainContainer).toBeInTheDocument()

                    const descriptionContainer = container.querySelector(
                        '.setupTaskDescription',
                    )
                    expect(descriptionContainer).toBeInTheDocument()

                    expect(screen.getByText(description)).toBeInTheDocument()

                    if (hasButton && buttonText) {
                        const button = screen.getByRole('button', {
                            name: buttonText,
                        })
                        expect(button).toBeInTheDocument()
                        expect(button.tagName).toBe('BUTTON')
                    } else {
                        expect(screen.getByRole('switch')).toBeInTheDocument()
                    }
                })
            },
        )
    })
})
