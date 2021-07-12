import React, {ComponentProps} from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import ReactSelect from '../ReactSelect'

const minProps: ComponentProps<typeof ReactSelect> = {
    value: 'foo',
    options: ['foo', 'bar'],
    deprecatedOptions: [],
    hiddenOptions: [],
    onChange: jest.fn(),
    onSearchChange: jest.fn(),
}

describe('<ReactSelect/>', () => {
    it('should render with the correct options', () => {
        const {container} = render(<ReactSelect {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('Should trigger onChange when clicked', async () => {
        render(<ReactSelect {...minProps} />)
        fireEvent.click(screen.getByText('bar'))
        await waitFor(() => {
            expect(minProps.onChange).toHaveBeenCalledWith('bar')
        })
    })

    it('should filter hidden options', () => {
        const {container} = render(
            <ReactSelect {...minProps} hiddenOptions={['bar']} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render normally as deprecated option is not selected', () => {
        const {container} = render(
            <ReactSelect {...minProps} deprecatedOptions={['bar']} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should add warning for selected deprecated option', () => {
        const {container} = render(
            <ReactSelect {...minProps} deprecatedOptions={['foo']} />
        )
        expect(container).toMatchSnapshot()
    })
})
