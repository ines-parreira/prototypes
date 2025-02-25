import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { integrationsState } from 'fixtures/integrations'
import ContactFormCreateView from 'pages/settings/contactForm/views/ContactFormCreateView/ContactFormCreateView'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { buildSDKMocks } from '../../../../../../rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from '../../../../../../tests/reactQueryTestingUtils'
import { mockResourceServerReplies } from '../../../tests/resource-mocks'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>
const mockCheckContactFormName = jest.fn().mockResolvedValue(true)

jest.mock('pages/settings/contactForm/hooks/useContactFormApi', () => {
    return {
        useContactFormApi: () => ({
            isReady: true,
            isLoading: false,
            checkContactFormName: mockCheckContactFormName,
        }),
    }
})
jest.mock('pages/settings/helpCenter/providers/SupportedLocales')

const testQueryClient = mockQueryClient()

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ContactFormCreateView />', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    }

    const renderView = ({ state }: { state: Partial<RootState> }) => {
        return renderWithRouter(
            <QueryClientProvider client={testQueryClient}>
                <Provider store={mockStore(state)}>
                    <ContactFormCreateView />,
                </Provider>
            </QueryClientProvider>,
        )
    }

    beforeEach(async () => {
        testQueryClient.clear()
        sdkMocks = await buildSDKMocks()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })

        jest.mocked(useSupportedLocales).mockReturnValue(
            getLocalesResponseFixture,
        )

        window.GORGIAS_STATE = {
            integrations: {
                authentication: {
                    email: {
                        forwarding_email_address: 'sendgrid@gorgias.io',
                    },
                },
            },
        } as any
    })

    it('should preserve valid classnames to have proper distances between sections', () => {
        const { container } = renderView({ state: defaultState })
        expect(container).toMatchSnapshot()
    })

    it('should not pre-fill default form name', async () => {
        renderView({ state: defaultState })

        const nameInput = await screen.findByTestId('name')
        expect(nameInput.getAttribute('value')).toEqual('')
    })

    describe('Submit form', () => {
        it('should disable the submit button if name is empty', async () => {
            renderView({ state: defaultState })
            const nameInput = await screen.findByTestId('name')
            const submitButton = screen.getByRole('button', {
                name: /Create Contact Form/,
            })

            fireEvent.change(nameInput, { target: { value: 'Test' } })
            fireEvent.change(nameInput, { target: { value: '' } })

            expect(submitButton.className).toMatch(/disabled/i)
        })

        it('should have an error message if form name is one character long', async () => {
            renderView({ state: defaultState })

            const nameInput = await screen.findByTestId('name')
            const submitButton = screen.getByRole('button', {
                name: /Create Contact Form/,
            })

            fireEvent.change(nameInput, { target: { value: 'X' } })
            expect(nameInput.getAttribute('value')).toEqual('X')
            expect(submitButton.className).toMatch(/disabled/i)

            screen.getByText(/Name should be at least 2 characters long/i)
        })

        it('should call API on submit to create a contact form', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                createContactForm: 'success',
            })

            const spy = jest.spyOn(sdkMocks.client, 'createContactForm')

            const TEST_NAME = 'Test name'
            renderView({ state: defaultState })

            const submitButton = screen.getByRole('button', {
                name: /Create Contact Form/,
            })

            await act(async () => {
                await waitFor(() =>
                    fireEvent.change(screen.getByTestId('name'), {
                        target: { value: TEST_NAME },
                    }),
                )

                expect(submitButton.className).not.toMatch(/disabled/i)

                fireEvent.click(submitButton)
            })

            await waitFor(() => {
                expect(spy.mock.calls).toMatchInlineSnapshot(`
                    [
                      [
                        null,
                        {
                          "default_locale": "en-US",
                          "email_integration": {
                            "email": "unverified@gorgias.io",
                            "id": 13,
                          },
                          "form_display_mode": undefined,
                          "name": "Test name",
                        },
                      ],
                    ]
                `)
            })
        })
    })
})
