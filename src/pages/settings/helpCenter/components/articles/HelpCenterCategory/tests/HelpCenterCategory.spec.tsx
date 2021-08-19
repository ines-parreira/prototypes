import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {act, fireEvent, render} from '@testing-library/react'

import {getSingleHelpcenterResponseFixture as helpCenter} from '../../../../fixtures/getHelpcenterResponse.fixture'

import {RootState, StoreDispatch} from '../../../../../../../state/types'
import {initialState as articlesState} from '../../../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../../../state/helpCenter/categories/reducer'

import {HELP_CENTER_DOMAIN} from '../../../../constants'

import {HelpCenterCategory} from '../HelpCenterCategory'

jest.mock('../../../../hooks/useLocales', () => ({
    useLocales: () => [
        {
            name: 'English - USA',
            code: 'en-US',
        },
        {
            name: 'French - France',
            code: 'fr-FR',
        },
        {
            name: 'French - Canada',
            code: 'fr-CA',
        },
        {
            name: 'Czech - Czech Republic',
            code: 'cs-CZ',
        },
    ],
}))

type Props = {
    isOpen?: boolean
    getCategory?: () => Promise<unknown>
}

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    helpCenter: {
        ui: uiState,
        articles: articlesState,
        categories: categoriesState,
    },
}

const Example = ({isOpen = false}: Props) => {
    const [open, setOpen] = React.useState(isOpen)

    return (
        <Provider store={mockedStore(defaultState)}>
            <button data-testid="toggle-btn" onClick={() => setOpen(true)}>
                Click me
            </button>
            <HelpCenterCategory
                isOpen={open}
                isLoading={false}
                helpCenter={helpCenter}
                onClose={() => setOpen(false)}
                onLocaleChange={jest.fn()}
                onDeleteTranslation={jest.fn()}
            />
        </Provider>
    )
}

describe('<HelpCenterCategory>', () => {
    it('renders in a hidden state by default', () => {
        const {getByTestId} = render(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterCategory
                    isOpen={false}
                    isLoading={false}
                    helpCenter={helpCenter}
                    onClose={jest.fn()}
                    onLocaleChange={jest.fn()}
                    onDeleteTranslation={jest.fn()}
                />
            </Provider>
        )

        expect(getByTestId('category-edit').className).toEqual('drawer closed')
    })

    it('appears when isOpen is true', () => {
        const {getByTestId} = render(<Example isOpen />)

        expect(getByTestId('category-edit').className).toEqual('drawer opened')
    })

    it('focuses the Title input when in view', () => {
        const {getByTestId} = render(<Example isOpen />)
        const titleInput = getByTestId('title-input')

        expect(document.activeElement).toEqual(titleInput)
    })

    describe('when the slug input is pristine', () => {
        it('autocomplete the Slug input when Title is changed', () => {
            const {getByTestId} = render(<Example isOpen />)

            const slugInput = getByTestId('slug-input') as HTMLInputElement
            expect(slugInput.value).toEqual('')

            fireEvent.change(getByTestId('title-input'), {
                target: {
                    value: 'About us',
                },
            })

            expect(slugInput.value).toEqual('about-us')
        })
    })

    describe('when the slug was touched', () => {
        it(`doesn't change the Slug input when Title is changed`, () => {
            const {getByTestId} = render(<Example isOpen />)

            const slugInput = getByTestId('slug-input') as HTMLInputElement
            fireEvent.change(getByTestId('slug-input'), {
                target: {
                    value: 'slug-1',
                },
            })

            expect(slugInput.value).toEqual('slug-1')

            fireEvent.change(getByTestId('title-input'), {
                target: {
                    value: 'About us',
                },
            })

            expect(slugInput.value).toEqual('slug-1')
        })
    })

    it('changes the language in the slug domain', () => {
        const {getByTestId} = render(<Example isOpen />)

        expect(getByTestId('slug-domain').textContent).toEqual(
            `https://${helpCenter.subdomain}.${HELP_CENTER_DOMAIN}/en-us`
        )

        fireEvent.click(getByTestId('dropdown-select-trigger'))
        fireEvent.click(getByTestId('option-fr-FR'))

        expect(getByTestId('slug-domain').textContent).toEqual(
            `https://${helpCenter.subdomain}.${HELP_CENTER_DOMAIN}/fr-fr`
        )
    })

    it('disables the Save button if Title, Slug or Description are missing', () => {
        const {getByLabelText, getByTestId} = render(<Example isOpen />)
        const button = getByTestId('button-save') as HTMLButtonElement

        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByTestId('title-input'), {
            target: {
                value: 'About us',
            },
        })
        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByLabelText('Description'), {
            target: {
                value: '   ',
            },
        })
        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByLabelText('Description'), {
            target: {
                value: 'some description',
            },
        })
        expect(button.disabled).toBeFalsy()
    })

    it('resets the fields when isOpen changes to false', () => {
        const {getByTestId} = render(<Example isOpen />)
        const titleInput = getByTestId('title-input') as HTMLInputElement

        act(() => {
            expect(titleInput.value).toEqual('')

            fireEvent.change(titleInput, {
                target: {
                    value: 'About us',
                },
            })

            // Toggle the drawer to reset the state
            fireEvent.click(getByTestId('close-drawer'))
            fireEvent.click(getByTestId('toggle-btn'))

            expect(titleInput.value).toEqual('')
        })
    })
})
