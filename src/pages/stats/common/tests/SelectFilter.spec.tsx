import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {render, fireEvent, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'

import SelectFilter from '../SelectFilter'

jest.mock('state/ui/stats/actions', () => ({
    statFiltersClean: jest.fn(() => () => ({})),
    statFiltersDirty: jest.fn(() => () => ({})),
}))

describe('<SelectFilter />', () => {
    const mockStore = configureMockStore([thunk])

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
        const {container} = render(
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with selectable items', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps}>
                    {items.map((item) => (
                        <SelectFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </SelectFilter>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the component with quick selection option if multiple selection is disabled', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps} isMultiple={false}>
                    {items.map((item) => (
                        <SelectFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </SelectFilter>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with items having icons', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
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
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with selected items', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps} value={['1', '2']}>
                    {items.map((item) => (
                        <SelectFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </SelectFilter>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should deselect the item because selection is not required', () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps} isRequired={false} value={['1']}>
                    {items.map((item) => (
                        <SelectFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </SelectFilter>
            </Provider>
        )

        const newOption = getByText(items[0].label)
        userEvent.click(newOption)
        expect(newOption).not.toHaveProperty('checked')

        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, [])
    })

    it('should not deselect the item because selection is required', () => {
        const {getByLabelText} = render(
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps} value={['1']} isRequired>
                    {items.map((item) => (
                        <SelectFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </SelectFilter>
            </Provider>
        )

        const selectedItem = getByLabelText(items[0].label)
        userEvent.click(selectedItem)
        expect(selectedItem).toHaveProperty('checked')

        expect(commonProps.onChange).not.toHaveBeenCalled()
    })

    it('should select all items', () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps}>
                    {items.map((item) => (
                        <SelectFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </SelectFilter>
            </Provider>
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
            <Provider store={mockStore({})}>
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
            </Provider>
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
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps} value={['1', '2']}>
                    {items.map((item) => (
                        <SelectFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </SelectFilter>
            </Provider>
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
                <Provider store={mockStore({})}>
                    <SelectFilter {...commonProps}>{children}</SelectFilter>
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should return expected values on new selected group', () => {
            const {getByLabelText} = render(
                <Provider store={mockStore({})}>
                    <SelectFilter {...commonProps}>{children}</SelectFilter>
                </Provider>
            )

            const newGroup = getByLabelText(groups[0].label)
            userEvent.click(newGroup)
            expect(newGroup).toHaveProperty('checked')

            expect(commonProps.onChange).toHaveBeenNthCalledWith(1, ['1', '2'])
        })

        it('should return expected values on deselected group', () => {
            const {getByLabelText} = render(
                <Provider store={mockStore({})}>
                    <SelectFilter {...commonProps}>{children}</SelectFilter>
                </Provider>
            )

            const group = getByLabelText(groups[0].label)

            userEvent.click(group)

            const group2 = getByLabelText(groups[0].label)

            userEvent.click(group2)
            expect(commonProps.onChange).toHaveBeenNthCalledWith(2, [])
        })

        it('should display selected group in an indeterminate state', () => {
            const {getByLabelText} = render(
                <Provider store={mockStore({})}>
                    <SelectFilter {...commonProps} value={['1']}>
                        {children}
                    </SelectFilter>
                </Provider>
            )

            const indeterminateGroup = getByLabelText(groups[0].label)

            expect(indeterminateGroup).toHaveProperty('indeterminate')
        })

        it('should display expected label for partial data', () => {
            const {getByText} = render(
                <Provider store={mockStore({})}>
                    <SelectFilter {...commonProps} isPartial>
                        {children}
                    </SelectFilter>
                </Provider>
            )

            expect(getByText(/Select displayed/i)).toBeTruthy()
        })
    })

    it('should call statFiltersDirty and statFiltersClean when opening/closing the input', async () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <SelectFilter {...commonProps} />
            </Provider>
        )

        fireEvent.click(getByText('All items'))
        await waitFor(() => expect(statFiltersDirty).toHaveBeenCalled())
        fireEvent.click(getByText('All items'))
        await waitFor(() => expect(statFiltersClean).toHaveBeenCalled())
    })
})
