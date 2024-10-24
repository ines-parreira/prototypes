import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'

import {getSingleHelpCenterResponseFixture} from '../../../fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'
import useCurrentHelpCenter from '../../../hooks/useCurrentHelpCenter'
import {useSupportedLocales} from '../../../providers/SupportedLocales'
import LanguageSelect from '../LanguageSelect'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            articles: articlesState,
            categories: categoriesState,
            helpCenters: {
                '1': getSingleHelpCenterResponseFixture,
            },
        },
    } as any,
    ui: {helpCenter: {...uiState, currentId: 1}} as any,
}
const store = mockStore(defaultState)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('../../../hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('../../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<LanguageSelect />', () => {
    const onChange = jest.fn()
    it('should render the component', () => {
        const {container} = render(
            <Provider store={store}>
                <LanguageSelect onChange={onChange} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call handleOnChangeLocale on language change', async () => {
        const {findByText} = render(
            <Provider store={store}>
                <LanguageSelect onChange={onChange} />
            </Provider>
        )

        const dropdownButton = await findByText(/English - USA/)

        dropdownButton.click()

        const selectButton = await findByText(/French/)

        selectButton.click()

        expect(onChange).toHaveBeenCalledTimes(2)
    })
})
