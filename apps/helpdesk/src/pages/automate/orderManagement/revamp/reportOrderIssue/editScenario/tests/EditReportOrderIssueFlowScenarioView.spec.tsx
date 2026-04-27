import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { EditReportOrderIssueScenarioView } from '../EditReportOrderIssueFlowScenarioView'
import { useEditReportOrderIssueScenario } from '../hooks/useEditReportOrderIssueScenario'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        scenarioIndex: '0',
    }),
    useHistory: () => ({ push: jest.fn() }),
    useLocation: () => ({
        pathname:
            '/app/settings/order-management/shopify/my-store/report-issue/0/edit',
    }),
}))

jest.mock('../hooks/useEditReportOrderIssueScenario')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
)

jest.mock(
    '../../../components/OrderManagementFlowHeader/OrderManagementFlowHeader',
    () => ({
        OrderManagementFlowHeader: ({
            title,
            onSave,
            isSaveDisabled,
            isSaveLoading,
        }: {
            title: string
            onSave?: () => void
            isSaveDisabled?: boolean
            isSaveLoading?: boolean
        }) => (
            <div>
                <span>{title}</span>
                {onSave && (
                    <button
                        onClick={onSave}
                        disabled={isSaveDisabled}
                        aria-busy={isSaveLoading}
                    >
                        Save
                    </button>
                )}
            </div>
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/components/SaveChangesPrompt',
    () => ({
        __esModule: true,
        default: ({ when }: { when: boolean }) => (
            <div data-testid="save-changes-prompt" data-when={when} />
        ),
    }),
)

jest.mock(
    '../../scenarioForm/conditionBuilder/ScenarioConditionBuilder',
    () => ({
        ScenarioConditionBuilder: ({
            onChange,
        }: {
            onChange: (v: any) => void
        }) => (
            <button onClick={() => onChange({ and: [{ or: [] }] })}>
                ScenarioConditionBuilder
            </button>
        ),
    }),
)

jest.mock('../../scenarioForm/reasonEditor/ScenarioReasonEditor', () => ({
    ScenarioReasonEditor: ({
        onChange,
        onExpandedReasonChange,
    }: {
        onChange: (v: any) => void
        onExpandedReasonChange?: (reasonKey: string | null) => void
    }) => (
        <>
            <button
                onClick={() =>
                    onChange([
                        {
                            reasonKey: 'reasonOther',
                            action: {
                                type: 'automated_response',
                                responseMessageContent: { html: '', text: '' },
                                showHelpfulPrompt: false,
                            },
                        },
                    ])
                }
            >
                ScenarioReasonEditor
            </button>
            <button onClick={() => onExpandedReasonChange?.('reasonOther')}>
                Expand reason
            </button>
            <button onClick={() => onExpandedReasonChange?.(null)}>
                Collapse reason
            </button>
        </>
    ),
}))

const mockUseEditReportOrderIssueScenario =
    useEditReportOrderIssueScenario as jest.MockedFunction<
        typeof useEditReportOrderIssueScenario
    >

const mockUpdatePreviewOrders = jest.fn()
const mockDisplayPage = jest.fn()
const mockOnChatPreviewLoaded = jest.fn()
const mockUseChatPreviewPanelContext =
    useChatPreviewPanelContext as jest.MockedFunction<
        typeof useChatPreviewPanelContext
    >

const defaultScenario = {
    title: 'Delivered',
    description: 'When order is delivered',
    conditions: { and: [] },
    newReasons: [],
}

const defaultEditReturn: ReturnType<typeof useEditReportOrderIssueScenario> = {
    scenario: defaultScenario,
    isFallback: false,
    isLoading: false,
    isUpdatePending: false,
    handleScenarioUpdate: jest.fn(),
    handleScenarioDelete: jest.fn(),
}

describe('EditReportOrderIssueScenarioView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseEditReportOrderIssueScenario.mockReturnValue(defaultEditReturn)
        mockOnChatPreviewLoaded.mockImplementation(
            (callback, fireIfAlreadyLoaded) => {
                if (fireIfAlreadyLoaded) {
                    callback()
                }
                return jest.fn()
            },
        )
        mockUseChatPreviewPanelContext.mockReturnValue({
            updatePreviewOrders: mockUpdatePreviewOrders,
            displayPage: mockDisplayPage,
            onChatPreviewLoaded: mockOnChatPreviewLoaded,
        } as any)
    })

    it('should render null while loading', () => {
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            isLoading: true,
            scenario: null as unknown as SelfServiceReportIssueCase,
        })

        const { container } = render(<EditReportOrderIssueScenarioView />)

        expect(container).toBeEmptyDOMElement()
    })

    it('should render null when scenario is not found', () => {
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            scenario: null as unknown as SelfServiceReportIssueCase,
        })

        const { container } = render(<EditReportOrderIssueScenarioView />)

        expect(container).toBeEmptyDOMElement()
    })

    it('should render the header with Edit scenario title', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(screen.getByText('Edit scenario')).toBeInTheDocument()
    })

    it('should pre-populate the name field with the existing scenario title', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('textbox', { name: /scenario name/i }),
        ).toHaveValue('Delivered')
    })

    it('should render the condition builder for non-fallback scenarios', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('button', { name: 'ScenarioConditionBuilder' }),
        ).toBeInTheDocument()
    })

    it('should not render the condition builder for fallback scenarios', () => {
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            isFallback: true,
        })

        render(<EditReportOrderIssueScenarioView />)

        expect(
            screen.queryByRole('button', { name: 'ScenarioConditionBuilder' }),
        ).not.toBeInTheDocument()
    })

    it('should show fallback description for fallback scenarios', () => {
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            isFallback: true,
        })

        render(<EditReportOrderIssueScenarioView />)

        expect(
            screen.getByText(
                /this scenario applies to all orders that don't match any other scenario/i,
            ),
        ).toBeInTheDocument()
    })

    it('should render the reason editor', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('button', { name: 'ScenarioReasonEditor' }),
        ).toBeInTheDocument()
    })

    it('should render a disabled Save button when form is clean', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should enable the Save button after editing', async () => {
        const user = userEvent.setup()
        render(<EditReportOrderIssueScenarioView />)

        await user.clear(
            screen.getByRole('textbox', { name: /scenario name/i }),
        )
        await user.type(
            screen.getByRole('textbox', { name: /scenario name/i }),
            'Updated',
        )

        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    })

    it('should show loading state on Save while update is pending', () => {
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            isUpdatePending: true,
        })

        render(<EditReportOrderIssueScenarioView />)

        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'aria-busy',
            'true',
        )
    })

    it('should call handleScenarioUpdate on save with correct shape', async () => {
        const user = userEvent.setup()
        const handleScenarioUpdate = jest.fn()
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            handleScenarioUpdate,
        })

        render(<EditReportOrderIssueScenarioView />)

        await user.clear(
            screen.getByRole('textbox', { name: /scenario name/i }),
        )
        await user.type(
            screen.getByRole('textbox', { name: /scenario name/i }),
            'In Transit',
        )

        act(() => {
            screen
                .getByRole('button', { name: 'ScenarioConditionBuilder' })
                .click()
        })

        act(() => {
            screen.getByRole('button', { name: 'ScenarioReasonEditor' }).click()
        })

        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(handleScenarioUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'In Transit',
                conditions: { and: [{ or: [] }] },
                newReasons: expect.arrayContaining([
                    expect.objectContaining({ reasonKey: 'reasonOther' }),
                ]),
            }),
        )
    })

    it('should not show the delete button for fallback scenarios', () => {
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            isFallback: true,
        })

        render(<EditReportOrderIssueScenarioView />)

        expect(
            screen.queryByRole('button', { name: 'Delete scenario' }),
        ).not.toBeInTheDocument()
    })

    it('should show the delete button for non-fallback scenarios', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('button', { name: 'Delete scenario' }),
        ).toBeInTheDocument()
    })

    it('should open the delete confirmation modal when clicking Delete scenario', async () => {
        const user = userEvent.setup()
        render(<EditReportOrderIssueScenarioView />)

        await user.click(
            screen.getByRole('button', { name: 'Delete scenario' }),
        )

        expect(
            screen.getByRole('heading', { name: 'Delete scenario' }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/are you sure you want to delete this scenario/i),
        ).toBeInTheDocument()
    })

    it('should call handleScenarioDelete when confirming delete', async () => {
        const user = userEvent.setup()
        const handleScenarioDelete = jest.fn()
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            handleScenarioDelete,
        })

        render(<EditReportOrderIssueScenarioView />)

        await user.click(
            screen.getByRole('button', { name: 'Delete scenario' }),
        )
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(handleScenarioDelete).toHaveBeenCalled()
    })

    it('should not prompt for unsaved changes when form is clean', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(screen.getByTestId('save-changes-prompt')).toHaveAttribute(
            'data-when',
            'false',
        )
    })

    it('should prompt for unsaved changes after editing', async () => {
        const user = userEvent.setup()
        render(<EditReportOrderIssueScenarioView />)

        await user.clear(
            screen.getByRole('textbox', { name: /scenario name/i }),
        )
        await user.type(
            screen.getByRole('textbox', { name: /scenario name/i }),
            'x',
        )

        expect(screen.getByTestId('save-changes-prompt')).toHaveAttribute(
            'data-when',
            'true',
        )
    })

    it('should not crash when save fails', async () => {
        const user = userEvent.setup()
        const handleScenarioUpdate = jest
            .fn()
            .mockRejectedValue(new Error('fail'))
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            handleScenarioUpdate,
        })

        render(<EditReportOrderIssueScenarioView />)

        await user.clear(
            screen.getByRole('textbox', { name: /scenario name/i }),
        )
        await user.type(
            screen.getByRole('textbox', { name: /scenario name/i }),
            'Updated',
        )

        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(handleScenarioUpdate).toHaveBeenCalled()
    })

    it('should not crash when delete fails', async () => {
        const user = userEvent.setup()
        const handleScenarioDelete = jest
            .fn()
            .mockRejectedValue(new Error('fail'))
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            handleScenarioDelete,
        })

        render(<EditReportOrderIssueScenarioView />)

        await user.click(
            screen.getByRole('button', { name: 'Delete scenario' }),
        )
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(handleScenarioDelete).toHaveBeenCalled()
    })

    it('should close the delete modal when clicking Cancel', async () => {
        const user = userEvent.setup()
        render(<EditReportOrderIssueScenarioView />)

        await user.click(
            screen.getByRole('button', { name: 'Delete scenario' }),
        )
        expect(
            screen.getByRole('heading', { name: 'Delete scenario' }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(
            screen.queryByRole('heading', { name: 'Delete scenario' }),
        ).not.toBeInTheDocument()
    })

    it('should close the delete modal when clicking the close button', async () => {
        const user = userEvent.setup()
        render(<EditReportOrderIssueScenarioView />)

        await user.click(
            screen.getByRole('button', { name: 'Delete scenario' }),
        )
        await user.click(screen.getByRole('button', { name: 'Close modal' }))

        expect(
            screen.queryByRole('heading', { name: 'Delete scenario' }),
        ).not.toBeInTheDocument()
    })

    it('should disable Save when form has validation errors from ScenarioFormContext', async () => {
        const user = userEvent.setup()
        render(<EditReportOrderIssueScenarioView />)

        await user.clear(
            screen.getByRole('textbox', { name: /scenario name/i }),
        )
        await user.type(
            screen.getByRole('textbox', { name: /scenario name/i }),
            'Updated',
        )

        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    })

    it('should keep Save button disabled when the scenario name is cleared', async () => {
        const user = userEvent.setup()
        render(<EditReportOrderIssueScenarioView />)

        await user.clear(
            screen.getByRole('textbox', { name: /scenario name/i }),
        )

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should render the description field with the scenario description', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('textbox', { name: /scenario description/i }),
        ).toHaveValue('When order is delivered')
    })

    it('should navigate the chat preview to the report page on mount', () => {
        render(<EditReportOrderIssueScenarioView />)

        expect(mockDisplayPage).toHaveBeenCalledWith(
            'report',
            expect.objectContaining({ orderName: expect.any(String) }),
        )
    })

    it('should push the current reasons to the chat preview', () => {
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            scenario: {
                ...defaultScenario,
                newReasons: [
                    {
                        reasonKey: 'reasonOther',
                        action: {
                            type: 'automated_response',
                            responseMessageContent: { html: '', text: '' },
                            showHelpfulPrompt: false,
                        },
                    },
                ],
            } as unknown as SelfServiceReportIssueCase,
        })

        render(<EditReportOrderIssueScenarioView />)

        expect(mockUpdatePreviewOrders).toHaveBeenCalledWith(
            expect.objectContaining({
                orders: expect.objectContaining({
                    '#1001': expect.objectContaining({
                        fulfillments: expect.arrayContaining([
                            expect.objectContaining({
                                flows: expect.objectContaining({
                                    report_issue_reasons: [
                                        expect.objectContaining({
                                            reasonKey: 'reasonOther',
                                        }),
                                    ],
                                }),
                            }),
                        ]),
                    }),
                }),
            }),
        )
    })

    it('should sync the chat preview when reasons change', () => {
        render(<EditReportOrderIssueScenarioView />)

        mockUpdatePreviewOrders.mockClear()

        act(() => {
            screen.getByRole('button', { name: 'ScenarioReasonEditor' }).click()
        })

        expect(mockUpdatePreviewOrders).toHaveBeenCalledWith(
            expect.objectContaining({
                orders: expect.objectContaining({
                    '#1001': expect.objectContaining({
                        fulfillments: expect.arrayContaining([
                            expect.objectContaining({
                                flows: expect.objectContaining({
                                    report_issue_reasons: [
                                        expect.objectContaining({
                                            reasonKey: 'reasonOther',
                                        }),
                                    ],
                                }),
                            }),
                        ]),
                    }),
                }),
            }),
        )
    })

    it('should navigate the chat preview to the reported-issue page when a reason is expanded', async () => {
        const user = userEvent.setup()
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            scenario: {
                ...defaultScenario,
                newReasons: [
                    {
                        reasonKey: 'reasonOther',
                        action: {
                            type: 'automated_response',
                            responseMessageContent: {
                                html: '<p>Response</p>',
                                text: 'Response',
                            },
                            showHelpfulPrompt: true,
                        },
                    },
                ],
            } as unknown as SelfServiceReportIssueCase,
        })

        render(<EditReportOrderIssueScenarioView />)

        mockDisplayPage.mockClear()

        await user.click(screen.getByRole('button', { name: 'Expand reason' }))

        expect(mockDisplayPage).toHaveBeenCalledWith('reported-issue', {
            orderName: '#1001',
            reasonKey: 'reasonOther',
            responseText: 'Response',
            showHelpfulPrompt: true,
        })
    })

    it('should fall back to empty response text and false helpful prompt when the expanded reason has no action', async () => {
        const user = userEvent.setup()
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            scenario: {
                ...defaultScenario,
                newReasons: [
                    {
                        reasonKey: 'reasonOther',
                    },
                ],
            } as unknown as SelfServiceReportIssueCase,
        })

        render(<EditReportOrderIssueScenarioView />)

        mockDisplayPage.mockClear()

        await user.click(screen.getByRole('button', { name: 'Expand reason' }))

        expect(mockDisplayPage).toHaveBeenCalledWith('reported-issue', {
            orderName: '#1001',
            reasonKey: 'reasonOther',
            responseText: '',
            showHelpfulPrompt: false,
        })
    })

    it('should navigate the chat preview back to the report page when the reason is collapsed', async () => {
        const user = userEvent.setup()
        mockUseEditReportOrderIssueScenario.mockReturnValue({
            ...defaultEditReturn,
            scenario: {
                ...defaultScenario,
                newReasons: [
                    {
                        reasonKey: 'reasonOther',
                        action: {
                            type: 'automated_response',
                            responseMessageContent: {
                                html: '<p>Response</p>',
                                text: 'Response',
                            },
                            showHelpfulPrompt: true,
                        },
                    },
                ],
            } as unknown as SelfServiceReportIssueCase,
        })

        render(<EditReportOrderIssueScenarioView />)

        await user.click(screen.getByRole('button', { name: 'Expand reason' }))

        mockDisplayPage.mockClear()

        await user.click(
            screen.getByRole('button', { name: 'Collapse reason' }),
        )

        expect(mockDisplayPage).toHaveBeenCalledWith('report', {
            orderName: '#1001',
        })
    })

    it('should reset the chat preview to the homepage on unmount', () => {
        const { unmount } = render(<EditReportOrderIssueScenarioView />)

        mockDisplayPage.mockClear()
        unmount()

        expect(mockDisplayPage).toHaveBeenCalledWith('homepage')
    })
})
