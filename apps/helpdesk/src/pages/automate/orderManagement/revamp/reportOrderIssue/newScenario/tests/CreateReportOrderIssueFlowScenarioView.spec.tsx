import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { CreateReportOrderIssueScenarioView } from '../CreateReportOrderIssueFlowScenarioView'
import { useCreateReportOrderIssueScenario } from '../hooks/useCreateReportOrderIssueScenario'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: jest.fn() }),
    useLocation: () => ({
        pathname:
            '/app/settings/order-management/shopify/my-store/report-issue/new',
    }),
    useParams: () => ({ shopType: 'shopify', shopName: 'my-store' }),
}))

jest.mock('../hooks/useCreateReportOrderIssueScenario')
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
                                responseMessageContent: {
                                    html: '<p>Response</p>',
                                    text: 'Response',
                                },
                                showHelpfulPrompt: true,
                            },
                        },
                    ])
                }
            >
                ScenarioReasonEditor
            </button>
            <button onClick={() => onChange([{ reasonKey: 'reasonOther' }])}>
                ScenarioReasonEditor without action
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

const mockUseCreateReportOrderIssueScenario =
    useCreateReportOrderIssueScenario as jest.MockedFunction<
        typeof useCreateReportOrderIssueScenario
    >

const mockUpdatePreviewOrders = jest.fn()
const mockDisplayPage = jest.fn()
const mockOnChatPreviewLoaded = jest.fn()
const mockUseChatPreviewPanelContext =
    useChatPreviewPanelContext as jest.MockedFunction<
        typeof useChatPreviewPanelContext
    >

const defaultCreateReturn = {
    isCreatePending: false,
    handleScenarioCreate: jest.fn(),
}

describe('CreateReportOrderIssueScenarioView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseCreateReportOrderIssueScenario.mockReturnValue(
            defaultCreateReturn,
        )
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

    it('should render the header with correct title', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(screen.getByText('Create scenario')).toBeInTheDocument()
    })

    it('should render the scenario name field', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('textbox', { name: /scenario name/i }),
        ).toBeInTheDocument()
    })

    it('should render the condition builder', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('button', { name: 'ScenarioConditionBuilder' }),
        ).toBeInTheDocument()
    })

    it('should render the reason editor', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('button', { name: 'ScenarioReasonEditor' }),
        ).toBeInTheDocument()
    })

    it('should render a disabled Save button when form is clean', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should enable Save button after typing in the name field', async () => {
        const user = userEvent.setup()
        render(<CreateReportOrderIssueScenarioView />)

        await user.type(
            screen.getByRole('textbox', { name: /scenario name/i }),
            'My scenario',
        )

        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    })

    it('should keep Save button disabled when conditions child reports an error', async () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should show loading state on Save while create is pending', () => {
        mockUseCreateReportOrderIssueScenario.mockReturnValue({
            ...defaultCreateReturn,
            isCreatePending: true,
        })

        render(<CreateReportOrderIssueScenarioView />)

        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'aria-busy',
            'true',
        )
    })

    it('should call handleScenarioCreate on save with correct shape', async () => {
        const user = userEvent.setup()
        const handleScenarioCreate = jest.fn()
        mockUseCreateReportOrderIssueScenario.mockReturnValue({
            ...defaultCreateReturn,
            handleScenarioCreate,
        })

        render(<CreateReportOrderIssueScenarioView />)

        await user.type(
            screen.getByRole('textbox', { name: /scenario name/i }),
            'Delivered',
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

        expect(handleScenarioCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Delivered',
                conditions: { and: [{ or: [] }] },
                newReasons: expect.arrayContaining([
                    expect.objectContaining({ reasonKey: 'reasonOther' }),
                ]),
            }),
        )
    })

    it('should not prompt for unsaved changes when form is clean', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(screen.getByTestId('save-changes-prompt')).toHaveAttribute(
            'data-when',
            'false',
        )
    })

    it('should prompt for unsaved changes after editing the name', async () => {
        const user = userEvent.setup()
        render(<CreateReportOrderIssueScenarioView />)

        await user.type(
            screen.getByRole('textbox', { name: /scenario name/i }),
            'x',
        )

        expect(screen.getByTestId('save-changes-prompt')).toHaveAttribute(
            'data-when',
            'true',
        )
    })

    it('should render the scenario description field', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(
            screen.getByRole('textbox', { name: /scenario description/i }),
        ).toBeInTheDocument()
    })

    it('should keep Save button disabled when only the description field is filled', async () => {
        const user = userEvent.setup()
        render(<CreateReportOrderIssueScenarioView />)

        await user.type(
            screen.getByRole('textbox', { name: /scenario description/i }),
            'My description',
        )

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should render Order conditions and Issue options sections', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(screen.getByText('Order conditions')).toBeInTheDocument()
        expect(screen.getByText('Issue options')).toBeInTheDocument()
    })

    it('should navigate the chat preview to the report page on mount', () => {
        render(<CreateReportOrderIssueScenarioView />)

        expect(mockDisplayPage).toHaveBeenCalledWith(
            'report',
            expect.objectContaining({ orderName: expect.any(String) }),
        )
    })

    it('should sync the chat preview when reasons change', () => {
        render(<CreateReportOrderIssueScenarioView />)

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
        render(<CreateReportOrderIssueScenarioView />)

        act(() => {
            screen.getByRole('button', { name: 'ScenarioReasonEditor' }).click()
        })

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
        render(<CreateReportOrderIssueScenarioView />)

        act(() => {
            screen
                .getByRole('button', {
                    name: 'ScenarioReasonEditor without action',
                })
                .click()
        })

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
        render(<CreateReportOrderIssueScenarioView />)

        act(() => {
            screen.getByRole('button', { name: 'ScenarioReasonEditor' }).click()
        })

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
        const { unmount } = render(<CreateReportOrderIssueScenarioView />)

        mockDisplayPage.mockClear()

        unmount()

        expect(mockDisplayPage).toHaveBeenCalledWith('homepage')
    })
})
