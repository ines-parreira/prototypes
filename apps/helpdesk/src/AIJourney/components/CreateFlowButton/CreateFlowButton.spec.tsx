import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CreateFlowButton } from './CreateFlowButton'

const mockHistoryPush = jest.fn()

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiJourneyMultiInstanceFlows: 'ai-journey-multi-instance-flows',
        AiJourneyCustomFlowEnabled: 'ai-journey-custom-flow-enabled',
    },
    useFlag: jest.fn(() => false),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(() => ({ shopName: 'my-shop' })),
}))

const mockUseFlag = jest.requireMock('@repo/feature-flags').useFlag

describe('<CreateFlowButton />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(false)
        delete (window as any).USER_IMPERSONATED
    })

    describe('when AiJourneyMultiInstanceFlows flag is OFF', () => {
        it('renders nothing', () => {
            window.USER_IMPERSONATED = true
            const { container } = render(<CreateFlowButton />)

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('when AiJourneyMultiInstanceFlows flag is ON', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation(
                (key: string) => key === 'ai-journey-multi-instance-flows',
            )
            window.USER_IMPERSONATED = true
        })

        it('renders nothing when user is not impersonated', () => {
            delete (window as any).USER_IMPERSONATED
            const { container } = render(<CreateFlowButton />)

            expect(container).toBeEmptyDOMElement()
        })

        it('renders the "Create flow" button', () => {
            render(<CreateFlowButton />)

            expect(
                screen.getByRole('button', { name: /create flow/i }),
            ).toBeInTheDocument()
        })

        it('opens a dropdown with all standard journey type options when clicked', async () => {
            const user = userEvent.setup()
            render(<CreateFlowButton />)

            await user.click(
                screen.getByRole('button', { name: /create flow/i }),
            )

            expect(
                screen.getByRole('menuitem', { name: /post-purchase/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /welcome/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /cart abandoned/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /customer win-back/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /browse abandoned/i }),
            ).toBeInTheDocument()
        })

        it('does not show campaign or custom flow options when custom flow flag is OFF', async () => {
            const user = userEvent.setup()
            render(<CreateFlowButton />)

            await user.click(
                screen.getByRole('button', { name: /create flow/i }),
            )

            expect(
                screen.queryByRole('menuitem', { name: /campaign/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /custom flow/i }),
            ).not.toBeInTheDocument()
        })

        it('navigates to the correct setup path when a journey type is selected', async () => {
            const user = userEvent.setup()
            render(<CreateFlowButton />)

            await user.click(
                screen.getByRole('button', { name: /create flow/i }),
            )
            await user.click(
                screen.getByRole('menuitem', { name: /post-purchase/i }),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/my-shop/post-purchase/setup',
            )
        })

        it('navigates to welcome setup path when Welcome is selected', async () => {
            const user = userEvent.setup()
            render(<CreateFlowButton />)

            await user.click(
                screen.getByRole('button', { name: /create flow/i }),
            )
            await user.click(screen.getByRole('menuitem', { name: /welcome/i }))

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/my-shop/welcome/setup',
            )
        })

        describe('when AiJourneyCustomFlowEnabled flag is also ON', () => {
            beforeEach(() => {
                mockUseFlag.mockReturnValue(true)
            })

            it('shows Custom flow option in the dropdown', async () => {
                const user = userEvent.setup()
                render(<CreateFlowButton />)

                await user.click(
                    screen.getByRole('button', { name: /create flow/i }),
                )

                expect(
                    screen.getByRole('menuitem', { name: /custom flow/i }),
                ).toBeInTheDocument()
            })

            it('navigates to custom flow setup path when Custom Flow is selected', async () => {
                const user = userEvent.setup()
                render(<CreateFlowButton />)

                await user.click(
                    screen.getByRole('button', { name: /create flow/i }),
                )
                await user.click(
                    screen.getByRole('menuitem', { name: /custom flow/i }),
                )

                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/ai-journey/my-shop/custom/setup',
                )
            })
        })
    })
})
