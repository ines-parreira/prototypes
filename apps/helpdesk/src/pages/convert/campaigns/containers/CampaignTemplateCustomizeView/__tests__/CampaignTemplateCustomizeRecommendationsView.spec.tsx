import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type routerDom from 'react-router-dom'
import { BrowserRouter, useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { useConvertGeneralSettings } from 'domains/reporting/pages/convert/hooks/useConvertGeneralSettings'
import { campaign } from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import { utmConfiguration } from 'fixtures/utmConfiguration'
import { useListCampaigns } from 'models/convert/campaign/queries'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import { useCreateCampaign } from 'pages/convert/campaigns/hooks/useCreateCampaign'
import { useUpdateCampaign } from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import { useUtm } from 'pages/convert/campaigns/hooks/useUtm'
import { CART_ABANDONMENT } from 'pages/convert/campaigns/templates/onboarding/cartAbandonment'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'

import CampaignTemplateCustomizeRecommendationsView from '../CampaignTemplateCustomizeRecommendationsView'

const mockStore = configureMockStore()

jest.mock('pages/convert/common/hooks/useGetConvertStatus')
jest.mock('pages/common/forms/RichField/RichFieldEditor')
jest.mock('pages/convert/campaigns/hooks/useGetPreviewProducts')
jest.mock('pages/convert/common/hooks/useContactFormFlag')

jest.mock('domains/reporting/pages/convert/hooks/useConvertGeneralSettings')
const mockUseConvertGeneralSettings = assumeMock(useConvertGeneralSettings)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

jest.mock('pages/convert/campaigns/hooks/useCreateCampaign')
const useCreateCampaignMock = assumeMock(useCreateCampaign)

jest.mock('pages/convert/campaigns/hooks/useUpdateCampaign')
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

jest.mock('pages/convert/campaigns/hooks/useUtm.ts')
const useUtmMock = assumeMock(useUtm)

const defaultState = {
    integrations: fromJS({
        integrations: [{ id: 123, type: 'gorgias_chat', meta: {} }],
    }),
}

describe('CampaignTemplateCustomizeView', () => {
    beforeEach(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection,
        } as any)
        useListCampaignMock.mockReturnValue({
            data: [campaign],
            isLoading: false,
            isError: false,
        } as any)
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useCreateCampaign>
        })
        useUpdateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useUpdateCampaign>
        })
        mockUseConvertGeneralSettings.mockReturnValue({
            emailDisclaimer: {
                enabled: true,
                disclaimer: { en: 'foo' },
                disclaimer_default_accepted: true,
            },
            isLoading: false,
        })
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)
        useUtmMock.mockReturnValue(utmConfiguration)

        window.HTMLElement.prototype.scrollTo = jest.fn()
    })

    it('should render campaign form with template data', async () => {
        ;(useParams as jest.Mock).mockReturnValue({
            id: '123',
            templateSlug: CART_ABANDONMENT.slug,
        })

        const { getByText } = render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <CampaignTemplateCustomizeRecommendationsView />
                </Provider>
            </BrowserRouter>,
        )

        await waitFor(() => {
            expect(getByText(CART_ABANDONMENT.name)).toBeInTheDocument()
            expect(getByText('ready to help you')).toBeInTheDocument()
        })
    })
})
