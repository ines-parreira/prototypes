import React from 'react'
import {render} from '@testing-library/react'

import TicketMacrosSearch from '../TicketMacrosSearch'

jest.mock('pages/common/components/MacroFilters/MacroFilters', () => () => (
    <div>MacroFilters</div>
))

describe('<TicketMacrosSearch />', () => {
    const minProps = {
        setFocus: jest.fn(),
        searchParams: {},
        macrosVisible: false,
        searchMacros: jest.fn(),
        showMacros: jest.fn(),
        handleSearchKeyDown: jest.fn(),
        requireCustomerSelection: false,
        onClearMacro: jest.fn(),
    }
    it('should render TicketMacrosSearch unfocused', () => {
        const {container} = render(<TicketMacrosSearch {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render TicketMacrosSearch focused', () => {
        const {container} = render(
            <TicketMacrosSearch {...minProps} macrosVisible={true} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
