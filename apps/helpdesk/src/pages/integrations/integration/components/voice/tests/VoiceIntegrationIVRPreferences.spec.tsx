import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import type { RenderResult } from '@testing-library/react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { Form } from 'core/forms'
import { integrationsState } from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/constants'
import type { PhoneIntegration } from 'models/integration/types'
import VoiceIntegrationIVRPreferences from 'pages/integrations/integration/components/voice/VoiceIntegrationIVRPreferences'

import { getDefaultValues, useFormSubmit } from '../useVoiceSettingsForm'

jest.mock('@gorgias/helpdesk-client')

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(dispatchMock)

jest.mock('state/notifications/actions')

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

jest.mock('../useVoiceSettingsForm')

const useFormSubmitMock = assumeMock(useFormSubmit)
const getDefaultValuesMock = assumeMock(getDefaultValues)

jest.mock('core/forms')
const FormMock = assumeMock(Form)

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('../VoiceIntegrationIVRPreferencesForm', () => () => (
    <div>VoiceIntegrationIVRPreferencesForm</div>
))

describe('<VoiceIntegrationIVRPreferences />', () => {
    const props = {
        integration: {
            ...phoneIntegration,
            meta: {
                ...phoneIntegration?.meta,
                phone_team_id: 1,
            },
        },
    }
    const onSubmit = jest.fn()

    const renderComponent = (props: any = {}): RenderResult =>
        render(
            <BrowserRouter>
                <VoiceIntegrationIVRPreferences {...props} />
            </BrowserRouter>,
        )

    beforeEach(() => {
        useFlagMock.mockReturnValue(true)
        useFormSubmitMock.mockReturnValue({ onSubmit })
        getDefaultValuesMock.mockReturnValue('default-values' as any)
        FormMock.mockImplementation(({ children }) => <div>{children}</div>)
    })

    it('should not render the component if integration is not a phone integration', () => {
        const { container } = renderComponent({
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
            screen.getByText('VoiceIntegrationIVRPreferencesForm'),
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
                    keepDirtyValues: false,
                },
                validator: expect.any(Function),
            }),
            {},
        )
    })
})
