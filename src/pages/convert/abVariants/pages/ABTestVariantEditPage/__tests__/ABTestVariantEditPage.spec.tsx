import React from 'react'
import routerDom, {BrowserRouter, useParams} from 'react-router-dom'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockFlags} from 'jest-launchdarkly-mock'

import userEvent from '@testing-library/user-event'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {integrationsState} from 'fixtures/integrations'

import {channelConnection} from 'fixtures/channelConnection'
import {campaign} from 'fixtures/campaign'
import {useGetCampaign} from 'models/convert/campaign/queries'
import {getLDClient} from 'utils/launchDarkly'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {useUpdateCampaign} from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'

import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import ABTestVariantEditPage from '../ABTestVariantEditPage'

jest.mock('utils/launchDarkly')

jest.mock('pages/common/hooks/useIsConvertSubscriber')
const useIsConvertSubscriberMock = assumeMock(useIsConvertSubscriber)

jest.mock('models/convert/campaign/queries')
const useGetCampaignMock = assumeMock(useGetCampaign)

jest.mock('pages/convert/campaigns/hooks/useUpdateCampaign')
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('pages/common/forms/RichField/RichFieldEditor')
jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock

const queryClient = mockQueryClient()
const mockStore = configureMockStore<RootState, StoreDispatch>()
const defaultState = {integrations: fromJS(integrationsState)} as RootState

const renderComponent = (props: any) => {
    const componentProps = {
        campaign: campaign,
        canCreateDeleteObjects: true,
        canModifyObjects: true,
        ...props,
    }
    return render(
        <BrowserRouter>
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <ABTestVariantEditPage {...componentProps} />
                </QueryClientProvider>
            </Provider>
        </BrowserRouter>
    )
}

describe('<ABTestVariantEditPage />', () => {
    beforeAll(() => {
        useParamsMock.mockReturnValue({
            id: '8', // Gorgias chat
            campaignId: '1',
        })

        useIsConvertSubscriberMock.mockImplementation(() => true)

        mockFlags({})

        const allFlagsMock = getLDClient().allFlags as jest.Mock
        allFlagsMock.mockReturnValue({})
    })

    beforeEach(() => {
        useGetCampaignMock.mockReturnValue({data: campaign} as any)

        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection,
        } as any)

        useUpdateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useUpdateCampaign>
        })
    })

    describe('as control version', () => {
        it('renders', () => {
            const onUpdateMock = jest.fn()
            const campaignData = {
                ...campaign,
                message_text: 'foo',
                message_html: '<p>foo</p>',
            }

            const {getByText, getByRole} = renderComponent({
                campaign: campaignData,
                onUpdate: onUpdateMock,
                isControlVersion: true,
            })

            expect(getByText('Set up the basics')).toBeInTheDocument()
            expect(
                getByRole('button', {name: 'Update Control'})
            ).toBeInTheDocument()

            userEvent.click(getByRole('button', {name: 'Update Control'}))

            // Should get whole campaign data
            expect(onUpdateMock).toBeCalledWith(fromJS(campaignData))
        })
    })

    describe('as variant - add path', () => {
        const onCreateMock = jest.fn()
        const onDiscardMock = jest.fn()

        it('renders', () => {
            const {getByText, getByRole} = renderComponent({
                isControlVersion: false,
            })
            expect(getByText('Set up the basics')).toBeInTheDocument()

            const createBtn = getByRole('button', {name: 'Create'})
            expect(createBtn).toBeInTheDocument()
            expect(createBtn).toBeAriaDisabled()
        })

        it('user discards changes', () => {
            const {getByText, getByRole} = renderComponent({
                isControlVersion: false,
                onCreate: onCreateMock,
                onDiscard: onDiscardMock,
            })
            expect(getByText('Set up the basics')).toBeInTheDocument()
            expect(getByRole('button', {name: 'Create'})).toBeInTheDocument()

            userEvent.click(getByRole('button', {name: 'Cancel'}))

            expect(onCreateMock).not.toBeCalled()
            expect(onDiscardMock).toBeCalled()
        })
    })

    describe('as variant - edit path', () => {
        beforeEach(() => {
            useParamsMock.mockReturnValue({
                id: '8', // Gorgias chat
                campaignId: '1',
                abVariantId: 'variant-id',
            })
        })

        it('renders', () => {
            const {getByText, getByRole} = renderComponent({
                isControlVersion: false,
            })
            expect(getByText('Set up the basics')).toBeInTheDocument()
            expect(
                getByRole('button', {name: 'Update Variant'})
            ).toBeInTheDocument()
        })

        it('edit the variant', () => {
            const onUpdateMock = jest.fn()
            const campaignData = {
                ...campaign,
                message_text: 'foo',
                message_html: '<p>foo</p>',
            }

            const {getByRole} = renderComponent({
                campaign: campaignData,
                isControlVersion: false,
                onUpdate: onUpdateMock,
            })

            userEvent.click(getByRole('button', {name: 'Update Variant'}))

            // Should get whole campaign data
            expect(onUpdateMock).toBeCalledWith(
                fromJS(campaignData),
                'variant-id'
            )
        })

        it('duplicate the variant', () => {
            const onDuplicateVariantMock = jest.fn()
            const {getByRole} = renderComponent({
                isControlVersion: false,
                onDuplicateVariant: onDuplicateVariantMock,
            })

            userEvent.click(getByRole('button', {name: 'Duplicate Variant'}))

            expect(onDuplicateVariantMock).toBeCalledWith('variant-id')
        })
    })
})
