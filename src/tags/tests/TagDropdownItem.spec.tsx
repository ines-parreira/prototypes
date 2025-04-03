import React from 'react'

import { render, screen } from '@testing-library/react'

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

        expect(screen.getByText(props.item.name)).toHaveStyle(
            `--tag-dot-color: ${customColor}`,
        )
    })
})
