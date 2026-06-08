import { render } from '@repo/testing'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { PreviewPanel } from './PreviewPanel'

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(() => ({
        warpToCollapsibleColumn: (children: React.ReactNode) => children,
        setCollapsibleColumnWidthConfig: jest.fn(),
    })),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useAiJourneyStoreConfiguration: jest.fn(() => ({
        storeConfiguration: null,
    })),
    useGeneratePlaygroundMessage: jest.fn(() => ({
        handleGenerateMessages: jest.fn().mockResolvedValue(undefined),
        playgroundMessages: [],
        isGeneratingMessages: false,
    })),
    useLastSelectedProduct: jest.fn(() => ({
        setLastSelectedProductId: jest.fn(),
    })),
}))

jest.mock('AIJourney/components', () => ({
    ...jest.requireActual('AIJourney/components'),
    PlaygroundPreview: ({
        onGenerateMessages,
        onClose,
    }: {
        onGenerateMessages: () => void
        onClose?: () => void
    }) => (
        <div>
            <button onClick={onGenerateMessages}>Generate messages</button>
            {onClose && (
                <button aria-label="Close from preview" onClick={onClose}>
                    Close
                </button>
            )}
        </div>
    ),
    TestingProductCard: ({
        onProductChange,
        isV3Architecture,
    }: {
        onProductChange?: (product: { id: string; image: null }) => void
        isV3Architecture?: boolean
    }) => (
        <div>
            <button
                onClick={() =>
                    onProductChange?.({ id: 'product-1', image: null })
                }
            >
                Select product
            </button>
            {isV3Architecture && <span>v3</span>}
            TestingProductCard
        </div>
    ),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockStore = configureMockStore([thunk])()

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: { message_instructions: '' },
    })
    return (
        <Provider store={mockStore}>
            <FormProvider {...methods}>{children}</FormProvider>
        </Provider>
    )
}

const renderComponent = (onClose = jest.fn()) =>
    render(<PreviewPanel onClose={onClose} />, { wrapper: Wrapper })

describe('<PreviewPanel />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('campaign journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.CAMPAIGN,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                currentIntegration: { id: 1 },
            })
        })

        it('should not render the "Test configuration" section for a campaign', () => {
            renderComponent()

            expect(
                screen.queryByText('Test configuration'),
            ).not.toBeInTheDocument()
        })

        it('should not render TestingProductCard for a campaign', () => {
            renderComponent()

            expect(
                screen.queryByText('TestingProductCard'),
            ).not.toBeInTheDocument()
        })

        it('should render a close button via PlaygroundPreview', () => {
            const mockOnClose = jest.fn()
            renderComponent(mockOnClose)

            expect(
                screen.getByRole('button', { name: /close from preview/i }),
            ).toBeInTheDocument()
        })
    })

    describe('welcome journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.WELCOME,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.WELCOME,
                currentIntegration: { id: 1 },
            })
        })

        it('should render the "Test configuration" section', () => {
            renderComponent()

            expect(screen.getByText('Test configuration')).toBeInTheDocument()
        })

        it('should render "Returning customer" toggle', () => {
            renderComponent()

            expect(
                screen.getByRole('switch', { name: /returning customer/i }),
            ).toBeInTheDocument()
        })

        it('should not render TestingProductCard for welcome', () => {
            renderComponent()

            expect(
                screen.queryByText('TestingProductCard'),
            ).not.toBeInTheDocument()
        })

        it('should call onClose when close button in test configuration is clicked', async () => {
            const mockOnClose = jest.fn()
            const user = userEvent.setup()
            renderComponent(mockOnClose)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /close preview/i }),
                )
            })

            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    describe('cart abandonment journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.CART_ABANDONMENT,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                currentIntegration: { id: 1 },
            })
        })

        it('should render the "Test configuration" heading', () => {
            renderComponent()

            expect(screen.getByText('Test configuration')).toBeInTheDocument()
        })

        it('should render TestingProductCard', () => {
            renderComponent()

            expect(screen.getByText('TestingProductCard')).toBeInTheDocument()
        })

        it('should render TestingProductCard with isV3Architecture prop', () => {
            renderComponent()

            expect(screen.getByText('v3')).toBeInTheDocument()
        })

        it('should not render "Returning customer" toggle', () => {
            renderComponent()

            expect(
                screen.queryByRole('switch', { name: /returning customer/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('win-back journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.WIN_BACK,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.WIN_BACK,
                currentIntegration: { id: 1 },
            })
        })

        it('should not render the "Test configuration" section', () => {
            renderComponent()

            expect(
                screen.queryByText('Test configuration'),
            ).not.toBeInTheDocument()
        })

        it('should not render TestingProductCard', () => {
            renderComponent()

            expect(
                screen.queryByText('TestingProductCard'),
            ).not.toBeInTheDocument()
        })

        it('should render a close button via PlaygroundPreview (no config section)', () => {
            const mockOnClose = jest.fn()
            renderComponent(mockOnClose)

            expect(
                screen.getByRole('button', { name: /close from preview/i }),
            ).toBeInTheDocument()
        })
    })

    describe('returning customer toggle', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.WELCOME,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.WELCOME,
                currentIntegration: { id: 1 },
            })
        })

        it('should toggle returning customer state when the toggle is changed', async () => {
            const user = userEvent.setup()
            renderComponent()

            const toggle = screen.getByRole('switch', {
                name: /returning customer/i,
            })

            await act(async () => {
                await user.click(toggle)
            })
            expect(toggle).toBeChecked()
        })
    })

    describe('generate messages', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.CART_ABANDONMENT,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                currentIntegration: { id: 1 },
            })
        })

        it('should call handleGenerateMessages when generate button is clicked', async () => {
            const mockHandleGenerateMessages = jest
                .fn()
                .mockResolvedValue(undefined)
            const mockUseGeneratePlaygroundMessage = require('AIJourney/hooks')
                .useGeneratePlaygroundMessage as jest.Mock
            mockUseGeneratePlaygroundMessage.mockReturnValue({
                handleGenerateMessages: mockHandleGenerateMessages,
                playgroundMessages: [],
                isGeneratingMessages: false,
            })

            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /generate messages/i }),
                )
            })
            expect(mockHandleGenerateMessages).toHaveBeenCalled()
        })
    })

    describe('product selection', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.CART_ABANDONMENT,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                currentIntegration: { id: 1 },
            })
        })

        it('should call setLastSelectedProductId when a product is selected', async () => {
            const mockSetLastSelectedProductId = jest.fn()
            const mockUseLastSelectedProduct = require('AIJourney/hooks')
                .useLastSelectedProduct as jest.Mock
            mockUseLastSelectedProduct.mockReturnValue({
                setLastSelectedProductId: mockSetLastSelectedProductId,
            })

            const user = userEvent.setup()
            renderComponent()
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /select product/i }),
                )
            })

            expect(mockSetLastSelectedProductId).toHaveBeenCalledWith(
                'product-1',
            )
        })
    })

    describe('unsaved changes before preview', () => {
        const FormControls = () => {
            const { setValue, reset } = useFormContext()
            return (
                <>
                    <button
                        onClick={() =>
                            setValue('message_instructions', 'changed', {
                                shouldDirty: true,
                            })
                        }
                    >
                        Make dirty
                    </button>
                    <button
                        onClick={() =>
                            reset({ message_instructions: 'changed' })
                        }
                    >
                        Save form
                    </button>
                </>
            )
        }

        const renderWithFormControls = (
            promptUnsavedChanges: (callbacks?: {
                onClose?: () => void
            }) => void,
        ) => {
            const WrapperWithControls = ({
                children,
            }: {
                children: React.ReactNode
            }) => {
                const methods = useForm({
                    defaultValues: { message_instructions: '' },
                })
                return (
                    <Provider store={mockStore}>
                        <FormProvider {...methods}>
                            <FormControls />
                            {children}
                        </FormProvider>
                    </Provider>
                )
            }

            return render(
                <PreviewPanel
                    onClose={jest.fn()}
                    promptUnsavedChanges={promptUnsavedChanges}
                />,
                { wrapper: WrapperWithControls },
            )
        }

        let mockHandleGenerateMessages: jest.Mock

        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.CAMPAIGN,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                currentIntegration: { id: 1 },
            })

            mockHandleGenerateMessages = jest.fn().mockResolvedValue(undefined)
            const mockUseGeneratePlaygroundMessage = require('AIJourney/hooks')
                .useGeneratePlaygroundMessage as jest.Mock
            mockUseGeneratePlaygroundMessage.mockReturnValue({
                handleGenerateMessages: mockHandleGenerateMessages,
                playgroundMessages: [],
                isGeneratingMessages: false,
            })
        })

        it('should generate immediately when the form has no unsaved changes', async () => {
            const promptUnsavedChanges = jest.fn()
            const user = userEvent.setup()
            renderWithFormControls(promptUnsavedChanges)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /generate messages/i }),
                )
            })

            expect(mockHandleGenerateMessages).toHaveBeenCalled()
            expect(promptUnsavedChanges).not.toHaveBeenCalled()
        })

        it('should prompt for unsaved changes instead of generating when the form is dirty', async () => {
            const promptUnsavedChanges = jest.fn()
            const user = userEvent.setup()
            renderWithFormControls(promptUnsavedChanges)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /make dirty/i }),
                )
            })
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /generate messages/i }),
                )
            })

            expect(promptUnsavedChanges).toHaveBeenCalled()
            expect(mockHandleGenerateMessages).not.toHaveBeenCalled()
        })

        it('should generate after the form is saved when a preview was pending', async () => {
            const promptUnsavedChanges = jest.fn()
            const user = userEvent.setup()
            renderWithFormControls(promptUnsavedChanges)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /make dirty/i }),
                )
            })
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /generate messages/i }),
                )
            })

            expect(mockHandleGenerateMessages).not.toHaveBeenCalled()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /save form/i }),
                )
            })

            await waitFor(() => {
                expect(mockHandleGenerateMessages).toHaveBeenCalled()
            })
        })

        it('should not generate after save when the unsaved changes prompt was dismissed', async () => {
            const promptUnsavedChanges = jest.fn(
                (callbacks?: { onClose?: () => void }) =>
                    callbacks?.onClose?.(),
            )
            const user = userEvent.setup()
            renderWithFormControls(promptUnsavedChanges)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /make dirty/i }),
                )
            })
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /generate messages/i }),
                )
            })
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /save form/i }),
                )
            })

            expect(mockHandleGenerateMessages).not.toHaveBeenCalled()
        })
    })

    describe('message guidance variant selector', () => {
        const variants = [
            {
                id: 'uuid-1',
                message_instructions: 'Variant one guidance',
                weight: 30,
            },
            {
                id: 'uuid-2',
                message_instructions: 'Variant two guidance',
                weight: 20,
            },
        ]

        const renderWithDefaults = (defaultValues: Record<string, unknown>) => {
            const WrapperWithDefaults = ({
                children,
            }: {
                children: React.ReactNode
            }) => {
                const methods = useForm({ defaultValues })
                return (
                    <Provider store={mockStore}>
                        <FormProvider {...methods}>{children}</FormProvider>
                    </Provider>
                )
            }
            return render(<PreviewPanel onClose={jest.fn()} />, {
                wrapper: WrapperWithDefaults,
            })
        }

        const getGeneratePlaygroundMessageMock = () =>
            require('AIJourney/hooks').useGeneratePlaygroundMessage as jest.Mock

        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'j-1',
                    type: JOURNEY_TYPES.CART_ABANDONMENT,
                    configuration: {},
                },
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                currentIntegration: { id: 1 },
            })
        })

        it('should not render the selector when A/B testing is disabled', () => {
            renderWithDefaults({
                message_instructions: 'control',
                variants: [],
            })

            expect(
                screen.queryByRole('heading', { name: /message guidance/i }),
            ).not.toBeInTheDocument()
        })

        it('should render the selector when A/B testing is enabled', () => {
            renderWithDefaults({
                message_instructions: 'control guidance',
                variants,
            })

            expect(
                screen.getByRole('heading', { name: /message guidance/i }),
            ).toBeInTheDocument()
        })

        it('should pass the control instructions by default', () => {
            renderWithDefaults({
                message_instructions: 'control guidance',
                variants,
            })

            const lastCall =
                getGeneratePlaygroundMessageMock().mock.calls.at(-1)?.[0]
            expect(lastCall.journeyMessageInstructions).toBe('control guidance')
        })

        it('should pass the selected variant instructions when a variant is chosen', async () => {
            const user = userEvent.setup()
            renderWithDefaults({
                message_instructions: 'control guidance',
                variants,
            })

            await user.click(screen.getByRole('button', { name: /control/i }))

            const listbox = await screen.findByRole('listbox')
            await user.click(
                within(listbox).getByRole('option', { name: 'Variant 2' }),
            )

            await waitFor(() => {
                const lastCall =
                    getGeneratePlaygroundMessageMock().mock.calls.at(-1)?.[0]
                expect(lastCall.journeyMessageInstructions).toBe(
                    'Variant two guidance',
                )
            })
        })
    })
})
