import {QueryClientProvider} from '@tanstack/react-query'
import {act, render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createMemoryHistory} from 'history'
import React from 'react'
import {Provider} from 'react-redux'
import {Router, useLocation} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {campaignWithABGroup, abGroup} from 'fixtures/abGroup'
import * as useDismissFlag from 'hooks/useDismissFlag'
import {useStartABGroup} from 'pages/convert/abVariants/hooks/useStartABGroup'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import ABGroupContainer from '../ABGroupContainer'

jest.mock('hooks/useDismissFlag')

jest.mock('pages/convert/abVariants/hooks/useStartABGroup')
const useStartABGroupMock = assumeMock(useStartABGroup)

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
    const useStartABGroupMutation = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()

        mockUseLocation.mockReturnValue({
            pathname: '.../ab-variants',
            search: '',
            state: undefined,
            hash: '',
        })

        jest.spyOn(useDismissFlag, 'useDismissFlag').mockReturnValue({
            isDismissed: false,
            dismiss: jest.fn(),
        })

        useStartABGroupMock.mockImplementation(() => {
            return {
                mutateAsync: useStartABGroupMutation,
            } as unknown as ReturnType<typeof useStartABGroup>
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
        expect(addVariantBtn).toBeAriaEnabled()

        const startBtn = getByRole('button', {name: /Start/})
        expect(startBtn).toBeInTheDocument()
        expect(startBtn).toBeAriaDisabled()
    })

    it('A/B Group has variants and can start A/B test', () => {
        const abGrpupWithOutVariants = {
            ...campaignWithABGroup,
        } as Campaign

        const {getByRole} = renderComponent({campaign: abGrpupWithOutVariants})

        const addVariantBtn = getByRole('button', {name: 'Add Variant'})
        expect(addVariantBtn).toBeInTheDocument()
        expect(addVariantBtn).toBeAriaDisabled()

        const startBtn = getByRole('button', {name: /Start/})
        expect(startBtn).toBeInTheDocument()
        expect(startBtn).toBeAriaEnabled()
    })

    it('users click `Start Test` button and it shows modal', async () => {
        const abGrpupWithOutVariants = {
            ...campaignWithABGroup,
        } as Campaign

        const {getByText, getByRole} = renderComponent({
            campaign: abGrpupWithOutVariants,
        })

        const startBtn = getByRole('button', {name: /Start/})
        expect(startBtn).toBeInTheDocument()

        act(() => {
            userEvent.click(startBtn)
        })

        await waitFor(() => {
            expect(
                getByText('You’re about to start your test')
            ).toBeInTheDocument()
        })
    })

    it('users click `Start Test` button but modal has been dismissed', async () => {
        jest.spyOn(useDismissFlag, 'useDismissFlag').mockReturnValue({
            isDismissed: true,
            dismiss: jest.fn(),
        })

        const abGrpupWithOutVariants = {
            ...campaignWithABGroup,
        } as Campaign

        const {getByRole, queryByText} = renderComponent({
            campaign: abGrpupWithOutVariants,
        })

        const startBtn = getByRole('button', {name: /Start/})
        expect(startBtn).toBeInTheDocument()

        act(() => {
            userEvent.click(startBtn)
        })

        await waitFor(() => {
            expect(
                queryByText('You’re about to start your test')
            ).not.toBeInTheDocument()

            expect(useStartABGroupMutation).toBeCalled()
        })
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
        expect(addVariantBtn).toBeAriaDisabled()

        const startBtn = queryByRole('button', {name: /Start/})
        expect(startBtn).not.toBeInTheDocument()

        const pauseBtn = getByRole('button', {name: /Pause Test/})
        expect(pauseBtn).toBeInTheDocument()
        expect(pauseBtn).toBeAriaEnabled()

        const stopBtn = getByRole('button', {name: /Stop Test/})
        expect(stopBtn).toBeInTheDocument()
        expect(stopBtn).toBeAriaEnabled()
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
        expect(addVariantBtn).toBeAriaDisabled()

        const resumeBtn = queryByRole('button', {name: /Resume Test/})
        expect(resumeBtn).toBeInTheDocument()
        expect(resumeBtn).toBeAriaEnabled()
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
        expect(addVariantBtn).toBeAriaDisabled()

        const startBtn = queryByRole('button', {name: /Start/})
        expect(startBtn).toBeInTheDocument()
        expect(startBtn).toBeAriaDisabled()
    })
})
