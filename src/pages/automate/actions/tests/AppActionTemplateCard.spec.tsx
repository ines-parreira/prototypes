import React from 'react'
import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'

import {renderWithRouter} from 'utils/testing'
import {useGetActionsApp} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import AppActionTemplateCard from '../components/AppActionTemplateCard'

jest.mock('models/workflows/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('../hooks/useGetAppImageUrl')

const mockUseGetAppImageUrl = jest.mocked(useGetAppImageUrl)
const mockUseGetActionsApp = jest.mocked(useGetActionsApp)
const mockUseApps = jest.mocked(useApps)

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
mockUseApps.mockReturnValue({
    apps: [
        {
            icon: 'https://ok.com/1.png',
            id: 'someid',
            name: 'My test app',
            type: 'app',
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useApps>)

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
