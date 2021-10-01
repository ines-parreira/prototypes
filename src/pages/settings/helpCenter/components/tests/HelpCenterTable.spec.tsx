import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import _keyBy from 'lodash/keyBy'

import {HelpCenterLocale} from '../../../../../models/helpCenter/types'

import HelpCenterTable from '../HelpCenterTable'
import {getHelpcentersResponseFixture} from '../../fixtures/getHelpcenterResponse.fixture'
import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'

describe('<HelpCenterTable/>', () => {
    const mockedOnClick = jest.fn()
    const mockedOnToggle = jest.fn()

    const props = {
        isLoading: false,
        list: getHelpcentersResponseFixture,
        locales: _keyBy<HelpCenterLocale>(getLocalesResponseFixture, 'code'),
        onClick: mockedOnClick,
        onToggle: mockedOnToggle,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the table correctly when loading', () => {
        const {container} = render(
            <HelpCenterTable {...props} isLoading={true} />
        )
        expect(container).toMatchSnapshot()
    })

    it('should display the table correctly when not loading', () => {
        const {container} = render(<HelpCenterTable {...props} />)
        expect(container).toMatchSnapshot()
    })

    it('should call the onClick callback when clicking on a row', () => {
        const {getByRole} = render(<HelpCenterTable {...props} />)
        const tableRow = getByRole('row', {name: /ACME Helpcenter 2/i})
        fireEvent.click(tableRow)
        expect(mockedOnClick).toHaveBeenCalledWith(2)
    })

    it('should display a message when list is empty', () => {
        const {container} = render(
            <HelpCenterTable {...props} isLoading={false} list={[]} />
        )
        expect(container).toMatchSnapshot()
    })
})
