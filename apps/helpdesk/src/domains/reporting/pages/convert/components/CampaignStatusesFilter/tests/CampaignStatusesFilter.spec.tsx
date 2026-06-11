import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { render, userEvent } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    CampaignStatusesFilter,
    CampaignStatusesFilterFromContext,
    CampaignStatusesFilterFromSavedContext,
} from 'domains/reporting/pages/convert/components/CampaignStatusesFilter/CampaignStatusesFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersActions from 'domains/reporting/state/ui/stats/actions'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { InferredCampaignStatus } from 'models/convert/campaign/types'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'

const mockedRemove = jest.fn()

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const defaultState = {
    stats: statsSlice.initialState,
    ui: {
        stats: {
            filters: filtersSlice.initialState,
        },
    },
} as RootState

const CampaignStatusesCapitalized = Object.keys(InferredCampaignStatus)

describe('CampaignStatusesFilter', () => {
    const dispatchUpdate = jest.fn()
    const dispatchRemove = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()

    const renderComponent = () =>
        render(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )

    it('should render CampaignStatusesFilter component', () => {
        renderComponent()

        expect(
            screen.getByText(FilterLabels[FilterKey.CampaignStatuses]),
        ).toBeInTheDocument()
        expect(screen.getByText(FILTER_VALUE_PLACEHOLDER)).toBeTruthy()
    })

    it('should open the select component and contain all options', () => {
        renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        CampaignStatusesCapitalized.forEach((campaignStatus) => {
            expect(screen.getByText(campaignStatus)).toBeInTheDocument()
        })

        expect(screen.getAllByRole('checkbox')).toHaveLength(5)
    })

    it('should dispatch the right actions on options selection', () => {
        renderComponent()
        expect(screen.queryByText(InferredCampaignStatus.Active)).toBeFalsy()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withLogicalOperator([InferredCampaignStatus.Active]),
        )
    })

    it('should dispatch the right actions on options deselection', () => {
        renderComponent().rerender(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([InferredCampaignStatus.Active])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )
        fireEvent.click(screen.getByText(InferredCampaignStatus.Active))
        fireEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))

        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator([]))
    })

    it('should dispatch the right action on deselect all', () => {
        const { rerender } = renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))
        expect(dispatchUpdate).toHaveBeenCalledWith(
            withLogicalOperator(Object.values(InferredCampaignStatus)),
        )
        rerender(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([
                    InferredCampaignStatus.Active,
                    InferredCampaignStatus.Inactive,
                    InferredCampaignStatus.Deleted,
                ])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )
        fireEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator([]))
    })

    it('should remove the campaignStatuses filter', () => {
        renderComponent()
        fireEvent.click(screen.getByText('close'))

        expect(dispatchRemove).toHaveBeenCalledWith()
        expect(mockedRemove).toHaveBeenCalled()
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const { rerender } = renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerender(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([InferredCampaignStatus.Active])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.CampaignStatuses,
            logical_operator: null,
        })
    })

    describe('CampaignStatusesFilterFromContext', () => {
        it('should pass dispatchUpdate and filters from saved filters', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )
            const statsCleanSpy = jest.spyOn(filtersActions, 'statFiltersClean')
            const statsDirtySpy = jest.spyOn(filtersActions, 'statFiltersDirty')

            render(<CampaignStatusesFilterFromContext />, {
                storeState: defaultState,
            })
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

            expect(
                screen.getByText(FilterLabels[FilterKey.CampaignStatuses]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
            expect(statsCleanSpy).toHaveBeenCalled()
            expect(statsDirtySpy).toHaveBeenCalled()

            fireEvent.click(screen.getByText('close'))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.CampaignStatuses]: withLogicalOperator([]),
            })
        })
    })

    describe('CampaignStatusesFilterFromSavedContext', () => {
        it('should pass dispatchUpdate and filters from saved filters', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )

            render(<CampaignStatusesFilterFromSavedContext />, {
                storeState: defaultState,
            })
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.CampaignStatuses]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            fireEvent.click(screen.getByText('close'))
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.CampaignStatuses,
            })
        })
    })
})
