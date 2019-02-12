import React from 'react'
import {shallow} from 'enzyme'

import ActionButtonsGroup from '../ActionButtonsGroup'

describe('ActionButtonsGroup component', () => {
    const baseAction = {
        options: [
            {value: 'option1', label: 'Option 1'}
        ],
        child: <div>Option 1</div>,
        title: <div>Option 1</div>
    }

    it('should render null if there\'s no actions', () => {
        const component = shallow(
            <ActionButtonsGroup
                actions={[]}
                payload={{}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render the dropdown if there 3 or less actions', () => {
        const component = shallow(
            <ActionButtonsGroup
                actions={[
                    {
                        key: 'action1',
                        ...baseAction
                    },
                    {
                        key: 'action2',
                        ...baseAction
                    },
                    {
                        key: 'action3',
                        ...baseAction
                    },
                ]}
                payload={{}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render the dropdown if there more than 3 actions', () => {
        const component = shallow(
            <ActionButtonsGroup
                actions={[
                    {
                        key: 'action1',
                        ...baseAction
                    },
                    {
                        key: 'action2',
                        ...baseAction
                    },
                    {
                        key: 'action3',
                        ...baseAction
                    },
                    {
                        key: 'action4',
                        ...baseAction
                    },
                ]}
                payload={{}}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
