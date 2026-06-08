import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyTypeEnum } from '@gorgias/convert-client'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    JourneyFlowsFilter,
    JourneyFlowsFilterFromContext,
    JourneyFlowsFilterFromSavedContext,
} from 'domains/reporting/pages/common/filters/JourneyFlowsFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const FLOWS_FILTER_NAME = FilterLabels[FilterKey.JourneyFlows]

const mockJourneys: JourneyApiDTO[] = [
    {
        id: 'flow-1',
        type: JourneyTypeEnum.CartAbandoned,
        account_id: 1,
        created_datetime: '2025-01-01',
        state: 'active',
        store_integration_id: 1,
        store_name: 'test',
        store_type: 'shopify',
    },
    {
        id: 'flow-2',
        type: JourneyTypeEnum.PostPurchase,
        account_id: 1,
        created_datetime: '2025-01-01',
        state: 'active',
        store_integration_id: 1,
        store_name: 'test',
        store_type: 'shopify',
    },
]

const defaultState = {
    stats: statsSlice.initialState,
} as RootState

describe('JourneyFlowsFilter', () => {
    const dispatchUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (
        value = withLogicalOperator(mockJourneys.map((j) => j.id)),
        journeys = mockJourneys,
    ) =>
        render(
            <JourneyFlowsFilter
                value={value}
                journeys={journeys}
                dispatchUpdate={dispatchUpdate}
            />,
            { storeState: defaultState },
        )

    describe('trigger label', () => {
        it('should render filter with label', () => {
            renderComponent()

            expect(screen.getByText(FLOWS_FILTER_NAME)).toBeInTheDocument()
        })

        it('should show "All Flows" when all flows are selected', () => {
            renderComponent()

            expect(screen.getByText('All Flows')).toBeInTheDocument()
        })

        it('should show "Select value..." preview when no flows are selected', () => {
            renderComponent(withLogicalOperator([]))

            expect(
                screen.getByText(FILTER_VALUE_PLACEHOLDER),
            ).toBeInTheDocument()
        })

        it('should show flow name as preview when only one flow is selected', () => {
            renderComponent(withLogicalOperator(['flow-1']))

            expect(
                screen.getByRole('button', {
                    name: new RegExp(
                        JOURNEY_TYPE_MAP_TO_STRING[
                            JourneyTypeEnum.CartAbandoned
                        ],
                    ),
                }),
            ).toBeInTheDocument()
        })

        it('should show "+N" format as preview when multiple but not all flows are selected', () => {
            const threeJourneys: JourneyApiDTO[] = [
                ...mockJourneys,
                {
                    id: 'flow-3',
                    type: JourneyTypeEnum.SessionAbandoned,
                    account_id: 1,
                    created_datetime: '2025-01-01',
                    state: 'active',
                    store_integration_id: 1,
                    store_name: 'test',
                    store_type: 'shopify',
                },
            ]

            renderComponent(
                withLogicalOperator(['flow-1', 'flow-2']),
                threeJourneys,
            )

            expect(
                screen.getByText(
                    `${JOURNEY_TYPE_MAP_TO_STRING[JourneyTypeEnum.CartAbandoned]} +1`,
                ),
            ).toBeInTheDocument()
        })

        it('should default to all selected when value is undefined', () => {
            render(
                <JourneyFlowsFilter
                    value={undefined}
                    journeys={mockJourneys}
                    dispatchUpdate={dispatchUpdate}
                />,
                { storeState: defaultState },
            )

            expect(screen.getByText('All Flows')).toBeInTheDocument()
        })
    })

    describe('dropdown options', () => {
        it('should render available flow options when dropdown is opened', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('All Flows'))
            })

            expect(
                screen.getByRole('option', {
                    name: JOURNEY_TYPE_MAP_TO_STRING[
                        JourneyTypeEnum.CartAbandoned
                    ],
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', {
                    name: JOURNEY_TYPE_MAP_TO_STRING[
                        JourneyTypeEnum.PostPurchase
                    ],
                }),
            ).toBeInTheDocument()
        })

        it('should show "Deselect all" toggle when all flows are selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('All Flows'))
            })

            expect(
                screen.getByRole('option', {
                    name: new RegExp(FILTER_DESELECT_ALL_LABEL),
                }),
            ).toBeInTheDocument()
        })

        it('should show "Select all" toggle when not all flows are selected', async () => {
            const user = userEvent.setup()
            renderComponent(withLogicalOperator(['flow-1']))
            await act(async () => {
                await user.click(
                    screen.getByRole('button', {
                        name: new RegExp(
                            JOURNEY_TYPE_MAP_TO_STRING[
                                JourneyTypeEnum.CartAbandoned
                            ],
                        ),
                    }),
                )
            })

            expect(
                screen.getByRole('option', {
                    name: new RegExp(FILTER_SELECT_ALL_LABEL),
                }),
            ).toBeInTheDocument()
        })
    })

    describe('flow name labels', () => {
        const namedJourneys: JourneyApiDTO[] = [
            {
                ...mockJourneys[0],
                id: 'flow-1',
                name: 'Customer win-back flow 1',
            },
            {
                ...mockJourneys[1],
                id: 'flow-2',
                name: 'Customer win-back flow 2',
            },
        ]

        it('should render the flow name as the option label instead of the type label', async () => {
            const user = userEvent.setup()
            renderComponent(
                withLogicalOperator(namedJourneys.map((j) => j.id)),
                namedJourneys,
            )

            await act(async () => {
                await user.click(screen.getByText('All Flows'))
            })

            expect(
                screen.getByRole('option', {
                    name: 'Customer win-back flow 1',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', {
                    name: 'Customer win-back flow 2',
                }),
            ).toBeInTheDocument()
        })

        it('should render distinct names for multiple flows that share the same type', async () => {
            const user = userEvent.setup()
            const sameTypeJourneys: JourneyApiDTO[] = [
                {
                    ...mockJourneys[0],
                    id: 'flow-1',
                    type: JourneyTypeEnum.CartAbandoned,
                    name: 'Cart flow A',
                },
                {
                    ...mockJourneys[0],
                    id: 'flow-2',
                    type: JourneyTypeEnum.CartAbandoned,
                    name: 'Cart flow B',
                },
            ]

            renderComponent(
                withLogicalOperator(sameTypeJourneys.map((j) => j.id)),
                sameTypeJourneys,
            )

            await act(async () => {
                await user.click(screen.getByText('All Flows'))
            })

            expect(
                screen.getByRole('option', { name: 'Cart flow A' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'Cart flow B' }),
            ).toBeInTheDocument()
        })

        it('should use the flow name as the trigger preview when a single named flow is selected', () => {
            renderComponent(withLogicalOperator(['flow-1']), namedJourneys)

            expect(
                screen.getByRole('button', {
                    name: /Customer win-back flow 1/,
                }),
            ).toBeInTheDocument()
        })

        it('should fall back to the type label when the flow has no name', async () => {
            const user = userEvent.setup()
            const unnamedJourneys: JourneyApiDTO[] = [
                { ...mockJourneys[0], id: 'flow-1', name: '' },
                { ...mockJourneys[1], id: 'flow-2' },
            ]

            renderComponent(
                withLogicalOperator(unnamedJourneys.map((j) => j.id)),
                unnamedJourneys,
            )

            await act(async () => {
                await user.click(screen.getByText('All Flows'))
            })

            expect(
                screen.getByRole('option', {
                    name: JOURNEY_TYPE_MAP_TO_STRING[
                        JourneyTypeEnum.CartAbandoned
                    ],
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', {
                    name: JOURNEY_TYPE_MAP_TO_STRING[
                        JourneyTypeEnum.PostPurchase
                    ],
                }),
            ).toBeInTheDocument()
        })
    })

    describe('selection changes', () => {
        it('should dispatch update when deselecting a flow', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('All Flows'))
                await user.click(
                    screen.getByRole('option', {
                        name: JOURNEY_TYPE_MAP_TO_STRING[
                            JourneyTypeEnum.CartAbandoned
                        ],
                    }),
                )
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: ['flow-2'],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })

        it('should dispatch update when selecting a flow', async () => {
            const user = userEvent.setup()
            renderComponent(withLogicalOperator(['flow-1']))

            await act(async () => {
                await user.click(
                    screen.getByRole('button', {
                        name: new RegExp(
                            JOURNEY_TYPE_MAP_TO_STRING[
                                JourneyTypeEnum.CartAbandoned
                            ],
                        ),
                    }),
                )
                await user.click(
                    screen.getByRole('option', {
                        name: JOURNEY_TYPE_MAP_TO_STRING[
                            JourneyTypeEnum.PostPurchase
                        ],
                    }),
                )
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: ['flow-1', 'flow-2'],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })

        it('should dispatch update with all IDs when clicking "Select all"', async () => {
            const user = userEvent.setup()
            renderComponent(withLogicalOperator([]))

            await act(async () => {
                await user.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
                await user.click(
                    screen.getByRole('option', {
                        name: new RegExp(FILTER_SELECT_ALL_LABEL),
                    }),
                )
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: ['flow-1', 'flow-2'],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })

        it('should dispatch update with empty array when clicking "Deselect all"', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('All Flows'))
                await user.click(
                    screen.getByRole('option', {
                        name: /Deselect all/,
                    }),
                )
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })
    })

    describe('JourneyFlowsFilterFromContext', () => {
        it('should render and dispatch via Redux', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                journeys: mockJourneys,
            })

            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            render(<JourneyFlowsFilterFromContext />, {
                storeState: defaultState,
            })

            expect(screen.getByText(FLOWS_FILTER_NAME)).toBeInTheDocument()

            await act(async () => {
                await user.click(screen.getByText('All Flows'))
                await user.click(
                    screen.getByRole('option', {
                        name: new RegExp(FILTER_DESELECT_ALL_LABEL),
                    }),
                )
            })

            expect(spy).toHaveBeenCalledWith({
                journeyFlows: {
                    values: [],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        })

        it('should return null when no journeys', () => {
            mockUseJourneyContext.mockReturnValue({
                journeys: [],
            })

            const { container } = render(<JourneyFlowsFilterFromContext />, {
                storeState: defaultState,
            })

            expect(container).toBeEmptyDOMElement()
        })

        it('should return null when journeys is undefined', () => {
            mockUseJourneyContext.mockReturnValue({
                journeys: undefined,
            })

            const { container } = render(<JourneyFlowsFilterFromContext />, {
                storeState: defaultState,
            })

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('JourneyFlowsFilterFromSavedContext', () => {
        it('should return null', () => {
            const { container } = render(
                <JourneyFlowsFilterFromSavedContext />,
                { storeState: defaultState },
            )

            expect(container).toBeEmptyDOMElement()
        })
    })
})
