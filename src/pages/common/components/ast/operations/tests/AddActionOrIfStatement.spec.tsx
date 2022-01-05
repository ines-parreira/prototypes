import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {AddActionOrIfStatement} from '../AddActionOrIfStatement'
import {RuleItemActions} from '../../../../../settings/rules/types'

describe('AddActionOrIfStatement component', () => {
    const commonProps = {
        rule: fromJS({}),
        actions: {} as RuleItemActions,
        parent: fromJS([]),
        depth: 1,
        title: 'IF',
    }

    it('should render', () => {
        const component = shallow(<AddActionOrIfStatement {...commonProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render a button to delete the block when it is allowed to delete itself', () => {
        const component = shallow(
            <AddActionOrIfStatement {...commonProps} removable />
        )

        expect(component).toMatchSnapshot()
    })
})
