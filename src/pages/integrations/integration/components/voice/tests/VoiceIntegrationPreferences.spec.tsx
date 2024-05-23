import React from 'react'
import {
    RenderResult,
    cleanup,
    fireEvent,
    screen,
    waitFor,
} from '@testing-library/react'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import {integrationsState} from 'fixtures/integrations'
import {IntegrationType} from 'models/integration/constants'
import {mockStore} from 'utils/testing'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import VoiceIntegrationPreferences from '../VoiceIntegrationPreferences'

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone
)

jest.mock(
    '../VoiceIntegrationPreferencesInboundCalls',
    () =>
        ({
            onPreferencesChange,
            onPhoneTeamIdChange,
        }: {
            onPreferencesChange: (value: any) => void
            onPhoneTeamIdChange: (value: string | number) => void
        }) =>
            (
                <>
                    <input
                        data-testid="preferencesInput"
                        onChange={onPreferencesChange}
                    />
                    <input
                        data-testid="phoneTeamIdInput"
                        onChange={(event) =>
                            onPhoneTeamIdChange(event.target.value)
                        }
                    />
                </>
            )
)

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

    const renderComponent = (props: any = {}): RenderResult => {
        return renderWithQueryClientProvider(
            <BrowserRouter>
                <Provider store={mockStore({} as any)}>
                    <VoiceIntegrationPreferences {...props} />
                </Provider>
            </BrowserRouter>
        )
    }

    afterEach(() => {
        cleanup()
    })

    it('should render the component', () => {
        renderComponent(props)
        expect(screen.getByText('App title')).toBeInTheDocument()
    })

    it('should display the submit button as disabled when the form is not dirty', () => {
        renderComponent(props)

        expect(
            screen.getByRole('button', {name: 'Save changes'})
        ).toHaveAttribute('aria-disabled', 'true')
    })

    describe('when the form is dirty', () => {
        it('should enable submit when integration root fields are changed', async () => {
            renderComponent(props)

            const titleInput = screen.getByLabelText('App title')
            fireEvent.change(titleInput, {target: {value: 'New title'}})

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {name: 'Save changes'})
                ).toHaveAttribute('aria-disabled', 'false')
            })
        })

        it('should enable submit when integration meta fields are changed', async () => {
            renderComponent(props)

            const teamIdSelection = screen.getByTestId('phoneTeamIdInput')
            fireEvent.change(teamIdSelection, {target: {value: 2}})

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {name: 'Save changes'})
                ).toHaveAttribute('aria-disabled', 'false')
            })
        })

        it('should enable submit when integration preferences fields are changed', async () => {
            renderComponent(props)

            const preferencesInput = screen.getByTestId('preferencesInput')
            fireEvent.change(preferencesInput, {target: {value: 'new value'}})

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {name: 'Save changes'})
                ).toHaveAttribute('aria-disabled', 'false')
            })
        })
    })
})
