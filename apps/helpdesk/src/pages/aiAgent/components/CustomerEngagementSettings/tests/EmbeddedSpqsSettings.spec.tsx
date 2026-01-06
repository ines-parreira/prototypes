import '@testing-library/jest-dom'

import type { ReactNode } from 'react'

import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { EmbeddedSpqsSettings } from 'pages/aiAgent/components/CustomerEngagementSettings/EmbeddedSpqsSettings'
import { notify } from 'state/notifications/actions'

jest.mock('utils', () => ({
    assetsUrl: jest.fn((path) => path),
}))

const mockCopyToClipboard = jest.fn()
jest.mock('@repo/hooks', () => ({
    useCopyToClipboard: () => [{}, mockCopyToClipboard],
    useKey: () => {},
}))

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockDispatch,
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/card/EngagementSettingsCardToggle',
    () => ({
        EngagementSettingsCardToggle: ({
            isChecked,
            onChange,
            onSettingsClick,
        }: any) => (
            <div>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onChange(e.target.checked)}
                    aria-label={
                        isChecked ? 'Disable engagement' : 'Enable engagement'
                    }
                />
                <button onClick={onSettingsClick} aria-label="Open settings">
                    Settings
                </button>
            </div>
        ),
    }),
)

jest.mock('../card/EngagementSettingsCard', () => ({
    EngagementSettingsCard: ({ children }: any) => <div>{children}</div>,
    EngagementSettingsCardContentWrapper: ({ children }: any) => (
        <div>{children}</div>
    ),
    EngagementSettingsCardImage: ({ alt, src }: any) => (
        <img alt={alt} src={src} />
    ),
    EngagementSettingsCardContent: ({ children }: any) => <div>{children}</div>,
    EngagementSettingsCardTitle: ({ children }: any) => <h3>{children}</h3>,
    EngagementSettingsCardDescription: ({ children }: any) => <p>{children}</p>,
}))

const mockNotify = notify as jest.Mock

const mockUpdateStoreConfiguration = jest.fn()
const mockCreateStoreConfiguration = jest.fn()

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    jest.requireMock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
        .useAiAgentStoreConfigurationContext,
)

type FormValues = {
    embeddedSpqEnabled: boolean
}

const FormWrapper = ({
    children,
    defaultValues = { embeddedSpqEnabled: false },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })
    return <FormProvider {...methods}>{children}</FormProvider>
}

describe('EmbeddedSpqsSettings - Functions', () => {
    beforeAll(() => {
        Element.prototype.getAnimations = function () {
            return []
        }
    })

    beforeEach(() => {
        mockDispatch.mockClear()
        mockCopyToClipboard.mockClear()
        mockNotify.mockClear()
        mockUpdateStoreConfiguration.mockClear()
        mockCreateStoreConfiguration.mockClear()

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
        })
    })

    describe('Setup button behavior', () => {
        it('should show "Set Up" button when embedded SPQ is disabled', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: false,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            expect(
                screen.getByRole('button', { name: 'Set Up' }),
            ).toBeInTheDocument()
            expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
        })

        it('should call updateStoreConfiguration when "Set Up" button is clicked', async () => {
            const user = userEvent.setup()
            const mockStoreConfig = {
                embeddedSpqEnabled: false,
            } as StoreConfiguration

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: mockStoreConfig,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            const setUpButton = screen.getByRole('button', { name: 'Set Up' })

            await act(() => user.click(setUpButton))

            expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
                ...mockStoreConfig,
                embeddedSpqEnabled: true,
            })
        })

        it('should show loading spinner while updating', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: false,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: true,
            })

            render(
                <FormWrapper>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Embedded FAQs')).toBeInTheDocument()
        })
    })

    describe('Toggle behavior', () => {
        it('should show toggle when embedded SPQ is enabled', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: true,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper defaultValues={{ embeddedSpqEnabled: true }}>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            expect(
                screen.getByRole('checkbox', { name: /disable engagement/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
        })

        it('should not show "Set Up" button when toggle is turned off', async () => {
            const user = userEvent.setup()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: true,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper defaultValues={{ embeddedSpqEnabled: true }}>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            const toggle = screen.getByRole('checkbox', {
                name: /disable engagement/i,
            })

            await act(() => user.click(toggle))

            expect(toggle).not.toBeChecked()
            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
            expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        })
    })

    describe('handleToggleChange', () => {
        it('should toggle state from false to true when toggle is clicked', async () => {
            const user = userEvent.setup()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: true,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            const toggle = screen.getByRole('checkbox', {
                name: /enable engagement/i,
            })

            expect(toggle).not.toBeChecked()

            await act(() => user.click(toggle))

            expect(toggle).toBeChecked()
        })

        it('should toggle state from true to false when toggle is clicked', async () => {
            const user = userEvent.setup()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: true,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper defaultValues={{ embeddedSpqEnabled: true }}>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            const toggle = screen.getByRole('checkbox', {
                name: /disable engagement/i,
            })

            await act(() => user.click(toggle))

            expect(toggle).not.toBeChecked()
        })

        it('should correctly update state on multiple toggle changes', async () => {
            const user = userEvent.setup()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: true,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            const initialToggle = screen.getByRole('checkbox', {
                name: /enable engagement/i,
            })

            await act(() => user.click(initialToggle))
            expect(initialToggle).toBeChecked()

            await act(() => user.click(initialToggle))
            expect(initialToggle).not.toBeChecked()

            await act(() => user.click(initialToggle))
            expect(initialToggle).toBeChecked()
        })
    })

    describe('handleSettingsClick', () => {
        it('should open drawer when settings button is clicked', async () => {
            const user = userEvent.setup()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: true,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper defaultValues={{ embeddedSpqEnabled: true }}>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            expect(
                screen.queryByRole('dialog', {
                    name: /embedded faqs settings/i,
                }),
            ).not.toBeInTheDocument()

            const settingsButton = screen.getByRole('button', {
                name: /open settings/i,
            })

            await act(() => user.click(settingsButton))

            expect(screen.getByRole('dialog')).toBeInTheDocument()

            expect(
                within(screen.getByRole('dialog')).getByText(
                    /Embedded product questions/i,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('handleCopyCode', () => {
        it('should copy code and dispatch notification when copy button is clicked', async () => {
            const user = userEvent.setup()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: true,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            const settingsButton = screen.getByRole('button', {
                name: /open settings/i,
            })

            await act(() => user.click(settingsButton))

            await act(() => user.click(screen.getByText(/Insert Code Block/i)))

            const copyCodeButton = screen.getByTestId(
                'embedded-spq-copy-button',
            )

            await act(() => user.click(copyCodeButton))

            expect(mockCopyToClipboard).toHaveBeenCalledWith(
                '<script id="gorgias-spq-script" src="https://config.gorgias.chat/conversation-starters/spq.js?shop=test-store.myshopify.com&source=manual"></script>',
            )

            expect(mockNotify).toHaveBeenCalledWith({
                message: 'Code successfully copied.',
                dismissAfter: 3000,
                status: 'success',
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                mockNotify.mock.results[0].value,
            )
        })
    })

    describe('handleDrawerOnClose', () => {
        it('should close drawer when close button is clicked', async () => {
            const user = userEvent.setup()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    embeddedSpqEnabled: true,
                } as StoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            render(
                <FormWrapper defaultValues={{ embeddedSpqEnabled: true }}>
                    <EmbeddedSpqsSettings shopName={'test-store'} />
                </FormWrapper>,
            )

            const settingsButton = screen.getByRole('button', {
                name: /open settings/i,
            })

            await act(() => user.click(settingsButton))

            expect(screen.getByRole('dialog')).toBeInTheDocument()

            const closeButton = screen.getByRole('button', {
                name: /close/i,
            })

            await act(() => user.click(closeButton))

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
