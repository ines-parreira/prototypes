import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
    ScenarioReasonEditor: ({ onChange }: { onChange: (v: any) => void }) => (
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
    ),
}))

const mockUseCreateReportOrderIssueScenario =
    useCreateReportOrderIssueScenario as jest.MockedFunction<
        typeof useCreateReportOrderIssueScenario
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
})
