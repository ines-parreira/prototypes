import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import {RuleItemActions} from 'pages/settings/rules/types'

import AddActionOrIfStatement from '../AddActionOrIfStatement'

describe('AddActionOrIfStatement component', () => {
    const commonProps = {
        rule: fromJS({}),
        actions: {} as RuleItemActions,
        parent: fromJS([]),
        depth: 1,
        title: 'THEN',
    }

    it('should render', () => {
        const {container} = render(<AddActionOrIfStatement {...commonProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a button to delete the block when it is allowed to delete itself', () => {
        const {container} = render(
            <AddActionOrIfStatement {...commonProps} removable />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with error', () => {
        const {container} = render(
            <AddActionOrIfStatement {...commonProps} empty />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
