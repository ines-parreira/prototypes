import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { PhoneUseCase } from 'business/twilio'
import { phoneNumbers } from 'fixtures/newPhoneNumber'
import { IntegrationType } from 'models/integration/types'
import type { PhoneNumber } from 'models/phoneNumber/types'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { PhoneNumberDetails } from '../PhoneNumberDetails'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState)

describe('<PhoneNumberDetails/>', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    describe('render()', () => {
        it('should render with a local US number', () => {
            const { container } = renderWithRouter(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )
            expect(container).toMatchSnapshot()
        })

        it('should render with a toll-free CA number', () => {
            const { container } = renderWithRouter(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[1]} />
                </Provider>,
            )
            expect(container).toMatchSnapshot()
        })

        it('should render with a mobile GB number', () => {
            const { container } = renderWithRouter(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[2]} />
                </Provider>,
            )
            expect(container).toMatchSnapshot()
        })

        it('should render the link to an SMS integration', () => {
            const store = mockStore({
                entities: {
                    phoneNumbers: phoneNumbers.reduce(
                        (acc, number) => ({ ...acc, [number.id]: number }),
                        {},
                    ),
                },
            } as RootState)

            const { container, queryByText } = renderWithRouter(
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

            const { container, queryAllByText } = renderWithRouter(
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

            const { container, queryAllByText } = renderWithRouter(
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

            const { container, queryAllByText } = renderWithRouter(
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

            const { queryByLabelText } = renderWithRouter(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>,
            )

            expect(queryByLabelText('Use case')).toBeNull()
        })

        it('should render Use case field when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            const { getByLabelText } = renderWithRouter(
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

            const { getByLabelText } = renderWithRouter(
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

            const { getByLabelText } = renderWithRouter(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                </Provider>,
            )

            expect(getByLabelText('Use case')).toHaveValue('Marketing')
        })
    })
})
