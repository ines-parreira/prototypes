import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import SelectStatsFilter from '../SelectStatsFilter'

describe('<SelectStatsFilter />', () => {
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

    it('should render a filter with items', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <SelectStatsFilter {...commonProps}>
                    {items.map((item) => (
                        <SelectStatsFilter.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </SelectStatsFilter>
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
