import React from 'react'
import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'

import {renderWithRouter} from 'utils/testing'
import {shopifyIntegration} from 'fixtures/integrations'

import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import NativeActionTemplateCard from '../components/NativeActionTemplateCard'
import useGetActionAppIntegration from '../hooks/useGetActionAppIntegration'

jest.mock('../hooks/useGetAppImageUrl')
jest.mock('../hooks/useGetActionAppIntegration')

const mockUseGetAppImageUrl = jest.mocked(useGetAppImageUrl)
const mockUseGetActionAppIntegration = jest.mocked(useGetActionAppIntegration)

mockUseGetAppImageUrl.mockReturnValue('/assets/img/integrations/shopify.png')

describe('<NativeActionTemplateCard />', () => {
    it('should render native action template card', () => {
        mockUseGetActionAppIntegration.mockReturnValue(shopifyIntegration)

        renderWithRouter(
            <NativeActionTemplateCard
                app={{
                    type: 'shopify',
                }}
                templateId="test1"
                templateName="test"
                shopName="shopify-store"
            />
        )

        expect(screen.getByText('test')).toBeInTheDocument()
    })

    it('should redirect to new action if action app integration exists', () => {
        mockUseGetActionAppIntegration.mockReturnValue(shopifyIntegration)

        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <NativeActionTemplateCard
                app={{
                    type: 'shopify',
                }}
                templateId="test1"
                templateName="test"
                shopName="shopify-store"
            />,
            {history}
        )

        act(() => {
            fireEvent.click(screen.getByText('test'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/actions/new?template_id=test1`
        )
    })

    it('should open modal for disabled integration on click if action app integration does not exists', () => {
        mockUseGetActionAppIntegration.mockReturnValue(undefined)

        renderWithRouter(
            <NativeActionTemplateCard
                app={{
                    type: 'recharge',
                }}
                templateId="test1"
                templateName="test"
                shopName="shopify-store"
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('test'))
        })

        expect(
            screen.getByText(
                'This Action requires an active Recharge integration.'
            )
        ).toBeInTheDocument()
    })
})
