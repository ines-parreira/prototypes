import React from 'react'
import {render} from '@testing-library/react'
import CheckBoxFieldSet from '../CheckBoxFieldSet'

describe('<CheckBoxFieldSet/>', () => {
    it('should display the title, subtitle and checkboxes', () => {
        const checkboxes = [
            {
                name: 'comments',
                children: 'Comments',
            },
            {
                name: 'mentions',
                children: 'Mentions',
            },
        ]

        const {container} = render(
            <CheckBoxFieldSet
                checkboxes={checkboxes}
                title="Checkboxes"
                subtitle="Toggle checkboxes"
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
