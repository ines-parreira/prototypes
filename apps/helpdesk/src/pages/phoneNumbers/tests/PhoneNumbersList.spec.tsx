import { useFlag } from '@repo/feature-flags'
import { within } from '@testing-library/dom'
import { fireEvent, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { PhoneUseCase } from 'business/twilio'
import { phoneNumbers } from 'fixtures/newPhoneNumber'
import type { RootState, StoreDispatch } from 'state/types'

import PhoneNumbersList from '../PhoneNumbersList'

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

const phoneNumbersWithUseCase = [
    { ...phoneNumbers[0], usecase: null },
    { ...phoneNumbers[1], usecase: PhoneUseCase.Standard },
    { ...phoneNumbers[2], usecase: PhoneUseCase.Marketing },
]

const storeWithUseCases = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbersWithUseCase.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState)

describe('<PhoneNumbersList/>', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(true)
    })

    describe('render()', () => {
        it('should render', () => {
            const { getByText } = render(
                <Provider store={store}>
                    <MemoryRouter>
                        <PhoneNumbersList />
                    </MemoryRouter>
                    ,
                </Provider>,
            )

            expect(getByText('Phone Number')).toBeInTheDocument()
            expect(getByText('Use case')).toBeInTheDocument()
            expect(getByText('Connected Apps')).toBeInTheDocument()
        })

        it('should allow sorting by column header', () => {
            const { getByText, getAllByRole } = render(
                <Provider store={store}>
                    <MemoryRouter>
                        <PhoneNumbersList />
                    </MemoryRouter>
                    ,
                </Provider>,
            )

            const getRows = () =>
                getAllByRole('row').map((row) =>
                    within(row)
                        .queryAllByRole('cell')
                        .map((cell) => cell.textContent),
                )

            const rowsBeforeSorting = getRows()

            expect(rowsBeforeSorting[1].slice(0, 1)).toEqual([
                '🇦🇺Intl. Phone Number +1 213 373 4255',
            ])
            expect(rowsBeforeSorting[2].slice(0, 1)).toEqual([
                '🇨🇦Another Phone Number +1 213 373 4254',
            ])
            expect(rowsBeforeSorting[3].slice(0, 1)).toEqual([
                '🇺🇸A Phone Number +1 213 373 4253',
            ])

            fireEvent.click(getByText('Phone Number'))

            const rowsAfterSorting = getRows()

            expect(rowsAfterSorting[1].slice(0, 1)).toEqual([
                '🇺🇸A Phone Number +1 213 373 4253',
            ])
            expect(rowsAfterSorting[2].slice(0, 1)).toEqual([
                '🇨🇦Another Phone Number +1 213 373 4254',
            ])
            expect(rowsAfterSorting[3].slice(0, 1)).toEqual([
                '🇦🇺Intl. Phone Number +1 213 373 4255',
            ])
        })

        it('should display Standard for null or standard usecase and Marketing for marketing usecase', () => {
            const { getAllByRole } = render(
                <Provider store={storeWithUseCases}>
                    <MemoryRouter>
                        <PhoneNumbersList />
                    </MemoryRouter>
                    ,
                </Provider>,
            )

            const getUseCaseColumn = () =>
                getAllByRole('row')
                    .slice(1)
                    .map(
                        (row) =>
                            within(row).queryAllByRole('cell')[1]?.textContent,
                    )

            const useCaseValues = getUseCaseColumn()

            expect(useCaseValues).toContain('Standard')
            expect(useCaseValues).toContain('Marketing')
        })
    })
})
