import {screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {renderWithRouter} from 'utils/testing'

import {AiAgentLayout} from '../AiAgentLayout'

jest.mock('../../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: () => ({
        storeConfiguration: undefined,
        isLoading: false,
        updateStoreConfiguration: jest.fn(),
        isPendingCreateOrUpdate: false,
    }),
}))
jest.mock('../../../hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: () => ({
        updateSettingsAfterAiAgentEnabled: jest.fn(),
    }),
}))

const renderComponent = (
    props: Partial<ComponentProps<typeof AiAgentLayout>>
) => {
    renderWithRouter(
        <AiAgentLayout shopName="test-shop" {...props}>
            Test Content
        </AiAgentLayout>
    )
}
describe('<AiAgentLayout />', () => {
    it('should render', () => {
        renderComponent({})
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should not render ai agent enable when multi channel support enabled', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentMultiChannelEnablement]: true,
        })
        renderComponent({})

        expect(screen.queryByRole('switcher')).not.toBeInTheDocument()
    })
})
