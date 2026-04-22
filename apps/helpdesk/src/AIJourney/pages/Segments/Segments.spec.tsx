import { forwardRef } from 'react'
import type { ReactNode, Ref } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    AudienceListSource,
    JourneyCampaignStateEnum,
    JourneyTypeEnum,
} from '@gorgias/convert-client'

import { useJourneyContext } from 'AIJourney/providers'
import { useDeleteSegment, useSegments } from 'AIJourney/queries'
import { useAudiencesUsage } from 'AIJourney/queries/UseAudiencesUsage/UseAudiencesUsage'
import { useConditionsMetadata } from 'AIJourney/queries/useConditionsMetadata/useConditionsMetadata'
import type { ConditionsSchema } from 'AIJourney/types/conditionField'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { Segments } from './Segments'

type MockSidePanelProps = {
    children: ReactNode
    isOpen: boolean
    onOpenChange: () => void
}

type MockSelectProps = {
    trigger: (args: { ref: Ref<HTMLElement> }) => ReactNode
    items: { id: string; name: string; icon: string }[]
    onSelect: (item: { id: string; name: string; icon: string }) => void
}

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SidePanel: ({ children, isOpen, onOpenChange }: MockSidePanelProps) =>
        isOpen ? (
            <div>
                <button onClick={onOpenChange}>Close panel</button>
                {children}
            </div>
        ) : null,
    Select: ({ trigger, items, onSelect }: MockSelectProps) => (
        <div>
            {trigger({ ref: { current: null } as Ref<HTMLElement> })}
            {items.map((item) => (
                <button key={item.id} onClick={() => onSelect(item)}>
                    {item.name}
                </button>
            ))}
        </div>
    ),
    SelectTrigger: forwardRef<HTMLDivElement, { children: ReactNode }>(
        ({ children }, ref) => <div ref={ref}>{children}</div>,
    ),
    ListItem: ({ label }: { label: string }) => <div>{label}</div>,
}))

jest.mock('AIJourney/queries', () => ({
    useSegments: jest.fn(),
    useDeleteSegment: jest.fn(),
    useCreateSegment: jest.fn().mockReturnValue({
        mutateAsync: jest.fn(),
        isLoading: false,
    }),
}))

jest.mock(
    'AIJourney/queries/useConditionsMetadata/useConditionsMetadata',
    () => ({
        useConditionsMetadata: jest.fn(),
    }),
)

jest.mock('AIJourney/queries/useUpdateSegment/useUpdateSegment', () => ({
    useUpdateSegment: jest
        .fn()
        .mockReturnValue({ mutateAsync: jest.fn(), isLoading: false }),
}))

jest.mock('AIJourney/queries/useAudienceCount/useAudienceCount', () => ({
    useAudienceCount: jest.fn().mockReturnValue({
        data: undefined,
        isFetching: false,
    }),
}))

jest.mock('AIJourney/queries/UseAudiencesUsage/UseAudiencesUsage', () => ({
    useAudiencesUsage: jest.fn().mockReturnValue({
        data: undefined,
        isLoading: false,
    }),
}))

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock('hooks/useAppDispatch')

jest.mock('state/notifications/actions')

const mockUseSegments = useSegments as jest.Mock
const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseDeleteSegment = useDeleteSegment as jest.Mock
const mockUseConditionsMetadata = useConditionsMetadata as jest.Mock
const mockUseAudiencesUsage = useAudiencesUsage as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockNotify = notify as jest.MockedFunction<typeof notify>

const mockActiveCampaign = {
    id: 'campaign-1',
    type: JourneyTypeEnum.Campaign,
    campaign: {
        title: 'Summer Sale',
        state: JourneyCampaignStateEnum.Active,
    },
}

const mockAudienceUsageForSegment1 = {
    data: [
        {
            id: 'audience-1',
            identifier: '1',
            source: AudienceListSource.Gorgias,
            count_campaigns: 1,
            count_journeys: 0,
            usage: [{ id: 'campaign-1', type: JourneyTypeEnum.Campaign }],
        },
    ],
}

const mockSchema: ConditionsSchema = {
    operators: {
        comparison: ['eq', 'gt'],
        set: ['containsAny'],
        unary: ['isEmpty'],
    },
    objects: {
        shopper: {
            fields: {
                sms_state: { type: 'string', operators: ['eq', 'isEmpty'] },
            },
        },
    },
}

const mockSegments = [
    {
        id: '1',
        name: 'Support small business',
        conditions: 'gt(shopper.lifetime_value, 1000)',
        count: 0,
        created_datetime: '2026-01-15T00:00:00',
        updated_datetime: '2026-09-12T00:00:00',
    },
    {
        id: '2',
        name: 'Super brand like really super',
        conditions: 'gt(shopper.lifetime_value, 1000)',
        count: 98762,
        created_datetime: '2026-01-15T00:00:00',
        updated_datetime: '2026-01-20T00:00:00',
    },
]

describe('<Segments />', () => {
    const mockDispatch = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 123 },
        })
        mockUseDeleteSegment.mockReturnValue({ mutate: jest.fn() })
        mockUseSegments.mockReturnValue({
            data: {
                data: mockSegments,
                metadata: { next_cursor: null, prev_cursor: null },
            },
            isLoading: false,
        })
        mockUseConditionsMetadata.mockReturnValue({
            data: mockSchema,
            isLoading: false,
            isError: false,
        })
    })

    describe('page layout', () => {
        it('should render the Segments heading', () => {
            render(<Segments />)

            expect(
                screen.getByRole('heading', { name: 'Segments' }),
            ).toBeInTheDocument()
        })

        it('should render the Create segment button', () => {
            render(<Segments />)

            expect(
                screen.getByRole('button', { name: /create segment/i }),
            ).toBeInTheDocument()
        })
    })

    describe('table rendering', () => {
        it('should render the table column headers', () => {
            render(<Segments />)

            expect(screen.getByText('Title')).toBeInTheDocument()
            expect(screen.getByText('Estimated size')).toBeInTheDocument()
            expect(screen.getByText('Last updated')).toBeInTheDocument()
        })

        it('should render segment names from fetched data', () => {
            render(<Segments />)

            expect(
                screen.getByText('Support small business'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Super brand like really super'),
            ).toBeInTheDocument()
        })

        it('should render estimated sizes for segments', () => {
            render(<Segments />)

            expect(screen.getByText('±0')).toBeInTheDocument()
            expect(screen.getByText('±98,762')).toBeInTheDocument()
        })

        it('should render empty state when data is empty', () => {
            mockUseSegments.mockReturnValue({
                data: {
                    data: [],
                    metadata: { next_cursor: null, prev_cursor: null },
                },
                isLoading: false,
            })
            render(<Segments />)

            expect(screen.getByText('No segments found')).toBeInTheDocument()
        })

        it('should render empty state and disable pagination when segments data is undefined', () => {
            mockUseSegments.mockReturnValue({
                data: undefined,
                isLoading: false,
            })
            render(<Segments />)

            expect(screen.getByText('No segments found')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /next page/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /previous page/i }),
            ).toBeDisabled()
        })
    })

    describe('useSegments call', () => {
        it('should call useSegments with the integration id and default page size', () => {
            render(<Segments />)

            expect(mockUseSegments).toHaveBeenCalledWith(
                123,
                expect.objectContaining({ limit: 10 }),
            )
        })

        it('should call useSegments with undefined when currentIntegration is not set', () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: undefined,
            })
            mockUseSegments.mockReturnValue({
                data: undefined,
                isLoading: false,
            })
            render(<Segments />)

            expect(mockUseSegments).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({ limit: 10 }),
            )
        })
    })

    describe('pagination', () => {
        it('should disable both pagination buttons when there is no next or previous page', () => {
            render(<Segments />)

            expect(
                screen.getByRole('button', { name: /next page/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /previous page/i }),
            ).toBeDisabled()
        })

        it('should enable the Next button when there is a next page', () => {
            mockUseSegments.mockReturnValue({
                data: {
                    data: mockSegments,
                    metadata: {
                        next_cursor: 'cursor_next',
                        prev_cursor: null,
                    },
                },
                isLoading: false,
            })
            render(<Segments />)

            expect(
                screen.getByRole('button', { name: /next page/i }),
            ).toBeEnabled()
            expect(
                screen.getByRole('button', { name: /previous page/i }),
            ).toBeDisabled()
        })

        it('should advance to the next page when Next is clicked', async () => {
            const user = userEvent.setup()
            mockUseSegments.mockReturnValue({
                data: {
                    data: mockSegments,
                    metadata: {
                        next_cursor: 'cursor_next',
                        prev_cursor: null,
                    },
                },
                isLoading: false,
            })
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /next page/i }),
                )
            })

            expect(mockUseSegments).toHaveBeenLastCalledWith(
                123,
                expect.objectContaining({ cursor: 'cursor_next' }),
            )
        })

        it('should go back to the previous page when Previous is clicked', async () => {
            const user = userEvent.setup()
            mockUseSegments.mockReturnValue({
                data: {
                    data: mockSegments,
                    metadata: {
                        next_cursor: null,
                        prev_cursor: 'cursor_prev',
                    },
                },
                isLoading: false,
            })
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /previous page/i }),
                )
            })

            expect(mockUseSegments).toHaveBeenLastCalledWith(
                123,
                expect.objectContaining({ cursor: 'cursor_prev' }),
            )
        })
    })

    describe('Create segment button state', () => {
        it('should be disabled while the schema is loading', () => {
            mockUseConditionsMetadata.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
            })
            render(<Segments />)

            expect(
                screen.getByRole('button', { name: /create segment/i }),
            ).toBeDisabled()
        })

        it('should be enabled once the schema has loaded', () => {
            render(<Segments />)

            expect(
                screen.getByRole('button', { name: /create segment/i }),
            ).toBeEnabled()
        })

        it('should be disabled when the schema request fails', () => {
            mockUseConditionsMetadata.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
            })
            render(<Segments />)

            expect(
                screen.getByRole('button', { name: /create segment/i }),
            ).toBeDisabled()
        })

        it('should dispatch an error notification when the schema request fails', async () => {
            mockNotify.mockReturnValue(
                jest.fn() as unknown as ReturnType<typeof notify>,
            )
            mockUseConditionsMetadata.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
            })
            render(<Segments />)

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    message:
                        'Failed to load segment conditions. Please refresh the page.',
                    status: NotificationStatus.Error,
                })
            })
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    describe('side panel interactions', () => {
        it('should not render the side panel when schema is unavailable', () => {
            mockUseConditionsMetadata.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
            })
            render(<Segments />)

            expect(
                screen.queryByRole('heading', { name: 'Create new segment' }),
            ).not.toBeInTheDocument()
        })

        it('should open the side panel in create mode when "Create segment" is clicked', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /create segment/i }),
                )
            })

            expect(
                screen.getByRole('heading', { name: 'Create new segment' }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/segment name/i)).toHaveValue('')
        })

        it('should open the side panel in edit mode when a segment name is clicked', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(screen.getByText('Support small business'))
            })
            expect(
                screen.getByRole('heading', { name: 'Edit segment' }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/segment name/i)).toHaveValue(
                'Support small business',
            )
        })

        it('should close the side panel when it is closed externally', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /create segment/i }),
                )
            })
            expect(
                screen.getByRole('heading', { name: 'Create new segment' }),
            ).toBeInTheDocument()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /close panel/i }),
                )
            })

            expect(
                screen.queryByRole('heading', { name: 'Create new segment' }),
            ).not.toBeInTheDocument()
        })

        it('should open the side panel with "(copy)" appended to the name when duplicate is clicked', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getAllByRole('button', { name: /duplicate/i })[0],
                )
            })

            expect(
                screen.getByRole('heading', { name: 'Edit segment' }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/segment name/i)).toHaveValue(
                'Support small business (copy)',
            )
        })
    })

    describe('delete segment', () => {
        it('should open the delete confirmation modal when delete is clicked', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getAllByRole('button', { name: 'Delete' })[0],
                )
            })

            expect(screen.getByText('Delete segment?')).toBeInTheDocument()
        })

        it('should call deleteSegment with the segment id when deletion is confirmed', async () => {
            const user = userEvent.setup()
            const mockMutate = jest.fn()
            mockUseDeleteSegment.mockReturnValue({ mutate: mockMutate })
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getAllByRole('button', { name: 'Delete' })[0],
                )
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: 'Delete segment' }),
                )
            })

            expect(mockMutate).toHaveBeenCalledWith({ segmentId: '1' })
        })

        it('should close the confirmation modal without deleting when Cancel is clicked', async () => {
            const user = userEvent.setup()
            const mockMutate = jest.fn()
            mockUseDeleteSegment.mockReturnValue({ mutate: mockMutate })
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getAllByRole('button', { name: 'Delete' })[0],
                )
            })

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Cancel' }))
            })

            expect(mockMutate).not.toHaveBeenCalled()
            expect(
                screen.queryByText('Delete segment?'),
            ).not.toBeInTheDocument()
        })

        it('should open the in-use modal when the segment is used in an active campaign', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: { id: 123 },
                campaigns: [mockActiveCampaign],
            })
            mockUseAudiencesUsage.mockReturnValue({
                data: mockAudienceUsageForSegment1,
                isLoading: false,
            })
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getAllByRole('button', { name: 'Delete' })[0],
                )
            })

            expect(
                screen.getByText("This segment can't be deleted"),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /It's currently used in campaigns that are scheduled, active, or paused/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Delete segment?'),
            ).not.toBeInTheDocument()
        })

        it('should close the in-use modal when "Got it" is clicked', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: { id: 123 },
                campaigns: [mockActiveCampaign],
            })
            mockUseAudiencesUsage.mockReturnValue({
                data: mockAudienceUsageForSegment1,
                isLoading: false,
            })
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getAllByRole('button', { name: 'Delete' })[0],
                )
            })

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Got it' }))
            })

            expect(
                screen.queryByText("This segment can't be deleted"),
            ).not.toBeInTheDocument()
        })

        it('should open the delete confirmation modal when the segment is used only in non-blocked campaigns', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: { id: 123 },
                campaigns: [
                    {
                        ...mockActiveCampaign,
                        campaign: {
                            title: 'Old Sale',
                            state: JourneyCampaignStateEnum.Sent,
                        },
                    },
                ],
            })
            mockUseAudiencesUsage.mockReturnValue({
                data: mockAudienceUsageForSegment1,
                isLoading: false,
            })
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getAllByRole('button', { name: 'Delete' })[0],
                )
            })

            expect(screen.getByText('Delete segment?')).toBeInTheDocument()
            expect(
                screen.queryByText("This segment can't be deleted"),
            ).not.toBeInTheDocument()
        })
    })
})
