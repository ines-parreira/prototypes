import React from 'react'
import LD from 'launchdarkly-react-client-sdk'
import {screen} from '@testing-library/react'
import {renderWithRouter} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import {AiAgentPlaygroundContainerV2} from '../AiAgentPlaygroundV2Container'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AiAgentPlayground]: false,
    [FeatureFlagKey.AiAgentGuidance]: true,
    [FeatureFlagKey.AiAgentSettings]: true,
}))

const renderComponent = () => {
    return renderWithRouter(<AiAgentPlaygroundContainerV2 />, {
        path: `/:shopType/:shopName/ai-agent/playground`,
        route: '/shopify/test-shop/ai-agent/playground',
    })
}

describe('<AiAgentPlaygroundV2Container />', () => {
    it('should render', () => {
        renderComponent()

        expect(screen.getByText('Test your AI Agent')).toBeInTheDocument()
    })
})
