import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import HelpCenterArticleList from '../HelpCenterArticleList'
import {getArticlesResponseFixture} from '../../../fixtures/getArticlesResponse.fixture'

const mockedOnClick = jest.fn()
const mockedOnClickSettings = jest.fn()

describe('<HelpCenterArticleList/>', () => {
    const props = {
        label: 'Article list',
        list: getArticlesResponseFixture.data,
        onClick: mockedOnClick,
        onClickSettings: mockedOnClickSettings,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the component', () => {
        const {container} = render(<HelpCenterArticleList {...props} />)

        expect(container).toMatchSnapshot()
    })

    it('should call onClick callback when click on the component', () => {
        const {getAllByRole} = render(<HelpCenterArticleList {...props} />)

        const firstRow = getAllByRole('listitem', {
            name: /open article/i,
        })[0]
        fireEvent.click(firstRow)
        expect(mockedOnClick).toHaveBeenCalledWith(
            getArticlesResponseFixture.data[0]
        )
    })

    it('should call onClickSettings callback when click on the gear button', () => {
        const {getAllByRole} = render(<HelpCenterArticleList {...props} />)

        const firstGearButton = getAllByRole('button', {
            name: /open article settings/i,
        })[0]
        fireEvent.click(firstGearButton)
        expect(mockedOnClickSettings).toHaveBeenCalledWith(
            getArticlesResponseFixture.data[0]
        )
    })
})
