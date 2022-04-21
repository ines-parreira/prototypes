import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'

import SelectFilter from '../SelectFilter'

describe('<SelectFilter />', () => {
    const commonProps = {
        value: [],
        onChange: jest.fn(),
    }

    const items = [
        {label: 'Api', value: '1', type: 'api'},
        {label: 'Chat', value: '2', type: 'chat'},
        {label: 'Email', value: '3', type: 'email'},
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component without any item', () => {
        const {container} = render(<SelectFilter {...commonProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with selectable items', () => {
        const {container} = render(
            <SelectFilter {...commonProps}>
                {items.map((item) => (
                    <SelectFilter.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                    />
                ))}
            </SelectFilter>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the component with quick selection option if multiple selection is disabled', () => {
        const {container} = render(
            <SelectFilter {...commonProps} isMultiple={false}>
                {items.map((item) => (
                    <SelectFilter.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                    />
                ))}
            </SelectFilter>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with items having icons', () => {
        const {container} = render(
            <SelectFilter {...commonProps}>
                {items.map((item) => (
                    <SelectFilter.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                        icon={item.type}
                    />
                ))}
            </SelectFilter>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with selected items', () => {
        const {container} = render(
            <SelectFilter {...commonProps} value={['1', '2']}>
                {items.map((item) => (
                    <SelectFilter.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                    />
                ))}
            </SelectFilter>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should deselect the item because selection is not required', () => {
        const {getByText} = render(
            <SelectFilter {...commonProps} isRequired={false} value={['1']}>
                {items.map((item) => (
                    <SelectFilter.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                    />
                ))}
            </SelectFilter>
        )

        const newOption = getByText(items[0].label)
        userEvent.click(newOption)
        expect(newOption).not.toHaveProperty('checked')

        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, [])
    })

    it('should not deselect the item because selection is required', () => {
        const {getByLabelText} = render(
            <SelectFilter {...commonProps} value={['1']} isRequired>
                {items.map((item) => (
                    <SelectFilter.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                    />
                ))}
            </SelectFilter>
        )

        const selectedItem = getByLabelText(items[0].label)
        userEvent.click(selectedItem)
        expect(selectedItem).toHaveProperty('checked')

        expect(commonProps.onChange).not.toHaveBeenCalled()
    })

    it('should select all items', () => {
        const {getByText} = render(
            <SelectFilter {...commonProps}>
                {items.map((item) => (
                    <SelectFilter.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                    />
                ))}
            </SelectFilter>
        )

        userEvent.click(getByText(/Select all/i))

        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, [
            items[0].value,
            items[1].value,
            items[2].value,
        ])
    })

    it('should select displayed items', () => {
        const {getByText} = render(
            <SelectFilter {...commonProps}>
                <InfiniteScroll onLoad={jest.fn()} shouldLoadMore={true}>
                    {items.map((item) => (
                        <SelectFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </InfiniteScroll>
            </SelectFilter>
        )

        userEvent.click(getByText(/Select all/i))

        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, [
            items[0].value,
            items[1].value,
            items[2].value,
        ])
    })

    it('should deselect all items', () => {
        const {getByText} = render(
            <SelectFilter {...commonProps} value={['1', '2']}>
                {items.map((item) => (
                    <SelectFilter.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                    />
                ))}
            </SelectFilter>
        )

        userEvent.click(getByText(/Deselect all/i))
        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, [])
    })

    describe('with groups', () => {
        const groups = [
            {label: 'Group 1', value: '1', items: ['1', '2']},
            {label: 'Group 2', value: '2', items: ['3', '2']},
            {label: 'Group 3', value: '3', items: []},
        ]

        const children = [
            ...items.map((item) => (
                <SelectFilter.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                />
            )),
            ...groups.map((group) => (
                <SelectFilter.Group
                    key={`group-${group.value}`}
                    items={group.items}
                    label={group.label}
                    value={group.value}
                />
            )),
        ]

        it('should render the component with groups', () => {
            const {container} = render(
                <SelectFilter {...commonProps}>{children}</SelectFilter>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should return expected values on new selected group', () => {
            const {getByLabelText} = render(
                <SelectFilter {...commonProps}>{children}</SelectFilter>
            )

            const newGroup = getByLabelText(groups[0].label)
            userEvent.click(newGroup)
            expect(newGroup).toHaveProperty('checked')

            expect(commonProps.onChange).toHaveBeenNthCalledWith(1, ['1', '2'])
        })

        it('should return expected values on deselected group', () => {
            const {getByLabelText} = render(
                <SelectFilter {...commonProps}>{children}</SelectFilter>
            )

            const group = getByLabelText(groups[0].label)

            userEvent.click(group)

            const group2 = getByLabelText(groups[0].label)

            userEvent.click(group2)
            expect(commonProps.onChange).toHaveBeenNthCalledWith(2, [])
        })

        it('should display selected group in an indeterminate state', () => {
            const {getByLabelText} = render(
                <SelectFilter {...commonProps} value={['1']}>
                    {children}
                </SelectFilter>
            )

            const indeterminateGroup = getByLabelText(groups[0].label)

            expect(indeterminateGroup).toHaveProperty('indeterminate')
        })

        it('should display expected label for partial data', () => {
            const {getByText} = render(
                <SelectFilter {...commonProps} isPartial>
                    {children}
                </SelectFilter>
            )

            expect(getByText(/Select displayed/i)).toBeTruthy()
        })
    })
})
