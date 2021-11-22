import React from 'react'

import {fromJS} from 'immutable'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import Link from '../Link'

describe('<Link/>', () => {
    const props = {
        index: 2,
        targetId: 'somepath-2',
        link: {
            url:
                'httpbin.org/get?first_name={{first_name}}&last_name={{last_name}}',
            label: 'Query {{first_name}}',
        },
        source: fromJS({
            last_name: 'John',
            first_name: 'Doe',
        }),
        onRemove: jest.fn(),
        onSubmit: jest.fn(),
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render with template replaced with its according value', () => {
        const {container} = render(<Link {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with the editor', () => {
        const {container} = render(<Link {...props} isEditing />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should open Editor when editing a link and call onSubmit on click', async () => {
        render(<Link {...props} isEditing />)
        fireEvent.click(screen.getByText('settings'))
        await waitFor(() => {
            fireEvent.click(screen.getByRole('button', {name: 'Save'}))
            expect(props.onSubmit).toHaveBeenCalledWith(props.link, props.index)
        })
    })

    it('should call onRemove when removing a link', () => {
        render(<Link {...props} isEditing />)
        fireEvent.click(screen.getByText('close'))
        expect(props.onRemove).toHaveBeenCalledWith(props.index)
    })
})
