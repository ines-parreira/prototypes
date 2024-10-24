import {Tag} from '@gorgias/api-queries'
import {render} from '@testing-library/react'
import {List, Map, fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {act} from 'react-dom/test-utils'

import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import {TagDropdownMenu} from 'tags'
import {assumeMock} from 'utils/testing'

import TagDropdown from '../TagDropdown'

jest.mock('hooks/useConditionalShortcuts')
const useConditionalShortcutsMock = assumeMock(useConditionalShortcuts)

jest.mock(
    'tags/TagDropdownMenu',
    () =>
        ({filterBy, onClick}: ComponentProps<typeof TagDropdownMenu>) => (
            <div onClick={onClick}>
                {'filterBy test: angry ' +
                    filterBy?.({name: 'angry'} as Tag).toString()}
                {'filterBy test: pop ' +
                    filterBy?.({name: 'pop'} as Tag).toString()}
                TagDropdownMenuMock
            </div>
        )
)

describe('<TagDropdown />', () => {
    const props = {
        addTag: jest.fn(),
        shouldBindKeys: false,
        ticketTags: fromJS([
            {name: 'refund'},
            {name: 'angry'},
            {name: 'return'},
            {name: 'customer'},
        ]) as List<Map<any, any>>,
    }

    it('should open tag dropdown by using keyboard shortcut', () => {
        const {getByText} = render(<TagDropdown {...props} />)

        act(() => {
            useConditionalShortcutsMock.mock.calls[0][2].OPEN_TAGS.action?.(
                new Event('keydown')
            )
        })

        expect(getByText(/TagDropdownMenuMock/)).toBeInTheDocument()
    })

    it('should filter out tags already added to ticket', () => {
        const {getByText} = render(<TagDropdown {...props} />)

        getByText(/Add tags/).click()

        expect(getByText(/filterBy test: angry false/)).toBeInTheDocument()
        expect(getByText(/filterBy test: pop true/)).toBeInTheDocument()
    })
})
