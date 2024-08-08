import React from 'react'
import {render} from '@testing-library/react'
import {Router, useLocation} from 'react-router-dom'
import {createMemoryHistory} from 'history'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'

import {RootState, StoreDispatch} from 'state/types'
import {campaignWithABGroup, abGroup} from 'fixtures/abGroup'
import {assumeMock} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import ABGroupContainer from '../ABGroupContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useLocation: jest.fn(),
}))
const mockUseLocation = assumeMock(useLocation)

const history = createMemoryHistory()
const queryClient = mockQueryClient()

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const renderComponent = (props: any) =>
    render(
        <Router history={history}>
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <ABGroupContainer {...props} />
                </QueryClientProvider>
            </Provider>
        </Router>
    )

describe('ABGroupContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseLocation.mockReturnValue({
            pathname: '.../ab-variants',
            search: '',
            state: undefined,
            hash: '',
        })
    })

    it('A/B Group without any variants', () => {
        const abGrpupWithOutVariants = {
            ...campaignWithABGroup,
            variants: [],
        } as Campaign

        const {getByRole} = renderComponent({campaign: abGrpupWithOutVariants})

        const addVariantBtn = getByRole('button', {name: 'Add Variant'})
        expect(addVariantBtn).toBeInTheDocument()
        expect(addVariantBtn).toHaveAttribute('aria-disabled', 'false')

        const startBtn = getByRole('button', {name: /Start/})
        expect(startBtn).toBeInTheDocument()
        expect(startBtn).toHaveAttribute('aria-disabled', 'true')
    })

    it('A/B Group has variants and can start A/B test', () => {
        const abGrpupWithOutVariants = {
            ...campaignWithABGroup,
        } as Campaign

        const {getByRole} = renderComponent({campaign: abGrpupWithOutVariants})

        const addVariantBtn = getByRole('button', {name: 'Add Variant'})
        expect(addVariantBtn).toBeInTheDocument()
        expect(addVariantBtn).toHaveAttribute('aria-disabled', 'false')

        const startBtn = getByRole('button', {name: /Start/})
        expect(startBtn).toBeInTheDocument()
        expect(startBtn).toHaveAttribute('aria-disabled', 'false')
    })

    it('A/B test is started', () => {
        const abGrpupWithOutVariants = {
            ...campaignWithABGroup,
            ab_group: {
                ...abGroup,
                status: 'started',
            },
        } as Campaign

        const {getByRole, queryByRole} = renderComponent({
            campaign: abGrpupWithOutVariants,
        })

        const addVariantBtn = getByRole('button', {name: 'Add Variant'})
        expect(addVariantBtn).toBeInTheDocument()
        expect(addVariantBtn).toHaveAttribute('aria-disabled', 'true')

        const startBtn = queryByRole('button', {name: /Start/})
        expect(startBtn).not.toBeInTheDocument()

        const pauseBtn = getByRole('button', {name: /Pause Test/})
        expect(pauseBtn).toBeInTheDocument()
        expect(pauseBtn).toHaveAttribute('aria-disabled', 'false')

        const stopBtn = getByRole('button', {name: /Stop Test/})
        expect(stopBtn).toBeInTheDocument()
        expect(stopBtn).toHaveAttribute('aria-disabled', 'false')
    })

    it('A/B test is paused', () => {
        const abGrpupWithOutVariants = {
            ...campaignWithABGroup,
            ab_group: {
                ...abGroup,
                status: 'paused',
            },
        } as Campaign

        const {getByRole, queryByRole} = renderComponent({
            campaign: abGrpupWithOutVariants,
        })

        const addVariantBtn = getByRole('button', {name: 'Add Variant'})
        expect(addVariantBtn).toBeInTheDocument()
        expect(addVariantBtn).toHaveAttribute('aria-disabled', 'false')

        const resumeBtn = queryByRole('button', {name: /Resume Test/})
        expect(resumeBtn).toBeInTheDocument()
        expect(resumeBtn).toHaveAttribute('aria-disabled', 'false')
    })

    it('A/B test is completed', () => {
        const abGrpupWithOutVariants = {
            ...campaignWithABGroup,
            ab_group: {
                ...abGroup,
                status: 'completed',
            },
        } as Campaign

        const {getByRole, queryByRole} = renderComponent({
            campaign: abGrpupWithOutVariants,
        })

        const addVariantBtn = getByRole('button', {name: 'Add Variant'})
        expect(addVariantBtn).toBeInTheDocument()
        expect(addVariantBtn).toHaveAttribute('aria-disabled', 'true')

        const startBtn = queryByRole('button', {name: /Start/})
        expect(startBtn).toBeInTheDocument()
        expect(startBtn).toHaveAttribute('aria-disabled', 'true')
    })
})
