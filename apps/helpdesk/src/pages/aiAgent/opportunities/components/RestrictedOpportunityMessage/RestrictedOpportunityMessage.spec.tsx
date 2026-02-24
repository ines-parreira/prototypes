import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { State } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import { RestrictedOpportunityMessage } from './RestrictedOpportunityMessage'

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/common/components/TrialTryModal/TrialTryModal', () =>
    jest.fn(({ isOpen }) =>
        isOpen ? <div data-testid="trial-modal">Trial Modal</div> : null,
    ),
)
jest.mock('lottie-react', () => ({
    __esModule: true,
    default: jest.fn(({ animationData, ...props }) => (
        <div
            data-testid="lottie-animation"
            data-animation-data={JSON.stringify(animationData)}
            {...props}
        />
    )),
}))

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
const mockUseTrialAccess = useTrialAccess as jest.Mock
const mockUseShoppingAssistantTrialFlow =
    useShoppingAssistantTrialFlow as jest.Mock
const mockUseTrialModalProps = useTrialModalProps as jest.Mock
const mockUseStoreActivations = useStoreActivations as jest.Mock

const createMockPageState = (
    overrides: Partial<OpportunityPageState> = {},
): OpportunityPageState => ({
    state: State.RESTRICTED_NO_OPPORTUNITIES,
    isLoading: false,
    title: 'Upgrade to unlock more AI Agent opportunities',
    description:
        "You've reviewed 3 opportunities for AI Agent. To continue discovering and acting on new opportunities based on real customer conversations, upgrade your plan.",
    media: '/path/to/upgrade-image.jpg',
    primaryCta: {
        label: 'Try for 14 days',
    },
    showEmptyState: true,
    ...overrides,
})

const setupMocks = ({
    canSeeTrialCTA = false,
    canBookDemo = true,
    isTrialModalOpen = false,
}: {
    canSeeTrialCTA?: boolean
    canBookDemo?: boolean
    isTrialModalOpen?: boolean
} = {}) => {
    const openTrialUpgradeModal = jest.fn()

    mockUseAppSelector.mockImplementation((selector) => {
        const mockState = {
            currentAccount: fromJS({ domain: 'test-domain' }),
        }

        if (
            selector.name === 'getCurrentAccountState' ||
            selector.toString().includes('currentAccount')
        ) {
            return mockState.currentAccount
        }

        return fromJS({})
    })

    mockUseTrialAccess.mockReturnValue(
        createMockTrialAccess({
            canSeeTrialCTA,
            canBookDemo,
        }),
    )

    mockUseShoppingAssistantTrialFlow.mockReturnValue(
        getUseShoppingAssistantTrialFlowFixture({
            openTrialUpgradeModal,
            isTrialModalOpen,
        }),
    )

    mockUseTrialModalProps.mockReturnValue({
        newTrialUpgradePlanModal: {
            title: 'Try AI Agent',
            subtitle: 'Test subtitle',
            onClose: jest.fn(),
        },
    })

    mockUseStoreActivations.mockReturnValue({
        storeActivations: {},
        progressPercentage: 0,
        isFetchLoading: false,
        isSaveLoading: false,
    })

    return { openTrialUpgradeModal }
}

describe('RestrictedOpportunityMessage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the heading', () => {
        setupMocks()
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState()}
                shopName="test-shop"
            />,
        )

        expect(
            screen.getByRole('heading', {
                name: 'Upgrade to unlock more AI Agent opportunities',
            }),
        ).toBeInTheDocument()
    })

    it('should render the description text', () => {
        setupMocks()
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState()}
                shopName="test-shop"
            />,
        )

        expect(
            screen.getByText(/You've reviewed 3 opportunities for AI Agent/),
        ).toBeInTheDocument()
    })

    it('should render the media when provided', () => {
        setupMocks()
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState()}
                shopName="test-shop"
            />,
        )

        const media = screen.getByRole('img', { name: 'Upgrade opportunities' })
        expect(media).toBeInTheDocument()
    })

    it('should not render media when not provided', () => {
        setupMocks()
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState({ media: null })}
                shopName="test-shop"
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'Upgrade opportunities' }),
        ).not.toBeInTheDocument()
    })

    describe('CTA rendering based on merchant tier', () => {
        it('should render "Book a demo" button for enterprise merchants (canBookDemo=true, canSeeTrialCTA=false)', () => {
            setupMocks({
                canBookDemo: true,
                canSeeTrialCTA: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.getByRole('button', { name: 'Book a demo' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Try for 14 days' }),
            ).not.toBeInTheDocument()
        })

        it('should render trial button for base/commercial merchants (canSeeTrialCTA=true)', () => {
            setupMocks({
                canSeeTrialCTA: true,
                canBookDemo: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.getByRole('button', { name: 'Try for 14 days' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Book a demo' }),
            ).not.toBeInTheDocument()
        })

        it('should prioritize trial button when both canSeeTrialCTA and canBookDemo are true (commercial tier)', () => {
            setupMocks({
                canSeeTrialCTA: true,
                canBookDemo: true,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.getByRole('button', { name: 'Try for 14 days' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Book a demo' }),
            ).not.toBeInTheDocument()
        })

        it('should not render any CTA when neither canSeeTrialCTA nor canBookDemo are true', () => {
            setupMocks({
                canSeeTrialCTA: false,
                canBookDemo: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.queryByRole('button', { name: 'Book a demo' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Try for 14 days' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('CTA interactions', () => {
        it('should open demo URL when "Book a demo" button is clicked', async () => {
            const user = userEvent.setup()
            const windowOpenSpy = jest
                .spyOn(window, 'open')
                .mockImplementation(() => null)

            setupMocks({
                canBookDemo: true,
                canSeeTrialCTA: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Book a demo' }),
            )

            expect(windowOpenSpy).toHaveBeenCalledWith(
                'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_feature_opportunities_paywall',
                '_blank',
            )

            windowOpenSpy.mockRestore()
        })

        it('should open trial modal when trial button is clicked', async () => {
            const user = userEvent.setup()
            const { openTrialUpgradeModal } = setupMocks({
                canSeeTrialCTA: true,
                canBookDemo: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Try for 14 days' }),
            )

            expect(openTrialUpgradeModal).toHaveBeenCalled()
        })

        it('should show trial modal when isTrialModalOpen is true', () => {
            setupMocks({
                canSeeTrialCTA: true,
                canBookDemo: false,
                isTrialModalOpen: true,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            expect(screen.getByTestId('trial-modal')).toBeInTheDocument()
        })
    })

    describe('CTA label customization', () => {
        it('should use primaryCta label from opportunitiesPageState when available', () => {
            setupMocks({
                canSeeTrialCTA: true,
                canBookDemo: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        primaryCta: { label: 'Custom Trial Label' },
                    })}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.getByRole('button', { name: 'Custom Trial Label' }),
            ).toBeInTheDocument()
        })

        it('should use fallback label when primaryCta is not provided', () => {
            setupMocks({
                canSeeTrialCTA: true,
                canBookDemo: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        primaryCta: null,
                    })}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.getByRole('button', { name: 'Try for free' }),
            ).toBeInTheDocument()
        })

        it('should use fallback label when primaryCta label is empty string', () => {
            setupMocks({
                canSeeTrialCTA: true,
                canBookDemo: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        primaryCta: { label: '' },
                    })}
                    shopName="test-shop"
                />,
            )

            expect(screen.getByRole('button', { name: '' })).toBeInTheDocument()
        })
    })

    describe('hook initialization', () => {
        it('should call useTrialAccess with the correct shopName', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="my-custom-shop"
                />,
            )

            expect(mockUseTrialAccess).toHaveBeenCalledWith('my-custom-shop')
        })

        it('should call useStoreActivations with the correct storeName', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="another-shop"
                />,
            )

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: 'another-shop',
            })
        })

        it('should call useTrialModalProps with the correct storeName', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="props-test-shop"
                />,
            )

            expect(mockUseTrialModalProps).toHaveBeenCalledWith({
                storeName: 'props-test-shop',
            })
        })

        it('should call useShoppingAssistantTrialFlow with correct parameters', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="flow-test-shop"
                />,
            )

            expect(mockUseShoppingAssistantTrialFlow).toHaveBeenCalledWith(
                expect.objectContaining({
                    accountDomain: 'test-domain',
                    storeActivations: {},
                }),
            )
        })
    })

    describe('trial modal visibility', () => {
        it('should not render trial modal when isTrialModalOpen is false', () => {
            setupMocks({
                canSeeTrialCTA: true,
                canBookDemo: false,
                isTrialModalOpen: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            expect(screen.queryByTestId('trial-modal')).not.toBeInTheDocument()
        })

        it('should always render TrialTryModal component (visibility controlled by isOpen prop)', () => {
            setupMocks({
                canSeeTrialCTA: false,
                canBookDemo: true,
                isTrialModalOpen: false,
            })

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState()}
                    shopName="test-shop"
                />,
            )

            expect(screen.queryByTestId('trial-modal')).not.toBeInTheDocument()
        })
    })

    describe('content rendering variations', () => {
        it('should render with different title', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        title: 'Custom upgrade title',
                    })}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Custom upgrade title' }),
            ).toBeInTheDocument()
        })

        it('should render with different description', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        description: 'Custom description text for testing.',
                    })}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.getByText('Custom description text for testing.'),
            ).toBeInTheDocument()
        })

        it('should render with different media', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        media: '/custom/media/path.png',
                    })}
                    shopName="test-shop"
                />,
            )

            const media = screen.getByRole('img', {
                name: 'Upgrade opportunities',
            })
            expect(media).toBeInTheDocument()
        })
    })

    describe('Lottie animation support', () => {
        const mockLottieAnimationData = {
            v: '5.5.7',
            fr: 30,
            ip: 0,
            op: 60,
            w: 400,
            h: 400,
            nm: 'Test Animation',
            ddd: 0,
            assets: [],
            layers: [],
        }

        it('should render Lottie animation when media is an object', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        media: mockLottieAnimationData,
                    })}
                    shopName="test-shop"
                />,
            )

            const lottieElement = screen.getByTestId('lottie-animation')
            expect(lottieElement).toBeInTheDocument()
        })

        it('should pass animation data to Lottie component', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        media: mockLottieAnimationData,
                    })}
                    shopName="test-shop"
                />,
            )

            const lottieElement = screen.getByTestId('lottie-animation')
            expect(lottieElement).toHaveAttribute(
                'data-animation-data',
                JSON.stringify(mockLottieAnimationData),
            )
        })

        it('should render Lottie with correct accessibility attributes', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        media: mockLottieAnimationData,
                    })}
                    shopName="test-shop"
                />,
            )

            const lottieElement = screen.getByRole('img', {
                name: 'Upgrade opportunities',
            })
            expect(lottieElement).toBeInTheDocument()
        })

        it('should not render img element when media is an object', () => {
            setupMocks()

            const { container } = render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        media: mockLottieAnimationData,
                    })}
                    shopName="test-shop"
                />,
            )

            const imgElement = container.querySelector('img')
            expect(imgElement).not.toBeInTheDocument()
        })

        it('should render img element when media is a string', () => {
            setupMocks()

            render(
                <RestrictedOpportunityMessage
                    opportunitiesPageState={createMockPageState({
                        media: '/path/to/image.jpg',
                    })}
                    shopName="test-shop"
                />,
            )

            const imgElement = screen.getByRole('img', {
                name: 'Upgrade opportunities',
            })
            expect(imgElement).toHaveAttribute('src', '/path/to/image.jpg')
        })
    })
})
