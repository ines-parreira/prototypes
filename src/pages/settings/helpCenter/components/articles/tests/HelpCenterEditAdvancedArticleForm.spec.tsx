import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import HelpCenterEditAdvancedArticleForm from '../HelpCenterEditAdvancedArticleForm'
import {getTranslationResponseFixture} from '../../../fixtures/getTranslationResponse.fixture'

const mockedOnChange = jest.fn()

describe('<HelpCenterEditAdvancedArticleForm/>', () => {
    const translation = getTranslationResponseFixture
    const props = {
        articleId: 1,
        translation,
        subdomain: 'acme',
        onChange: mockedOnChange,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(
            <HelpCenterEditAdvancedArticleForm {...props} />
        )
        expect(container).toMatchSnapshot()
    })

    it('should trigger the onChange callback when updating form inputs', () => {
        const {getByRole} = render(
            <HelpCenterEditAdvancedArticleForm {...props} />
        )
        const slugInput = getByRole('textbox', {name: /slug/i})
        fireEvent.change(slugInput, {target: {value: 'newSlug'}})
        expect(mockedOnChange).toHaveBeenCalledWith({
            ...translation,
            slug: 'newSlug',
        })
    })
})
