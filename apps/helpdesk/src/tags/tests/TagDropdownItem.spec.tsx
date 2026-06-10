import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { tags } from 'fixtures/tag'

import TagDropdownItem from '../TagDropdownItem'

describe('<TagDropdownItem />', () => {
    const props = {
        item: {
            ...tags[0],
        },
    }

    it('should render', () => {
        render(<TagDropdownItem {...props} />)

        expect(screen.getByText(props.item.name)).toBeInTheDocument()
    })

    it('should render with provided color', () => {
        const customColor = '#123456'

        render(
            <TagDropdownItem
                item={{
                    ...props.item,
                    decoration: {
                        color: customColor,
                    },
                }}
            />,
        )

        expect(screen.getByText(props.item.name).parentElement).toHaveStyle(
            `--tag-dot-color: ${customColor}`,
        )
    })

    it('should display tooltip when text is overflowing', async () => {
        jest.spyOn(
            HTMLElement.prototype,
            'offsetWidth',
            'get',
        ).mockImplementation(() => 0)
        jest.spyOn(
            HTMLElement.prototype,
            'scrollWidth',
            'get',
        ).mockImplementation(() => 1)

        const user = userEvent.setup()
        render(<TagDropdownItem {...props} />)

        await user.hover(screen.getByText(props.item.name))

        const tooltip = await screen.findByRole('tooltip')
        expect(tooltip).toHaveTextContent(props.item.name)
        expect(
            screen.getAllByText(new RegExp(props.item.name, 'i')),
        ).toHaveLength(2)
    })
})
