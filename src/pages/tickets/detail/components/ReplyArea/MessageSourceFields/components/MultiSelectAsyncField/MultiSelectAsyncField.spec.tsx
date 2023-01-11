import React from 'react'
import {shallow} from 'enzyme'
import _debounce from 'lodash/debounce'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {ReceiverValue} from 'state/ticket/utils'
import {isEmail} from 'utils'

import MultiSelectAsyncField from './MultiSelectAsyncField'

jest.mock('lodash/debounce', () =>
    jest.fn((fn: (...args: any[]) => void) => fn)
)

describe('MultiSelectAsyncField component', () => {
    const minProps = {
        value: [],
        onChange: jest.fn(),
        loadOptions: jest.fn(),
        allowCreate: true,
        allowCreateConstraint: isEmail,
        placeholder: 'I am the placeholder',
        onOptionSelect: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('empty items', () => {
        const component = shallow(<MultiSelectAsyncField {...minProps} />)

        expect(component.children().first().find('div > div').length).toEqual(0)
    })

    it('multiple items correct amount', () => {
        const values = [
            {
                label: 'Michel',
                name: 'Michel',
                value: 'michel@gorgias.com',
            },
            {
                label: 'Lucien',
                name: 'Lucien',
                value: 'lucien@gorgias.com',
            },
        ]

        const component = shallow(
            <MultiSelectAsyncField {...minProps} value={values} />
        )

        expect(component.children().first().find('div > div').length).toEqual(2)
    })

    it('multiple items correct content', () => {
        const values = [
            {
                label: 'Michel',
                name: 'Michel',
                value: 'michel@gorgias.com',
            },
            {
                label: 'Lucien',
                name: 'Lucien',
                value: 'lucien@gorgias.com',
            },
        ]

        const component = shallow(
            <MultiSelectAsyncField {...minProps} value={values} />
        )

        component
            .children()
            .first()
            .find('div > div')
            .forEach((item, index) => {
                expect(item.find('span').first()).toHaveText(
                    values[index].label
                )
            })
    })

    it('search for recipients on change input', () => {
        const options = [
            {
                label: 'Michel',
                name: 'Michel',
                value: 'michel@gorgias.com',
            },
            {
                label: 'Lucien',
                name: 'Lucien',
                value: 'lucien@gorgias.com',
            },
        ]

        const loadOptions = jest
            .fn()
            .mockImplementation(
                (_, callback: (options: ReceiverValue[]) => void) => {
                    callback(options)
                }
            )

        const component = shallow(
            <MultiSelectAsyncField {...minProps} loadOptions={loadOptions} />
        )

        component
            .children()
            .first()
            .find('div > input')
            .simulate('change', {target: {value: 'Something'}})
        expect(loadOptions).toBeCalled()
        expect(component.state('options')).toEqual(options)
    })

    it('add recipients on change input with multiple addresses', () => {
        const onChange = jest.fn()
        const value = [
            {
                label: 'Existing',
                name: 'Existing',
                value: 'existing@gorgias.io',
            },
        ]

        const component = shallow(
            <MultiSelectAsyncField
                {...minProps}
                value={value}
                onChange={onChange}
            />
        )

        component
            .children()
            .first()
            .find('div > input')
            .simulate('change', {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                target: {
                    value: 'alex@gorgias.io, Romain <romain@gorgias.io>, wrongaddress',
                },
            })
        expect(onChange).toBeCalledWith([
            value[0],
            {value: 'alex@gorgias.io'},
            {value: 'romain@gorgias.io', name: 'Romain'},
        ])
    })

    it('should call onOptionSelect on option click', () => {
        const receiver: ReceiverValue = {
            name: 'john',
            label: 'john',
            value: 'john.doe@example.com',
        }
        minProps.loadOptions.mockImplementation(
            (value, cb: (receivers: ReceiverValue[]) => void) => cb([receiver])
        )
        const component = shallow(<MultiSelectAsyncField {...minProps} />)

        component
            .children()
            .first()
            .find('div > input')
            .simulate('change', {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                target: {
                    value: 'john',
                },
            })
        component.find('.suggestion').simulate('click')

        expect(minProps.onOptionSelect).toHaveBeenLastCalledWith(receiver, 0)
    })

    it('should render a placeholder when opening the input', () => {
        const component = shallow(<MultiSelectAsyncField {...minProps} />)

        component.find('.input').simulate('focus')

        expect(component.find('.emptySuggestions').text()).toBe(
            'Type to search'
        )
    })

    it('should display a loading skeleton when searching', () => {
        ;(
            _debounce as jest.MockedFunction<typeof _debounce>
        ).mockImplementationOnce((() => (fn: (...args: any[]) => void) => {
            setTimeout(fn)
        }) as any)
        const component = shallow(<MultiSelectAsyncField {...minProps} />)

        component.find('.input').simulate('focus')
        component.find('.input').simulate('change', {
            target: {
                value: 'john',
            },
        })

        expect(component.find(Skeleton).props().count).toBe(3)
    })

    it('should render no results when the query returns no result', (done) => {
        minProps.loadOptions.mockImplementation(
            (value, cb: (receivers: ReceiverValue[]) => void) => cb([])
        )
        const component = shallow(<MultiSelectAsyncField {...minProps} />)

        component
            .find('.input')
            .simulate('change', {target: {value: 'Something'}})

        setImmediate(() => {
            expect(component.find('.emptySuggestions').text()).toBe(
                'No results'
            )
            done()
        })
    })
})
