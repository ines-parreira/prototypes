import type { ReactNode } from 'react'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter, Route } from 'react-router-dom'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'

import { EmbeddedSpqsSettings } from '../EmbeddedSpqsSettings'
import useSpqInstallationStatus from '../hooks/useSpqInstallationStatus'

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock('../hooks/useSpqInstallationStatus')
jest.mock('../EmbeddedSpqSettingsDrawer', () => ({
    EmbeddedSpqSettingsDrawer: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
        shopName: string
    }) =>
        isOpen ? (
            <div role="dialog" aria-label="SPQ Settings Drawer">
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}))

const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)
const mockUseStoreIntegrationByShopName = jest.mocked(
    useStoreIntegrationByShopName,
)
const mockUseSpqInstallationStatus = jest.mocked(useSpqInstallationStatus)

const storeConfiguration = getStoreConfigurationFixture()

const FormWrapper = ({ children }: { children: ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            embeddedSpqEnabled: storeConfiguration?.embeddedSpqEnabled ?? false,
        },
    })
    return <FormProvider {...methods}>{children}</FormProvider>
}

const renderComponent = (shopName = 'test-store') => {
    return render(
        <MemoryRouter initialEntries={[`/shopify/${shopName}`]}>
            <Route path="/:shopType/:shopName">
                <FormWrapper>
                    <EmbeddedSpqsSettings shopName={shopName} />
                </FormWrapper>
            </Route>
        </MemoryRouter>,
    )
}

describe('EmbeddedSpqsSettings', () => {
    const mockUpdateStoreConfiguration = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStoreIntegrationByShopName.mockReturnValue({
            id: 123,
            name: 'Test Store',
        } as ReturnType<typeof useStoreIntegrationByShopName>)

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                embeddedSpqEnabled: false,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
    })

    describe('Set Up button visibility', () => {
        it('should display Set Up button when SPQ is not installed and not enabled', () => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: false,
                isLoaded: true,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Set Up' }),
            ).toBeInTheDocument()
        })

        it('should not display Set Up button when SPQ is installed', () => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: true,
                isLoaded: true,
            })

            renderComponent()

            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
        })

        it('should not display Set Up button when SPQ status is still loading', () => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: undefined,
                isLoaded: false,
            })

            renderComponent()

            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
        })

        it('should display toggle when embeddedSpqEnabled is true', () => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: false,
                isLoaded: true,
            })

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    embeddedSpqEnabled: true,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })

        it('should display toggle when SPQ is already installed', () => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: true,
                isLoaded: true,
            })

            renderComponent()

            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('Set Up button behavior', () => {
        it('should show loading spinner when isPendingCreateOrUpdate is true', () => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: false,
                isLoaded: true,
            })

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    embeddedSpqEnabled: false,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: true,
            })

            renderComponent()

            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
            expect(screen.getByRole('status')).toBeInTheDocument()
        })

        it('should call updateStoreConfiguration and open drawer when Set Up is clicked', async () => {
            const user = userEvent.setup()
            mockUpdateStoreConfiguration.mockResolvedValue(undefined)

            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: false,
                isLoaded: true,
            })

            renderComponent()

            const setupButton = screen.getByRole('button', { name: 'Set Up' })
            await act(() => user.click(setupButton))

            expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
                ...storeConfiguration,
                embeddedSpqEnabled: true,
            })
        })

        it('should not call updateStoreConfiguration when storeConfiguration is undefined', async () => {
            const user = userEvent.setup()

            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: false,
                isLoaded: true,
            })

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            const setupButton = screen.getByRole('button', { name: 'Set Up' })
            await act(() => user.click(setupButton))

            expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        })
    })

    describe('drawer behavior', () => {
        it('should open drawer when settings button is clicked on toggle', async () => {
            const user = userEvent.setup()

            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: true,
                isLoaded: true,
            })

            renderComponent()

            const settingsButton = screen.getByRole('button', {
                name: /settings/i,
            })
            await act(() => user.click(settingsButton))

            expect(
                screen.getByRole('dialog', { name: 'SPQ Settings Drawer' }),
            ).toBeInTheDocument()
        })

        it('should close drawer when close button is clicked', async () => {
            const user = userEvent.setup()

            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: true,
                isLoaded: true,
            })

            renderComponent()

            const settingsButton = screen.getByRole('button', {
                name: /settings/i,
            })
            await act(() => user.click(settingsButton))

            const drawer = screen.getByRole('dialog', {
                name: 'SPQ Settings Drawer',
            })
            const closeButton = within(drawer).getByRole('button', {
                name: 'Close',
            })
            await act(() => user.click(closeButton))

            expect(
                screen.queryByRole('dialog', { name: 'SPQ Settings Drawer' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('content rendering', () => {
        beforeEach(() => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: true,
                isLoaded: true,
            })
        })

        it('should render the card title', () => {
            renderComponent()
            expect(
                screen.getByText('AI FAQs: Embedded in page'),
            ).toBeInTheDocument()
        })

        it('should render the default description', () => {
            renderComponent()
            expect(
                screen.getByText(
                    /Show up to 3 dynamic, AI-generated questions embedded directly in product pages/,
                ),
            ).toBeInTheDocument()
        })

        it('should render custom description when provided', () => {
            render(
                <MemoryRouter initialEntries={['/shopify/test-store']}>
                    <Route path="/:shopType/:shopName">
                        <FormWrapper>
                            <EmbeddedSpqsSettings
                                shopName="test-store"
                                description="Custom description text"
                            />
                        </FormWrapper>
                    </Route>
                </MemoryRouter>,
            )

            expect(
                screen.getByText('Custom description text'),
            ).toBeInTheDocument()
        })

        it('should render the card image with correct alt text', () => {
            renderComponent()
            expect(
                screen.getByAltText(
                    'image showing an example of embedded FAQs',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('loading state', () => {
        it('should not display Set Up button when isLoading is true', () => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: false,
                isLoaded: true,
            })

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    embeddedSpqEnabled: false,
                },
                isLoading: true,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            expect(
                screen.queryByRole('button', { name: 'Set Up' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('integration with useStoreIntegrationByShopName', () => {
        it('should pass shopName to useStoreIntegrationByShopName', () => {
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: false,
                isLoaded: true,
            })

            renderComponent('my-custom-shop')

            expect(mockUseStoreIntegrationByShopName).toHaveBeenCalledWith(
                'my-custom-shop',
            )
        })

        it('should pass storeIntegration to useSpqInstallationStatus', () => {
            const mockIntegration = {
                id: 456,
                name: 'My Store',
            } as ReturnType<typeof useStoreIntegrationByShopName>

            mockUseStoreIntegrationByShopName.mockReturnValue(mockIntegration)
            mockUseSpqInstallationStatus.mockReturnValue({
                isSpqInstalled: false,
                isLoaded: true,
            })

            renderComponent()

            expect(mockUseSpqInstallationStatus).toHaveBeenCalledWith(
                mockIntegration,
            )
        })
    })
})
