import {fireEvent, screen, act, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {account} from 'fixtures/account'
import {integrationsState} from 'fixtures/integrations'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import ContactFormCreateView from 'pages/settings/contactForm/views/ContactFormCreateView/ContactFormCreateView'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'

const mockCheckContactFormName = jest.fn().mockResolvedValue(true)
const mockCreateContactForm = jest.fn().mockResolvedValue(ContactFormFixture)
jest.mock('pages/settings/contactForm/hooks/useContactFormApi', () => {
    return {
        useContactFormApi: () => ({
            isReady: true,
            isLoading: false,
            checkContactFormName: mockCheckContactFormName,
            createContactForm: mockCreateContactForm,
        }),
    }
})
jest.mock('pages/settings/helpCenter/providers/SupportedLocales')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ContactFormCreateView />', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    }

    const renderView = ({state}: {state: Partial<RootState>}) => {
        return renderWithRouter(
            <Provider store={mockStore(state)}>
                <ContactFormCreateView />,
            </Provider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.mocked(useSupportedLocales).mockReturnValue(
            getLocalesResponseFixture
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
        const {container} = renderView({state: defaultState})
        expect(container).toMatchSnapshot()
    })

    it('should not pre-fill default form name', async () => {
        renderView({state: defaultState})

        const nameInput = await screen.findByTestId('name')
        expect(nameInput.getAttribute('value')).toEqual('')
    })

    it('should hide alert after alert is acknowledged', async () => {
        renderView({state: defaultState})
        const AlertRegEx = /The default Gorgias email is selected\. Make sure/

        await screen.findByText(AlertRegEx)
        fireEvent.click(screen.getByLabelText('Close Icon'))

        await expect(screen.findByText(AlertRegEx)).rejects.toThrow(
            /Unable to find/
        )
    })

    describe('Submit form', () => {
        it('should disable the submit button if name is empty', async () => {
            renderView({state: defaultState})
            const nameInput = await screen.findByTestId('name')
            const submitButton = screen.getByRole('button', {
                name: /Create Contact Form/,
            })

            fireEvent.change(nameInput, {target: {value: 'Test'}})
            fireEvent.change(nameInput, {target: {value: ''}})

            expect(submitButton.className).toMatch(/disabled/i)
        })

        it('should have an error message if form name is one character long', async () => {
            renderView({state: defaultState})

            const nameInput = await screen.findByTestId('name')
            const submitButton = screen.getByRole('button', {
                name: /Create Contact Form/,
            })

            fireEvent.change(nameInput, {target: {value: 'X'}})
            expect(nameInput.getAttribute('value')).toEqual('X')
            expect(submitButton.className).toMatch(/disabled/i)

            screen.getByText(/Name should be at least 2 characters long/i)
        })

        it('should call API on submit', async () => {
            const TEST_NAME = 'Test name'
            renderView({state: defaultState})

            const submitButton = screen.getByRole('button', {
                name: /Create Contact Form/,
            })

            await act(async () => {
                await waitFor(() =>
                    fireEvent.change(screen.getByTestId('name'), {
                        target: {value: TEST_NAME},
                    })
                )

                expect(submitButton.className).not.toMatch(/disabled/i)

                fireEvent.click(submitButton)

                expect(mockCreateContactForm).toHaveBeenLastCalledWith({
                    email_integration: {
                        email: 'unverified@gorgias.io',
                        id: 13,
                    },
                    default_locale: 'en-US',
                    name: TEST_NAME,
                })
            })
        })
    })
})
