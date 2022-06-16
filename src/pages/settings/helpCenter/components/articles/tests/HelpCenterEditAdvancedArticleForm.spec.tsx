import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import {DeepPartial} from 'redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as helpCenterState} from 'state/entities/helpCenter/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import HelpCenterEditAdvancedArticleForm from '../HelpCenterEditAdvancedArticleForm'
import {getSingleArticleEnglish} from '../../../fixtures/getArticlesResponse.fixture'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const mockedOnChange = jest.fn()
const mockedOnCategoryChange = jest.fn()

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

const mockedUseEditionManager = {
    selectedVisibility: 'PUBLIC',
    setSelectedVisibility: jest.fn(),
}

jest.mock('../../../providers/EditionManagerContext', () => {
    const module: Record<string, unknown> = jest.requireActual(
        '../../../providers/EditionManagerContext'
    )

    return {
        ...module,
        useEditionManager: () => mockedUseEditionManager,
    }
})

describe('<HelpCenterEditAdvancedArticleForm/>', () => {
    const {translation} = getSingleArticleEnglish
    const props = {
        articleId: 1,
        helpCenterId: 1,
        categoryId: 1,
        translation,
        domain: 'acme.gorgias.rehab',
        onChange: mockedOnChange,
        onCategoryChange: mockedOnCategoryChange,
    }

    const defaultState: DeepPartial<RootState> = {
        entities: {
            helpCenter: helpCenterState,
        },
        ui: {helpCenter: uiState},
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterEditAdvancedArticleForm {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should trigger the onChange callback when updating form inputs', () => {
        const {getByRole} = render(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterEditAdvancedArticleForm {...props} />
            </Provider>
        )
        const slugInput = getByRole('textbox', {name: /slug/i})
        fireEvent.change(slugInput, {target: {value: 'new slug'}})
        expect(mockedOnChange).toHaveBeenCalledWith({
            ...translation,
            slug: 'new-slug',
        })
    })
})
