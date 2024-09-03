import React from 'react'
import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'

import {renderWithRouter} from 'utils/testing'
import {useGetActionsApp} from 'models/workflows/queries'
import {useGetApps} from 'models/integration/queries'
import {dummyAppListData} from 'fixtures/apps'

import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import AppActionTemplateCard from '../components/AppActionTemplateCard'

jest.mock('models/workflows/queries')
jest.mock('models/integration/queries')
jest.mock('../hooks/useGetAppImageUrl')

const mockUseGetAppImageUrl = jest.mocked(useGetAppImageUrl)
const mockUseGetActionsApp = jest.mocked(useGetActionsApp)
const mockUseGetApps = jest.mocked(useGetApps)

mockUseGetAppImageUrl.mockReturnValue('https://example.com/app.png')
mockUseGetActionsApp.mockReturnValue({
    data: {
        id: 'someid',
        auth_type: 'api-key',
        auth_settings: {
            url: 'https://example.com',
        },
    },
} as unknown as ReturnType<typeof useGetActionsApp>)
mockUseGetApps.mockReturnValue({
    data: [dummyAppListData],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetApps>)

describe('<AppActionTemplateCard />', () => {
    it('should render app action template card', () => {
        renderWithRouter(
            <AppActionTemplateCard
                app={{
                    app_id: 'someid',
                    type: 'app',
                }}
                templateId="test1"
                templateName="test"
                shopName="acme"
            />
        )

        expect(screen.getByText('test')).toBeInTheDocument()
    })

    it('should should open modal on click', () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <AppActionTemplateCard
                app={{
                    app_id: 'someid',
                    type: 'app',
                }}
                templateId="test1"
                templateName="test"
                shopName="acme"
            />,
            {history}
        )

        act(() => {
            fireEvent.click(screen.getByText('test'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Use Action'))
        })

        act(() => {
            fireEvent.change(screen.getByLabelText(/API key/), {
                target: {value: 'test api key'},
            })
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/acme/ai-agent/actions/new?template_id=test1`,
            {
                app_id: 'someid',
                api_key: 'test api key',
            }
        )
    })
})
