import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Dropdown} from 'reactstrap'
import {fromJS, Map, List} from 'immutable'

import {getTicketViewField} from 'config/views'
import {ViewField} from 'models/view/types'

import FilterDropdownItems from '../FilterDropdownItems'

jest.mock('pages/common/utils/labels', () => ({
    RenderLabel: ({value}: {value: Map<any, any>}) => {
        return <span>{value.get('name')}</span>
    },
}))

describe('FilterDropdownItems', () => {
    const defaultItems = [{id: 1, name: 'Foo', email: 'foo@example.com'}]
    const minProps: ComponentProps<typeof FilterDropdownItems> = {
        field: getTicketViewField(ViewField.Customer),
        isLoading: false,
        items: fromJS(defaultItems),
        onItemClick: jest.fn(),
        onMeItemClick: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('it should render items', () => {
        const {container} = render(<FilterDropdownItems {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should render loader when loading', () => {
        const {container} = render(
            <FilterDropdownItems {...minProps} isLoading />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render null when items are not passed', () => {
        const {container} = render(
            <FilterDropdownItems {...minProps} items={null} />
        )
        expect(container.firstChild).toBe(null)
    })

    it('should render a message when items array is empty', () => {
        const {container} = render(
            <FilterDropdownItems {...minProps} items={fromJS([])} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onItemClick on item click', () => {
        const {getByText} = render(
            <Dropdown isOpen toggle={jest.fn()}>
                <FilterDropdownItems {...minProps} />
            </Dropdown>
        )

        fireEvent.click(getByText(defaultItems[0].name))

        expect(minProps.onItemClick).toHaveBeenLastCalledWith(defaultItems[0])
    })

    it('should call onItemClick on item click when passed items are a list of objects', () => {
        let items = fromJS([]) as List<any>
        items = items.push(defaultItems[0])
        const {getByText} = render(
            <Dropdown isOpen toggle={jest.fn()}>
                <FilterDropdownItems {...minProps} items={items} />
            </Dropdown>
        )

        fireEvent.click(getByText(defaultItems[0].name))

        expect(minProps.onItemClick).toHaveBeenLastCalledWith(defaultItems[0])
    })

    it('should render "me" item for assignee field', () => {
        const {container} = render(
            <FilterDropdownItems
                {...minProps}
                field={getTicketViewField(ViewField.Assignee)}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should call onMeItemClick on me item click', () => {
        const {getByText} = render(
            <Dropdown isOpen toggle={jest.fn()}>
                <FilterDropdownItems
                    {...minProps}
                    field={getTicketViewField(ViewField.Assignee)}
                />
            </Dropdown>
        )

        fireEvent.click(getByText('Me (current user)'))

        expect(minProps.onMeItemClick).toHaveBeenLastCalledWith()
    })
})
