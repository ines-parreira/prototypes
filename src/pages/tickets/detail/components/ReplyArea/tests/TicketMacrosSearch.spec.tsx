import {render} from '@testing-library/react'
import React from 'react'

import TicketMacrosSearch from '../TicketMacrosSearch'

jest.mock('pages/common/components/MacroFilters/MacroFilters', () => () => (
    <div>MacroFilters</div>
))
jest.mock(
    'pages/tickets/common/macros/components/OnbordingMacroPopover',
    () => () => <div>OnbordingMacroPopover</div>
)

describe('<TicketMacrosSearch />', () => {
    const minProps = {
        setFocus: jest.fn(),
        macrosVisible: false,
        showMacros: jest.fn(),
        handleSearchKeyDown: jest.fn(),
        filters: {},
        query: '',
        requireCustomerSelection: false,
        onChangeFilters: jest.fn(),
        onChangeQuery: jest.fn(),
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
