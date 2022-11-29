import React from 'react'
import {render} from '@testing-library/react'
import Status, {StatusIntent} from '../Status'

describe('Status', () => {
    it('should render dot and label', () => {
        const {container} = render(
            <Status intent={StatusIntent.Neutral} label={'Unknown'} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
