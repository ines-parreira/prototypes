import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { resetLDMocks } from '@repo/feature-flags/testing'
import { assumeMock } from '@repo/testing'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { capabilities, phoneNumbers } from 'fixtures/phoneNumber'
import { fetchPhoneCapabilities } from 'models/phoneNumber/resources'
import * as apiCalls from 'models/phoneNumber/resources'
import * as notificationActions from 'state/notifications/actions'
import type { AlertNotification } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

import PhoneNumberCreateForm from '../PhoneNumberCreateForm'
import * as phoneNumberUtils from '../utils'

const mockUseFlag = assumeMock(useFlag)

const QueryClientProvider = mockQueryClientProvider().QueryClientProvider
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState)

jest.mock('models/phoneNumber/resources')
const createPhoneNumberSpy = jest.spyOn(apiCalls, 'createPhoneNumber')

const notify = jest.spyOn(notificationActions, 'notify')

const getAddressValidationAlertMessageSpy = jest.spyOn(
    phoneNumberUtils,
    'getAddressValidationAlertMessage',
)

describe('<PhoneNumberCreateForm/>', () => {
    const renderComponent = () =>
        render(
            <Provider store={store}>
                <QueryClientProvider>
                    <PhoneNumberCreateForm />
                </QueryClientProvider>
            </Provider>,
        )

    beforeEach(() => {
        jest.resetAllMocks()
        assumeMock(fetchPhoneCapabilities).mockResolvedValue(capabilities)
        resetLDMocks()
    })

    afterEach(cleanup)

    it('should render Alert message when there is one', () => {
        getAddressValidationAlertMessageSpy.mockReturnValue(
            'test message' as any,
        )

        renderComponent()
        expect(screen.getByText('test message')).toBeVisible()
        expect(
            screen.getByRole('button', { name: /Add phone number/ }),
        ).toBeAriaDisabled()
    })

    it('should not render Alert message when there is none', () => {
        getAddressValidationAlertMessageSpy.mockReturnValue(null as any)

        renderComponent()
        expect(screen.queryByText('test message')).toBeNull()
        expect(
            screen.getByRole('button', { name: /Add phone number/ }),
        ).not.toBeAriaDisabled()
    })

    describe('render()', () => {
        it('should render when a country and a state are selected', async () => {
            const { container, getByText } = renderComponent()

            await act(async () => {
                await userEvent.click(getByText('United States'))
            })
            await act(async () => {
                await userEvent.click(getByText('Local'))
            })
            await act(async () => {
                await userEvent.click(getByText('Alabama'))
            })

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render when type "Toll-free" is selected', async () => {
            const { container, getByText } = renderComponent()

            await act(async () => {
                await userEvent.click(getByText('Canada'))
            })
            await act(async () => {
                await userEvent.click(getByText('Toll-free'))
            })

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render address validation form for Australia', async () => {
            const { getByText, queryByText } = renderComponent()

            await act(async () => {
                await userEvent.click(getByText('United States'))
            })
            expect(queryByText('Address verification')).toBe(null)

            await act(async () => {
                await userEvent.click(getByText('Canada'))
            })
            expect(queryByText('Address verification')).toBe(null)

            await act(async () => {
                await userEvent.click(getByText('United Kingdom'))
            })
            expect(queryByText('Address verification')).toBe(null)

            await act(async () => {
                await userEvent.click(getByText('Australia'))
            })
            await waitFor(() => {
                expect(queryByText('Address verification')).not.toBe(null)
            })
        })

        it('should pass the address if a phone of a country with address verification is created', async () => {
            const { getByText, getByRole, findByText } = renderComponent()

            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', {
                        name: /phone number name required/i,
                    }),
                    'test title',
                )
            })

            await act(async () => {
                await userEvent.click(getByText('Australia'))
            })

            await findByText('Address verification')

            // Wait for Adelaide option to be available
            await waitFor(() => {
                expect(getByText('Adelaide (87)')).toBeInTheDocument()
            })
            await act(async () => {
                await userEvent.click(getByText('Adelaide (87)'))
            })

            // Wait for Business information section to be available
            await waitFor(() => {
                expect(getByText('Business information')).toBeInTheDocument()
            })
            await act(async () => {
                await userEvent.click(getByText('Business information'))
            })

            // Fill in all the address fields
            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', { name: /business name required/i }),
                    'test business name',
                )
            })
            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', { name: /address required/i }),
                    'test address',
                )
            })
            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', { name: /city required/i }),
                    'test city',
                )
            })
            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', {
                        name: /state\/province\/region required/i,
                    }),
                    'test region',
                )
            })
            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', { name: /postal code required/i }),
                    'test postal code',
                )
            })

            await act(async () => {
                await userEvent.click(getByText('Add phone number'))
            })

            await waitFor(() => {
                expect(createPhoneNumberSpy).toHaveBeenCalled()
            })

            const latestCallArguments = createPhoneNumberSpy.mock.lastCall?.[0]

            expect(latestCallArguments?.address).toStrictEqual({
                country: 'AU',
                type: 'company',
                business_name: 'test business name',
                address: 'test address',
                city: 'test city',
                region: 'test region',
                postal_code: 'test postal code',
            })
        })

        it('should call createPhoneNumber with the correct payload after switching from country with address verification', async () => {
            const { getByText, getByRole } = renderComponent()

            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', {
                        name: /phone number name required/i,
                    }),
                    'test title',
                )
            })

            await act(async () => {
                await userEvent.click(getByText('Australia'))
            })

            await screen.findByText('Address verification')

            // Type business name for Australia
            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', { name: /business name required/i }),
                    'test business name',
                )
            })

            // Switch to United States
            await act(async () => {
                await userEvent.click(getByText('United States'))
            })

            // Wait for US states to load
            await waitFor(() => {
                expect(screen.getByText('Alabama')).toBeInTheDocument()
            })
            await act(async () => {
                await userEvent.click(getByText('Alabama'))
            })

            // Wait for area codes to load
            await waitFor(() => {
                expect(screen.getByText('Mobile (251)')).toBeInTheDocument()
            })
            await act(async () => {
                await userEvent.click(getByText('Mobile (251)'))
            })

            await act(async () => {
                await userEvent.click(getByText('Add phone number'))
            })

            await waitFor(() => {
                expect(createPhoneNumberSpy).toHaveBeenCalled()
            })

            const latestCallArguments = createPhoneNumberSpy.mock.lastCall?.[0]
            expect(latestCallArguments?.address).toStrictEqual({
                country: 'US',
                type: 'company',
            })
        })

        it('should render custom error', async () => {
            createPhoneNumberSpy.mockImplementation(() =>
                Promise.reject({
                    response: {
                        data: {
                            error: {
                                msg: 'Failed',
                                data: { use_custom: 'UPGRADE_MESSAGE' },
                            },
                        },
                    },
                }),
            )

            const { getByText, getByRole, findByText } = renderComponent()

            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', {
                        name: /phone number name required/i,
                    }),
                    'test title',
                )
            })

            await act(async () => {
                await userEvent.click(getByText('United States'))
            })
            await findByText('Alabama')
            await act(async () => {
                await userEvent.click(getByText('Alabama'))
            })

            await waitFor(() => {
                expect(getByText('Birmingham (205)')).toBeInTheDocument()
            })
            await act(async () => {
                await userEvent.click(getByText('Birmingham (205)'))
            })
            await act(async () => {
                await userEvent.click(getByText('Add phone number'))
            })

            await waitFor(() => {
                expect(createPhoneNumberSpy).toHaveBeenCalled()

                const notificationSent = notify.mock
                    .lastCall?.[0] as AlertNotification
                expect(notificationSent?.title).toEqual(
                    'Cannot add phone number.',
                )
                expect(notificationSent?.allowHTML).toBe(true)
            })
        })
    })

    describe('usecase field', () => {
        it('should show usecase field for US when marketing-phone-number flag is enabled', async () => {
            mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
                if (key === FeatureFlagKey.MarketingPhoneNumber) {
                    return true
                }
                return false
            })

            const { getByText, findByText } = renderComponent()

            await act(async () => {
                await userEvent.click(getByText('United States'))
            })
            await findByText('Alabama')
            await act(async () => {
                await userEvent.click(getByText('Alabama'))
            })

            await waitFor(() => {
                expect(screen.getByLabelText('Use case')).toBeInTheDocument()
            })
        })

        it('should show usecase field for Canada when marketing-phone-number flag is enabled', async () => {
            mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
                if (key === FeatureFlagKey.MarketingPhoneNumber) {
                    return true
                }
                return false
            })

            const { getByText } = renderComponent()

            await act(async () => {
                await userEvent.click(getByText('Canada'))
            })

            await waitFor(() => {
                expect(screen.getByLabelText('Use case')).toBeInTheDocument()
            })
        })

        it('should not show usecase field when marketing-phone-number flag is disabled', async () => {
            mockUseFlag.mockImplementation(() => false)

            const { getByText, findByText } = renderComponent()

            await act(async () => {
                await userEvent.click(getByText('United States'))
            })
            await findByText('Alabama')
            await act(async () => {
                await userEvent.click(getByText('Alabama'))
            })

            await waitFor(() => {
                expect(screen.queryByLabelText('Use case')).toBe(null)
            })
        })

        it('should include usecase in payload only when Marketing is selected', async () => {
            mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
                if (key === FeatureFlagKey.MarketingPhoneNumber) {
                    return true
                }
                return false
            })

            const { getByText, getByRole, findByText } = renderComponent()

            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', {
                        name: /phone number name required/i,
                    }),
                    'test title',
                )
            })

            await act(async () => {
                await userEvent.click(getByText('United States'))
            })
            await findByText('Alabama')
            await act(async () => {
                await userEvent.click(getByText('Alabama'))
            })

            // Wait for usecase field to appear
            await waitFor(() => {
                expect(screen.getByLabelText('Use case')).toBeInTheDocument()
            })

            // Select Marketing usecase
            await act(async () => {
                await userEvent.click(getByText('Standard'))
            })
            await act(async () => {
                await userEvent.click(getByText('Marketing'))
            })

            // Wait for area codes to load
            await waitFor(() => {
                expect(screen.getByText('Birmingham (205)')).toBeInTheDocument()
            })
            await act(async () => {
                await userEvent.click(getByText('Birmingham (205)'))
            })

            await act(async () => {
                await userEvent.click(getByText('Add phone number'))
            })

            await waitFor(() => {
                expect(createPhoneNumberSpy).toHaveBeenCalled()
            })

            const latestCallArguments = createPhoneNumberSpy.mock.lastCall?.[0]
            expect(latestCallArguments?.usecase).toBe('marketing')
        })

        it('should not include usecase in payload when Standard is selected', async () => {
            mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
                if (key === FeatureFlagKey.MarketingPhoneNumber) {
                    return true
                }
                return false
            })

            const { getByText, getByRole, findByText } = renderComponent()

            await act(async () => {
                await userEvent.type(
                    getByRole('textbox', {
                        name: /phone number name required/i,
                    }),
                    'test title',
                )
            })

            await act(async () => {
                await userEvent.click(getByText('United States'))
            })
            await findByText('Alabama')
            await act(async () => {
                await userEvent.click(getByText('Alabama'))
            })

            // Wait for usecase field to appear and keep Standard selected (default)
            await waitFor(() => {
                expect(screen.getByLabelText('Use case')).toBeInTheDocument()
            })

            // Select Standard usecase explicitly
            await act(async () => {
                await userEvent.click(getByText('Standard'))
            })

            // Wait for area codes to load
            await waitFor(() => {
                expect(screen.getByText('Birmingham (205)')).toBeInTheDocument()
            })
            await act(async () => {
                await userEvent.click(getByText('Birmingham (205)'))
            })

            await act(async () => {
                await userEvent.click(getByText('Add phone number'))
            })

            await waitFor(() => {
                expect(createPhoneNumberSpy).toHaveBeenCalled()
            })

            const latestCallArguments = createPhoneNumberSpy.mock.lastCall?.[0]
            expect(latestCallArguments?.usecase).toBeUndefined()
        })
    })
})
