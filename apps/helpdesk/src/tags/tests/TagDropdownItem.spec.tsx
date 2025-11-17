import type { ReactNode } from 'react'
import React from 'react'

import { render, screen } from '@testing-library/react'

import { tags } from 'fixtures/tag'

import TagDropdownItem from '../TagDropdownItem'

jest.mock('@gorgias/axiom', () => ({
    LegacyTooltip: ({ children }: { children: ReactNode }) => (
        <div>Tooltip{children}</div>
    ),
}))

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

    it('should display tooltip when text is overflowing', () => {
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

        render(<TagDropdownItem {...props} />)

        expect(screen.getByText(/Tooltip/)).toBeInTheDocument()
        expect(
            screen.getAllByText(new RegExp(props.item.name, 'i')),
        ).toHaveLength(2)
    })
})
