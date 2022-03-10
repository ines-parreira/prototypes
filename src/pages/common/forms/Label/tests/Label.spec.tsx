import React from 'react'
import {render} from '@testing-library/react'

import Label from '../Label'

describe('<Label />', () => {
    it('should render a label', () => {
        const {container} = render(<Label>I am a label</Label>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a required label', () => {
        const {container} = render(<Label isRequired>I am a label</Label>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a disabled label', () => {
        const {container} = render(<Label isDisabled>I am a label</Label>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
