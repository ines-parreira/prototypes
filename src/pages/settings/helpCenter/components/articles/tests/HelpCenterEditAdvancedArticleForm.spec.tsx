import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import HelpCenterEditAdvancedArticleForm from '../HelpCenterEditAdvancedArticleForm'
import {getSingleArticleEnglish} from '../../../fixtures/getArticlesResponse.fixture'
import {RootState, StoreDispatch} from '../../../../../../state/types'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockedOnChange = jest.fn()

describe('<HelpCenterEditAdvancedArticleForm/>', () => {
    const defaultState: Partial<RootState> = {}

    const {translation} = getSingleArticleEnglish
    const props = {
        articleId: 1,
        translation,
        domain: 'acme.gorgias.rehab',
        onChange: mockedOnChange,
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
