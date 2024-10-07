import React from 'react'
import {render, screen} from '@testing-library/react'

import Label from '../Label'

describe('<Label />', () => {
    const content = <input name="test" defaultValue="yeaboy" />
    it('should render correctly', () => {
        render(<Label label="My label">{content}</Label>)

        expect(screen.getByText(/My label/)).toBeInTheDocument()
        expect(screen.getByDisplayValue('yeaboy')).toBeInTheDocument()
        expect(screen.queryByText('*')).not.toBeInTheDocument()
    })

    it('should add a "*" when required', () => {
        render(
            <Label label="My label" isRequired>
                {content}
            </Label>
        )
        expect(screen.getByText('*'))
    })
})
