import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'

import { TicketStatus } from 'business/types/ticket'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { renderWithRouter } from 'utils/testing'

import useAutoQA from '../../hooks/useAutoQA'
import AutoQA from '../AutoQA'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('../../hooks/useAutoQA', () => jest.fn())
const useAutoQAMock = useAutoQA as jest.Mock

jest.mock('hooks/useHasAgentPrivileges', () => jest.fn())
const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.Mock

jest.mock('common/utils/useIsTicketAfterFeedbackCollectionPeriod')
const useTicketIsAfterFeedbackCollectionPeriodMock = assumeMock(
    useTicketIsAfterFeedbackCollectionPeriod,
)

jest.mock('@repo/tickets/feature-flags')
const useHelpdeskV2MS1FlagMock = assumeMock(useHelpdeskV2MS1Flag)

jest.mock('../AutoQASkeleton', () => () => <div>Loading...</div>)
jest.mock('../Dimension', () => () => <p>Dimension</p>)
jest.mock('../SaveBadge', () => ({ state }: { state: string }) => (
    <div data-testid="save-badge">{state}</div>
))
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge',
    () =>
        ({ state }: { state: number }) => (
            <div data-testid="auto-save-badge">{state}</div>
        ),
)

describe('AutoQA', () => {
    beforeEach(() => {
        useHasAgentPrivilegesMock.mockReturnValue(true)
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue({ id: 1, status: TicketStatus.Open })
        useHelpdeskV2MS1FlagMock.mockReturnValue(false)
        useAutoQAMock.mockReturnValue({
            changeHandlers: [],
            dimensions: [],
            isLoading: false,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
            saveState: 'idle',
        })
    })

    it('should render the component', () => {
        const { getByText } = renderWithRouter(<AutoQA />)
        expect(getByText('Auto QA Score')).toBeInTheDocument()
    })

    it('should render a skeleton while data is loading', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [
                { name: 'communication_skills' },
                { name: 'resolution' },
            ],
            isLoading: true,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
            saveState: 'idle',
        })

        const { getByText } = renderWithRouter(<AutoQA />)
        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should render a message if there is no data available on open tickets', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [],
            dimensions: [],
            isLoading: false,
            lastUpdated: null,
            saveState: 'idle',
        })

        const { getByText } = renderWithRouter(<AutoQA />)
        expect(
            getByText(
                'Auto QA results will be available 12 hours after ticket closure.',
            ),
        ).toBeInTheDocument()
    })

    it('should render a message if there is no data available on closed tickets', () => {
        useAppSelectorMock.mockReturnValue({
            id: 1,
            status: TicketStatus.Closed,
        })
        useAutoQAMock.mockReturnValue({
            changeHandlers: [],
            dimensions: [],
            isLoading: false,
            lastUpdated: null,
            saveState: 'idle',
        })

        const { getByText } = renderWithRouter(<AutoQA />)
        expect(
            getByText(
                /Only tickets that meet certain requirements are scored by Auto QA./,
            ),
        ).toBeInTheDocument()
    })

    it('should render each returned dimension', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [
                { name: 'communication_skills' },
                { name: 'resolution' },
            ],
            isLoading: false,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
            saveState: 'idle',
        })

        const { getAllByText } = renderWithRouter(<AutoQA />)
        const els = getAllByText('Dimension')
        expect(els.length).toBe(2)
    })

    xit('should render the last updated time', () => {
        const now = new Date()
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [
                { name: 'communication_skills' },
                { name: 'resolution' },
            ],
            isLoading: false,
            lastUpdated: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                21,
                0,
                0,
            ),
            saveState: 'idle',
        })
        const { getByText } = renderWithRouter(<AutoQA />)
        expect(getByText('Last updated: Today at 9:00 PM')).toBeInTheDocument()
    })

    it('should render Unauthorized when SimplifyAiAgentFeedbackCollection is enabled and has no agent privileges', () => {
        useHasAgentPrivilegesMock.mockReturnValue(false)

        const { getByText } = renderWithRouter(<AutoQA />)
        expect(getByText('Unauthorized')).toBeInTheDocument()
        expect(
            getByText('You do not have permission to view ticket feedback.'),
        ).toBeInTheDocument()
    })

    // Tests for newSaveBadgeState logic
    describe('saveBadgeState logic', () => {
        it('should set AutoSaveBadge state to SAVED when saveState is saved', () => {
            useAutoQAMock.mockReturnValue({
                changeHandlers: [],
                dimensions: [],
                isLoading: false,
                lastUpdated: new Date(),
                saveState: 'saved',
            })

            const { getByTestId } = renderWithRouter(<AutoQA />)
            expect(getByTestId('auto-save-badge').textContent).toBe(
                AutoSaveState.SAVED.toString(),
            )
        })

        it('should set AutoSaveBadge state to SAVED when prevSaveBadgeState is saved and saveState is idle', () => {
            // First render with 'saved' state
            useAutoQAMock.mockReturnValue({
                changeHandlers: [],
                dimensions: [],
                isLoading: false,
                lastUpdated: new Date(),
                saveState: 'saved',
            })

            const { rerender, getByTestId } = renderWithRouter(<AutoQA />)

            // Verify initial state is SAVED
            expect(getByTestId('auto-save-badge').textContent).toBe(
                AutoSaveState.SAVED.toString(),
            )

            // Then change to 'idle' state
            useAutoQAMock.mockReturnValue({
                changeHandlers: [],
                dimensions: [],
                isLoading: false,
                lastUpdated: new Date(),
                saveState: 'idle',
            })

            rerender(<AutoQA />)

            // Should still be in SAVED state because prevSaveBadgeState.current was 'saved'
            expect(getByTestId('auto-save-badge').textContent).toBe(
                AutoSaveState.SAVED.toString(),
            )
        })

        it('should set AutoSaveBadge state to SAVING when saveState is saving', () => {
            useAutoQAMock.mockReturnValue({
                changeHandlers: [],
                dimensions: [],
                isLoading: false,
                lastUpdated: new Date(),
                saveState: 'saving',
            })

            const { getByTestId } = renderWithRouter(<AutoQA />)
            expect(getByTestId('auto-save-badge').textContent).toBe(
                AutoSaveState.SAVING.toString(),
            )
        })

        it('should set AutoSaveBadge state to INITIAL for any other saveState value', () => {
            // Test with 'idle' state when prevSaveBadgeState is not 'saved'
            useAutoQAMock.mockReturnValue({
                changeHandlers: [],
                dimensions: [],
                isLoading: false,
                lastUpdated: new Date(),
                saveState: 'idle',
            })

            const { getByTestId } = renderWithRouter(<AutoQA />)
            expect(getByTestId('auto-save-badge').textContent).toBe(
                AutoSaveState.INITIAL.toString(),
            )
        })
    })

    describe('UIVisionMilestone1 feature flag', () => {
        it('should render star icon when UIVisionMilestone1 is enabled', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(true)

            const { container } = renderWithRouter(<AutoQA />)
            const titleWrapper = container.querySelector(
                '[class*="titleWrapper"]',
            )
            const starIcon = titleWrapper?.querySelector('svg')

            expect(titleWrapper).toBeInTheDocument()
            expect(starIcon).toBeInTheDocument()
        })

        it('should not render star icon when UIVisionMilestone1 is disabled', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(false)

            const { container } = renderWithRouter(<AutoQA />)
            const titleWrapper = container.querySelector(
                '[class*="titleWrapper"]',
            )
            const starIcon = titleWrapper?.querySelector('svg')

            expect(titleWrapper).toBeInTheDocument()
            expect(starIcon).not.toBeInTheDocument()
        })

        it('should apply hasUIVisionMS1 class to container when UIVisionMilestone1 is enabled', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(true)

            const { container } = renderWithRouter(<AutoQA />)
            const containerDiv = container.querySelector(
                '[class*="hasUIVisionMS1"]',
            )

            expect(containerDiv).toBeInTheDocument()
        })

        it('should not apply hasUIVisionMS1 class to container when UIVisionMilestone1 is disabled', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(false)

            const { container } = renderWithRouter(<AutoQA />)
            const containerDiv = container.querySelector(
                '[class*="hasUIVisionMS1"]',
            )

            expect(containerDiv).not.toBeInTheDocument()
        })
    })
})
