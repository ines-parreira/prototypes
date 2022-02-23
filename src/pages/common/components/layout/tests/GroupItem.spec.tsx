import React from 'react'
import {render} from '@testing-library/react'

import * as errorsUtils from 'utils/errors'

import GroupItem from '../GroupItem'

jest.spyOn(errorsUtils, 'reportError')

describe('<GroupItem />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should pass the append position props to its child', () => {
        const {container} = render(
            <GroupItem appendPosition="left">
                {(appendPosition) => <div>{appendPosition}</div>}
            </GroupItem>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
