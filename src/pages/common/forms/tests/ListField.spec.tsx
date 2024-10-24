import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import React from 'react'

import ListField from '../ListField'

describe('ListField component', () => {
    it('should render with no items and an "add" button', () => {
        const {container} = render(
            <ListField onChange={_noop} items={fromJS([])} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with some items and an "add" button', () => {
        const {container} = render(
            <ListField onChange={_noop} items={fromJS(['foo', 'bar'])} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with the max number of items and no "add" button', () => {
        const {container} = render(
            <ListField
                onChange={_noop}
                items={fromJS(['foo', 'bar'])}
                maxItems={2}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
