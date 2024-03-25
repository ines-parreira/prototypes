import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Router} from 'react-router-dom'
import {createMemoryHistory} from 'history'
import {channelConnection} from 'fixtures/channelConnection'
import {shopifyIntegration} from 'fixtures/integrations'
import {OnboardingWizardSteps} from 'pages/convert/onboarding/components/ConvertOnboardingWizardView/constants'
import {assumeMock} from 'utils/testing'
import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import {installBundleMockImplementation} from 'fixtures/convertBundle'
import {useUpdateChannelConnection} from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardLayout from '../WizardLayout'

jest.mock('pages/convert/bundles/hooks/useInstallBundle')
const useInstallBundleMock = assumeMock(useInstallBundle)

jest.mock('pages/convert/channelConnections/hooks/useUpdateChannelConnection')
const useUpdateChannelConnectionMock = assumeMock(useUpdateChannelConnection)

jest.mock('pages/convert/bundles/components/ConvertInstallModal', () => {
    return jest.fn(() => <div>ConvertInstallModal</div>)
})
jest.mock(
    'pages/convert/onboarding/components/ConvertOnboardingWizardView/components/WizardCampaignsStep',
    () => {
        return jest.fn(() => <div>WizardCampaignsStep</div>)
    }
)
jest.mock(
    'pages/convert/onboarding/components/ConvertOnboardingWizardView/components/WizardInstallStep',
    () => {
        return jest.fn(() => <div>WizardInstallStep</div>)
    }
)

describe('WizardLayout', () => {
    test('renders correctly and handles next step', () => {
        useInstallBundleMock.mockImplementation(installBundleMockImplementation)

        const mutateUpdateMock = jest.fn()
        useUpdateChannelConnectionMock.mockImplementation(() => {
            return {
                mutateAsync: mutateUpdateMock,
            } as unknown as ReturnType<typeof useUpdateChannelConnection>
        })

        const steps = Object.values(OnboardingWizardSteps)

        const history = createMemoryHistory()

        const {getByText} = render(
            <Router history={history}>
                <Wizard steps={steps} startAt={OnboardingWizardSteps.Campaigns}>
                    <WizardLayout
                        steps={steps}
                        integration={fromJS({id: 123})}
                        channelConnection={channelConnection}
                        storeIntegration={fromJS(shopifyIntegration)}
                    />
                </Wizard>
            </Router>
        )

        expect(getByText('Campaigns')).toBeInTheDocument()
        expect(getByText('Install bundle')).toBeInTheDocument()

        expect(getByText('WizardCampaignsStep')).toBeInTheDocument()

        fireEvent.click(getByText('Finish Setup'))
        expect(getByText('WizardInstallStep')).toBeInTheDocument()

        fireEvent.click(getByText('Previous'))
        expect(getByText('WizardCampaignsStep')).toBeInTheDocument()
    })
})
