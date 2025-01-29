import {RenderResult, render, screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {BrowserRouter} from 'react-router-dom'

import {Form} from 'components/Form/Form'
import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import {integrationsState} from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import {IntegrationType} from 'models/integration/constants'
import {PhoneIntegration} from 'models/integration/types'
import VoiceIntegrationPreferences from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences'
import {assumeMock} from 'utils/testing'

import {getDefaultValues, useFormSubmit} from '../useVoicePreferencesForm'

jest.mock('@gorgias/api-client')

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(dispatchMock)

jest.mock('state/notifications/actions')

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone
) as unknown as PhoneIntegration

jest.mock('../useVoicePreferencesForm')

const useFormSubmitMock = assumeMock(useFormSubmit)
const getDefaultValuesMock = assumeMock(getDefaultValues)

jest.mock('components/Form/Form')
const FormMock = assumeMock(Form)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('../DEPRECATED_VoiceIntegrationPreferences', () => () => (
    <div>DEPRECATED_VoiceIntegrationPreferences</div>
))

jest.mock('../VoiceIntegrationPreferencesForm', () => () => (
    <div>VoiceIntegrationPreferencesForm</div>
))

describe('<VoiceIntegrationPreferences />', () => {
    const props = {
        integration: {
            ...phoneIntegration,
            meta: {
                ...(phoneIntegration?.meta ?? {}),
                phone_team_id: 1,
            },
        },
    }
    const onSubmit = jest.fn()

    const renderComponent = (props: any = {}): RenderResult =>
        render(
            <BrowserRouter>
                <VoiceIntegrationPreferences {...props} />
            </BrowserRouter>
        )

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })
        useFlagMock.mockReturnValue(true)
        useFormSubmitMock.mockReturnValue({onSubmit})
        getDefaultValuesMock.mockReturnValue('default-values' as any)
        FormMock.mockImplementation(({children}) => <div>{children}</div>)
    })

    it('should not render the component if integration is not a phone integration', () => {
        const {container} = renderComponent({
            integration: {
                ...phoneIntegration,
                type: IntegrationType.Email,
            },
        })

        expect(container.innerHTML).toBe('<div></div>')
    })

    it('should render the component', () => {
        renderComponent(props)

        expect(
            screen.getByText('VoiceIntegrationPreferencesForm')
        ).toBeInTheDocument()
    })

    it('should render DEPRECATED_VoiceIntegrationPreferences when isNewVoicePreferencesFormEnabled is false', () => {
        useFlagMock.mockReturnValue(false)

        const {getByText} = renderComponent(props)

        expect(
            getByText('DEPRECATED_VoiceIntegrationPreferences')
        ).toBeInTheDocument()
    })

    it('should send correct props to Form', () => {
        renderComponent(props)

        expect(FormMock).toHaveBeenCalledWith(
            expect.objectContaining({
                onValidSubmit: onSubmit,
                defaultValues: 'default-values',
                mode: 'onChange',
                resetOptions: {
                    keepDirty: false,
                    keepDefaultValues: false,
                },
            }),
            {}
        )
    })
})
