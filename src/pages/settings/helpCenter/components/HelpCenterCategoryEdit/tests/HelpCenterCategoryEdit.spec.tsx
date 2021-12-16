import {act, fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {HelpCenter} from '../../../../../../models/helpCenter/types'
import {initialState as articlesState} from '../../../../../../state/helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../../../../state/helpCenter/categories/reducer'
import {initialState as uiState} from '../../../../../../state/helpCenter/ui/reducer'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import {HELP_CENTER_DOMAIN} from '../../../constants'
import {getSingleCustomDomainResponseFixture as customDomain} from '../../../fixtures/getCustomDomainsResponse.fixture'
import {getSingleHelpCenterResponseFixture} from '../../../fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from '../../../providers/SupportedLocales'
import {HelpCenterCategoryEdit} from '../HelpCenterCategoryEdit'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    helpCenter: {
        ui: uiState,
        articles: articlesState,
        categories: categoriesState,
    },
}

const store = mockStore(defaultState)

jest.mock('../../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

const wrapper = ({children}: {children?: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
)

type Props = {
    isOpen?: boolean
    canSave?: boolean
    helpCenter?: HelpCenter
}

const Example = ({
    isOpen = false,
    canSave = true,
    helpCenter = getSingleHelpCenterResponseFixture,
}: Props) => {
    const [open, setOpen] = React.useState(isOpen)

    return (
        <Provider store={store}>
            <button data-testid="toggle-btn" onClick={() => setOpen(true)}>
                Click me
            </button>
            <HelpCenterCategoryEdit
                isOpen={open}
                isLoading={false}
                canSave={canSave}
                helpCenter={helpCenter}
                onClose={() => setOpen(false)}
                onLocaleChange={jest.fn()}
                onDeleteTranslation={jest.fn()}
            />
        </Provider>
    )
}

describe('<HelpCenterCategoryEdit />', () => {
    it('renders in a hidden state by default', () => {
        const {getByTestId} = render(
            <HelpCenterCategoryEdit
                isOpen={false}
                isLoading={false}
                canSave
                helpCenter={getSingleHelpCenterResponseFixture}
                onClose={jest.fn()}
                onLocaleChange={jest.fn()}
                onDeleteTranslation={jest.fn()}
            />,
            {wrapper}
        )

        expect(getByTestId('category-edit').className).toEqual('drawer')
    })

    it('appears when isOpen is true', () => {
        const {getByTestId} = render(<Example isOpen />)

        expect(getByTestId('category-edit').className).toEqual('drawer opened')
    })

    it('focuses the Title input after drawer finish its transition', async () => {
        const {getByTestId} = render(<Example isOpen />)
        const titleInput = getByTestId('title-input')
        await waitFor(() => expect(document.activeElement).toEqual(titleInput))
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

        expect(getByTestId('slug-prefix').textContent).toEqual(
            `https://${getSingleHelpCenterResponseFixture.subdomain}${HELP_CENTER_DOMAIN}/en-US/articles/`
        )

        fireEvent.click(getByTestId('dropdown-select-trigger'))
        fireEvent.click(getByTestId('option-fr-FR'))

        expect(getByTestId('slug-prefix').textContent).toEqual(
            `https://${getSingleHelpCenterResponseFixture.subdomain}${HELP_CENTER_DOMAIN}/fr-FR/articles/`
        )
    })

    it("displays the custom domain's hostname in slug", () => {
        const {getByTestId} = render(
            <Example
                isOpen
                helpCenter={{
                    ...getSingleHelpCenterResponseFixture,
                    customDomain,
                }}
            />
        )

        expect(getByTestId('slug-prefix').textContent).toEqual(
            `https://${customDomain.hostname}/en-US/articles/`
        )
    })

    it('disables the Save button if title or slug are missing', () => {
        const {getByTestId} = render(<Example isOpen />)
        const button = getByTestId('button-save') as HTMLButtonElement

        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByTestId('title-input'), {
            target: {
                value: 'About us',
            },
        })

        expect(button.disabled).toBeFalsy()

        fireEvent.change(getByTestId('slug-input'), {
            target: {
                value: '',
            },
        })

        expect(button.disabled).toBeTruthy()
    })

    it('disables the Save button if canSave is false', () => {
        const {getByTestId} = render(<Example isOpen canSave={false} />)
        const button = getByTestId('button-save') as HTMLButtonElement

        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByTestId('title-input'), {
            target: {
                value: 'About us',
            },
        })

        expect(button.disabled).toBeTruthy()
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
