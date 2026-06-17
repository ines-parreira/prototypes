import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'core/theme'
import {
    IntentMetric,
    KnowledgeMetric,
} from 'domains/reporting/state/ui/stats/types'

import { useIntentDrillDownTrigger } from '../../hooks/useIntentDrillDownTrigger'
import { useKnowledgeDrillDownTrigger } from '../../hooks/useKnowledgeDrillDownTrigger'
import { MetricCell } from './MetricCells'

jest.mock('../../hooks/useKnowledgeDrillDownTrigger')
jest.mock('../../hooks/useIntentDrillDownTrigger')
const mockUseKnowledgeDrillDownTrigger =
    useKnowledgeDrillDownTrigger as jest.Mock
const mockUseIntentDrillDownTrigger = useIntentDrillDownTrigger as jest.Mock
const mockStore = configureMockStore([thunk])
describe('MetricCell', () => {
    const mockOpenDrillDownModal = jest.fn()
    const defaultProps = {
        type: 'knowledge' as const,
        value: 50,
        metricName: KnowledgeMetric.Tickets,
        resourceSourceId: 123,
        resourceSourceSetId: 456,
        shopIntegrationId: 789,
        dateRange: {
            start_datetime: '2023-01-01',
            end_datetime: '2023-01-31',
        },
        outcomeCustomFieldId: 111,
        intentCustomFieldId: 222,
        displayValue: '50%',
        showProgressBar: true,
    }
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseKnowledgeDrillDownTrigger.mockReturnValue({
            openDrillDownModal: mockOpenDrillDownModal,
            tooltipText: 'View tickets',
        })
        mockUseIntentDrillDownTrigger.mockReturnValue({
            openDrillDownModal: mockOpenDrillDownModal,
            tooltipText: 'View intent tickets',
        })
    })
    const renderComponent = (props = {}) => {
        const __store = mockStore({})
        return render(
            <ThemeProvider>
                <MetricCell {...defaultProps} {...props} />
            </ThemeProvider>,
            {},
        )
    }
    it('should render the display value', () => {
        renderComponent()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })
    it('should render progress bar when showProgressBar is true', () => {
        renderComponent({ showProgressBar: true })
        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toBeInTheDocument()
        expect(progressBar).toHaveAttribute('aria-valuenow', '50')
        expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })
    it('should not render progress bar when showProgressBar is false', () => {
        renderComponent({ showProgressBar: false })
        const progressBar = screen.queryByRole('progressbar')
        expect(progressBar).not.toBeInTheDocument()
    })
    it('should call openDrillDownModal when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()
        await user.click(screen.getByText('50%'))
        expect(mockOpenDrillDownModal).toHaveBeenCalledTimes(1)
    })
    it('should initialize useKnowledgeDrillDownTrigger with correct parameters', () => {
        renderComponent()
        expect(mockUseKnowledgeDrillDownTrigger).toHaveBeenCalledWith({
            metricName: KnowledgeMetric.Tickets,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange: {
                start_datetime: '2023-01-01',
                end_datetime: '2023-01-31',
            },
            outcomeCustomFieldId: 111,
            intentCustomFieldId: 222,
            isSkillScoped: undefined,
        })
    })
    it('should pass isSkillScoped to useKnowledgeDrillDownTrigger when provided', () => {
        renderComponent({ isSkillScoped: true })
        expect(mockUseKnowledgeDrillDownTrigger).toHaveBeenCalledWith(
            expect.objectContaining({ isSkillScoped: true }),
        )
    })
    it('should render with different metric types', () => {
        renderComponent({
            metricName: KnowledgeMetric.HandoverTickets,
            displayValue: '25%',
        })
        expect(screen.getByText('25%')).toBeInTheDocument()
    })
    it('should render with CSAT metric', () => {
        renderComponent({
            metricName: KnowledgeMetric.CSAT,
            displayValue: '4.5',
            value: 4.5,
            showProgressBar: false,
        })
        expect(screen.getByText('4.5')).toBeInTheDocument()
    })
    it('should set progress bar width to value percentage', () => {
        renderComponent({
            value: 75,
            displayValue: '75%',
        })
        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-valuenow', '75')
    })
    it('should handle 0% value', () => {
        renderComponent({
            value: 0,
            displayValue: '0%',
        })
        expect(screen.getByText('0%')).toBeInTheDocument()
        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-valuenow', '0')
    })
    it('should handle 100% value', () => {
        renderComponent({
            value: 100,
            displayValue: '100%',
        })
        expect(screen.getByText('100%')).toBeInTheDocument()
        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    })
    it('should render numeric display value correctly', () => {
        renderComponent({
            displayValue: '150',
            value: 50,
        })
        expect(screen.getByText('150')).toBeInTheDocument()
    })
    it('should work without optional custom field IDs', () => {
        renderComponent({
            outcomeCustomFieldId: undefined,
            intentCustomFieldId: undefined,
        })
        expect(mockUseKnowledgeDrillDownTrigger).toHaveBeenCalledWith({
            metricName: KnowledgeMetric.Tickets,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange: {
                start_datetime: '2023-01-01',
                end_datetime: '2023-01-31',
            },
            outcomeCustomFieldId: undefined,
            intentCustomFieldId: undefined,
        })
    })
    describe('intent type', () => {
        const intentProps = {
            type: 'intent' as const,
            value: 30,
            metricName: IntentMetric.TicketVolume,
            intentName: 'order::status',
            integrationIds: ['integration-1'],
            dateRange: {
                start_datetime: '2023-01-01',
                end_datetime: '2023-01-31',
            },
            outcomeCustomFieldId: 111,
            intentCustomFieldId: 222,
            displayValue: '30%',
            showProgressBar: true,
        }
        const renderIntent = (props = {}) => {
            const __store = mockStore({})
            return render(
                <ThemeProvider>
                    <MetricCell {...intentProps} {...props} />
                </ThemeProvider>,
                {},
            )
        }
        it('should render the display value for intent type', () => {
            renderIntent()
            expect(screen.getByText('30%')).toBeInTheDocument()
        })
        it('should render progress bar for intent type', () => {
            renderIntent()
            expect(screen.getByRole('progressbar')).toHaveAttribute(
                'aria-valuenow',
                '30',
            )
        })
        it('should call openDrillDownModal from intent trigger when clicked', async () => {
            const user = userEvent.setup()
            renderIntent()
            await user.click(screen.getByText('30%'))
            expect(mockOpenDrillDownModal).toHaveBeenCalledTimes(1)
        })
        it('should initialize useIntentDrillDownTrigger with correct parameters', () => {
            renderIntent()
            expect(mockUseIntentDrillDownTrigger).toHaveBeenCalledWith({
                metricName: IntentMetric.TicketVolume,
                intentName: 'order::status',
                integrationIds: ['integration-1'],
                outcomeCustomFieldId: 111,
                intentCustomFieldId: 222,
                outcomeValue: undefined,
                dateRange: {
                    start_datetime: '2023-01-01',
                    end_datetime: '2023-01-31',
                },
                title: undefined,
            })
        })
        it('should pass outcomeValue for handover metric type', () => {
            renderIntent({
                metricName: IntentMetric.Handover,
                outcomeValue: 'ai_agent_handover',
                displayValue: '10%',
            })
            expect(mockUseIntentDrillDownTrigger).toHaveBeenCalledWith(
                expect.objectContaining({
                    metricName: IntentMetric.Handover,
                    outcomeValue: 'ai_agent_handover',
                }),
            )
        })
        it('should not render progress bar when showProgressBar is false', () => {
            renderIntent({ showProgressBar: false })
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        })
    })
})
