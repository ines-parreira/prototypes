import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import _keyBy from 'lodash/keyBy'

import {Locale} from '../../../../../models/helpCenter/types'
import HelpCenterTable from '../HelpCenterTable'
import {getHelpCentersResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'

describe('<HelpCenterTable />', () => {
    const mockedOnClick = jest.fn()
    const mockedOnToggle = jest.fn()

    const props: ComponentProps<typeof HelpCenterTable> = {
        isLoading: false,
        list: getHelpCentersResponseFixture.data,
        locales: _keyBy<Locale>(getLocalesResponseFixture, 'code'),
        onClick: mockedOnClick,
        onToggle: mockedOnToggle,
    }

    beforeEach(() => {
        jest.clearAllMocks()
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
        const tableRow = getByRole('row', {name: /ACME Help Center 2/i})
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
