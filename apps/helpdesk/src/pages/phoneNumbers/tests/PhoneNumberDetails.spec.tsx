import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { toast } from '@gorgias/axiom'

import { PhoneUseCase } from 'business/twilio'
import { phoneNumbers } from 'fixtures/newPhoneNumber'
import { IntegrationType } from 'models/integration/types'
import {
    deleteNewPhoneNumber,
    updateNewPhoneNumber,
} from 'models/phoneNumber/resources'
import type { PhoneNumber } from 'models/phoneNumber/types'
import type { RootState, StoreDispatch } from 'state/types'

import { PhoneNumberDetails } from '../PhoneNumberDetails'

jest.mock('models/phoneNumber/resources')
const mockDelete = deleteNewPhoneNumber as jest.MockedFunction<
    typeof deleteNewPhoneNumber
>
const mockUpdate = updateNewPhoneNumber as jest.MockedFunction<
    typeof updateNewPhoneNumber
>

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbers.reduce((acc, number) => ({
            ...acc,
            [number.id]: number,
        })),
    },
} as unknown as RootState)

describe('<PhoneNumberDetails/>', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    afterEach(() => {
        toast.dismiss()
    })

    describe('render()', () => {
        it('should render with a local US number', () => {
            const { container } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )
            expect(container).toMatchSnapshot()
        })

        it('should render with a toll-free CA number', () => {
            const { container } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[1]} />
                </Provider>,
            )
            expect(container).toMatchSnapshot()
        })

        it('should render with a mobile GB number', () => {
            const { container } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[2]} />
                </Provider>,
            )
            expect(container).toMatchSnapshot()
        })

        it('should render the link to an SMS integration', () => {
            const store = mockStore({
                entities: {
                    phoneNumbers: phoneNumbers.reduce((acc, number) => ({
                        ...acc,
                        [number.id]: number,
                    })),
                },
            } as unknown as RootState)

            const { container, queryByText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[1]} />
                </Provider>,
            )
            expect(queryByText('SMS')).toBeTruthy()
            expect(container).toMatchSnapshot()
        })

        it('should render a "Manage Integration" link if existing attached integration', () => {
            const phoneNumber: PhoneNumber = {
                ...phoneNumbers[1],
                integrations: [
                    {
                        id: 1,
                        type: IntegrationType.Phone,
                        name: 'Some Phone Integration',
                    },
                ],
            }
            const store = mockStore({
                currentAccount: fromJS({
                    domain: 'acme',
                }),
                entities: {
                    phoneNumbers: {
                        [phoneNumber.id]: phoneNumber,
                    },
                },
            } as unknown as RootState)

            const { container, queryAllByText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                </Provider>,
            )

            expect(queryAllByText('Manage Integration').length).toBe(1)
            expect(queryAllByText('Add Integration').length).toBe(2)
            expect(container).toMatchSnapshot()
        })

        it('should render a "Add Integration" link if no existing attached integration', () => {
            const phoneNumber: PhoneNumber = {
                ...phoneNumbers[1],
                integrations: [],
            }
            const store = mockStore({
                entities: {
                    phoneNumbers: {
                        [phoneNumber.id]: phoneNumber,
                    },
                },
            } as unknown as RootState)

            const { container, queryAllByText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                </Provider>,
            )

            expect(queryAllByText('Manage Integration').length).toBe(0)
            expect(queryAllByText('Add Integration').length).toBe(3)
            expect(container).toMatchSnapshot()
        })

        it('should not render a "Add Integration" link if missing capabilities', () => {
            const phoneNumber: PhoneNumber = {
                ...phoneNumbers[2],
                integrations: [],
            }
            const store = mockStore({
                entities: {
                    phoneNumbers: {
                        [phoneNumber.id]: phoneNumber,
                    },
                },
            } as unknown as RootState)

            const { container, queryAllByText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                </Provider>,
            )
            expect(phoneNumber.capabilities.voice).toBe(true)
            expect(phoneNumber.capabilities.sms).toBe(false)
            expect(queryAllByText('SMS').length).toBe(0)
            expect(queryAllByText('Manage Integration').length).toBe(0)
            expect(queryAllByText('Add Integration').length).toBe(2)
            expect(container).toMatchSnapshot()
        })
    })

    describe('Use case field', () => {
        it('should not render Use case field when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const { queryByLabelText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )

            expect(queryByLabelText('Use case')).toBeNull()
        })

        it('should render Use case field when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            const { getByLabelText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )

            expect(getByLabelText('Use case')).toBeInTheDocument()
            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.MarketingPhoneNumber,
            )
        })

        it('should display "Standard" when usecase is undefined', () => {
            mockUseFlag.mockReturnValue(true)
            const phoneNumber = { ...phoneNumbers[0], usecase: undefined }

            const { getByLabelText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                </Provider>,
            )

            expect(getByLabelText('Use case')).toHaveValue('Standard')
        })

        it('should display "Marketing" when usecase is marketing', () => {
            mockUseFlag.mockReturnValue(true)
            const phoneNumber = {
                ...phoneNumbers[0],
                usecase: PhoneUseCase.Marketing,
            }

            const { getByLabelText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                </Provider>,
            )

            expect(getByLabelText('Use case')).toHaveValue('Marketing')
        })
    })

    describe('Save changes', () => {
        it('shows a success toast when the update succeeds', async () => {
            mockUpdate.mockResolvedValueOnce(phoneNumbers[0] as never)
            const { getByText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )

            fireEvent.click(getByText('Save changes'))

            const toastEl = await screen.findByRole('status', {
                name: 'Successfully updated phone number',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('shows an error toast when the update fails', async () => {
            mockUpdate.mockRejectedValueOnce(new Error('boom'))
            const { getByText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )

            fireEvent.click(getByText('Save changes'))

            const toastEl = await screen.findByRole('status', {
                name: 'Failed to update phone number',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('Delete number', () => {
        it('shows a success toast when the deletion succeeds', async () => {
            mockDelete.mockResolvedValueOnce({} as never)
            const { getByText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )

            fireEvent.click(getByText('Delete number'))
            await waitFor(() => {
                expect(getByText('Confirm')).toBeInTheDocument()
            })
            fireEvent.click(getByText('Confirm'))

            const toastEl = await screen.findByRole('status', {
                name: 'Successfully deleted phone number',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('shows an error toast when the deletion fails', async () => {
            mockDelete.mockRejectedValueOnce({
                isAxiosError: true,
                response: { data: { error: { msg: 'API delete error' } } },
            })
            const { getByText } = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )

            fireEvent.click(getByText('Delete number'))
            await waitFor(() => {
                expect(getByText('Confirm')).toBeInTheDocument()
            })
            fireEvent.click(getByText('Confirm'))

            const toastEl = await screen.findByRole('status', {
                name: 'API delete error',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
