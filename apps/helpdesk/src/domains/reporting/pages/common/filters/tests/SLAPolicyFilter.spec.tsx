import { logEvent, SegmentEvent } from '@repo/logging'
import { render, userEvent } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListSlaPoliciesHandler,
    mockListSlaPoliciesResponse,
} from '@gorgias/helpdesk-mocks'
import type { SLAPolicy } from '@gorgias/helpdesk-queries'

import { TicketChannel } from 'business/types/ticket'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    FilterKey,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    SLAPolicyFilter,
    SLAPolicyFilterWithState,
} from 'domains/reporting/pages/common/filters/SLAPolicyFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const server = setupServer()

const mockSlaPoliciesList = (policies: SLAPolicy[]) =>
    mockListSlaPoliciesHandler(async () =>
        HttpResponse.json(mockListSlaPoliciesResponse({ data: policies })),
    ).handler

describe('SLAPolicyFilter', () => {
    const policy = {
        name: 'someName',
        uuid: 'some-id',
        archived_datetime: 'asd',
        created_datetime: 'xyz',
        deactivated_datetime: 'qwe',
        metrics: [],
        target_channels: [],
        updated_datetime: 'asd',
        version: 1,
        priority: '0.5',
        business_hours_only: false,
    }
    const aPolicy = {
        ...policy,
        name: 'ABC',
        uuid: '123',
    }
    const anotherPolicy = {
        ...policy,
        name: 'XYZ',
        uuid: '456',
    }
    const phonePolicy = {
        ...policy,
        name: 'Phone Policy',
        uuid: 'phone-001',
        target_channels: ['phone'],
    }
    const policies: SLAPolicy[] = [
        aPolicy,
        anotherPolicy,
        {
            ...policy,
            uuid: '789',
            name: 'QWE',
        },
    ]
    const defaultState = {
        stats: {
            filters: {
                integrations: withDefaultLogicalOperator([
                    integrationsState.integrations[1].id,
                ]),
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                agents: withDefaultLogicalOperator([agents[0].id]),
                tags: [
                    {
                        ...withDefaultLogicalOperator([1]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: { filters: filtersSlice.initialState },
        },
    } as RootState
    const dispatchUpdate = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockSlaPoliciesList(policies))
        jest.clearAllMocks()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should render available policies', async () => {
        server.use(mockSlaPoliciesList([...policies, phonePolicy]))

        render(
            <SLAPolicyFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        for (const policy of policies) {
            expect(await screen.findByText(policy.name)).toBeInTheDocument()
        }
        expect(screen.queryByText(phonePolicy.name)).not.toBeInTheDocument()
    })

    it.each([
        {
            setup: () => {
                server.use(
                    mockListSlaPoliciesHandler(async () => {
                        await new Promise(() => undefined)

                        return HttpResponse.json(
                            mockListSlaPoliciesResponse({ data: [] }),
                        )
                    }).handler,
                )
            },
        },
        {
            setup: () => {
                server.use(
                    mockListSlaPoliciesHandler(async () =>
                        HttpResponse.json({} as any),
                    ).handler,
                )
            },
        },
    ])('should render when no policies', ({ setup }) => {
        setup()

        render(
            <SLAPolicyFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(
            screen.getByRole('option', {
                name: new RegExp(FILTER_SELECT_ALL_LABEL),
            }),
        ).toBeInTheDocument()
        expect(screen.queryAllByRole('option').length).toEqual(1)
    })

    it('should render selected options', async () => {
        const selectedPolicies = withDefaultLogicalOperator([aPolicy.uuid])
        render(
            <SLAPolicyFilter
                value={selectedPolicies}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        const option = await screen.findByRole('option', {
            name: aPolicy.name,
        })

        expect(option).toBeInTheDocument()
        expect(within(option).getByRole('checkbox')).toBeChecked()
    })

    it('should dispatch selected policy', async () => {
        render(
            <SLAPolicyFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(await screen.findByText(aPolicy.name))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([aPolicy.uuid]),
        )
        expect(dispatchStatFiltersClean).toHaveBeenCalled()
    })

    it('should deselect policy', async () => {
        const selectedPolicies = withDefaultLogicalOperator([
            aPolicy.uuid,
            anotherPolicy.uuid,
        ])
        render(
            <SLAPolicyFilter
                value={selectedPolicies}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(await screen.findByText(aPolicy.name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([anotherPolicy.uuid]),
        )
    })

    it('should add selected policy to already selected', async () => {
        const alreadySelectedPolicies = [aPolicy.uuid]
        render(
            <SLAPolicyFilter
                value={withDefaultLogicalOperator(alreadySelectedPolicies)}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(await screen.findByText(anotherPolicy.name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([aPolicy.uuid, anotherPolicy.uuid]),
        )
    })

    it('should dispatch all selected policies on selectAll', async () => {
        render(
            <SLAPolicyFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        for (const policy of policies) {
            expect(await screen.findByText(policy.name)).toBeInTheDocument()
        }
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        await waitFor(() => {
            expect(dispatchUpdate).toHaveBeenCalledWith(
                withDefaultLogicalOperator(policies.map((p) => p.uuid)),
            )
        })
    })

    it('should dispatch all selected policies on deselectAll', async () => {
        const selected = withDefaultLogicalOperator(policies.map((p) => p.uuid))
        render(
            <SLAPolicyFilter
                value={selected}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(await screen.findByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', async () => {
        const selectedPolicy = policies[0]
        const anotherSelectedPolicy = policies[1]
        const { rerender } = render(
            <SLAPolicyFilter
                value={withDefaultLogicalOperator([selectedPolicy.uuid])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

        userEvent.click(await screen.findByText(selectedPolicy.name))
        userEvent.click(await screen.findByText(anotherSelectedPolicy.name))
        userEvent.click(screen.getAllByText(selectedPolicy.name)[0])

        rerender(
            <SLAPolicyFilter
                value={withDefaultLogicalOperator([selectedPolicy.uuid])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.SlaPolicies,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('SLAPolicyFilterWithState', () => {
        it('should render SLAPolicyFilterWithState component', async () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            render(<SLAPolicyFilterWithState />, { storeState: defaultState })
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(await screen.findByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.SlaPolicies]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
        })
    })
})
