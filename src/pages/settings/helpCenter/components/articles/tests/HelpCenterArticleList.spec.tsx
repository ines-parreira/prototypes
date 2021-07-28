import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import HelpCenterArticleList from '../HelpCenterArticleList'

import {createArticleFromDto} from '../../../../../../models/helpCenter/utils'

import {getArticlesResponseFixture} from '../../../fixtures/getArticlesResponse.fixture'

const mockedOnClick = jest.fn()
const mockedOnClickSettings = jest.fn()

describe('<HelpCenterArticleList/>', () => {
    const props = {
        label: 'Article list',
        list: getArticlesResponseFixture.data.map(createArticleFromDto),
        onClick: mockedOnClick,
        onClickSettings: mockedOnClickSettings,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the component', () => {
        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <HelpCenterArticleList {...props} />
            </DndProvider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should call onClick callback when click on the component', () => {
        const {getAllByRole} = render(
            <DndProvider backend={HTML5Backend}>
                <HelpCenterArticleList {...props} />
            </DndProvider>
        )

        const firstRow = getAllByRole('row', {
            name: /open article/i,
        })[0]
        fireEvent.click(firstRow)
        expect(mockedOnClick).toHaveBeenCalledWith({
            ...getArticlesResponseFixture.data[0],
            position: 0,
        })
    })

    it('should call onClickSettings callback when click on the gear button', () => {
        const {getAllByTestId} = render(
            <DndProvider backend={HTML5Backend}>
                <HelpCenterArticleList {...props} />
            </DndProvider>
        )

        const firstGearButton = getAllByTestId('articleSettings')[0]
        fireEvent.click(firstGearButton)

        expect(mockedOnClickSettings).toHaveBeenCalledWith('articleSettings', {
            ...getArticlesResponseFixture.data[0],
            position: 0,
        })
    })
})
