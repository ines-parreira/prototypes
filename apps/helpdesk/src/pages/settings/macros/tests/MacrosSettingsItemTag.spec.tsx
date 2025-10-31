import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { MacrosSettingsItemTag } from '../MacrosSettingsItemTag'

jest.mock('@gorgias/axiom', () => {
    return {
        ...jest.requireActual('@gorgias/axiom'),
        LegacyTooltip: ({ children }: ComponentProps<typeof Tooltip>) => (
            <div>{children}</div>
        ),
    } as Record<string, unknown>
})

describe('<MacrosSettingsItemTag />', () => {
    const props = {
        id: 'pop',
    }

    it('should display fallback when there are no tags', () => {
        const { container } = render(<MacrosSettingsItemTag {...props} />)

        expect(container.innerHTML).toBe('-')
    })

    it('should display fallback when tags are empty', () => {
        const { container } = render(
            <MacrosSettingsItemTag {...props} tags={[]} />,
        )

        expect(container.innerHTML).toBe('-')
    })

    it('should display tags', () => {
        const tags = ['refund', 'urgent', 'cats']
        render(<MacrosSettingsItemTag {...props} tags={tags} />)

        expect(screen.getByText('refund')).toBeInTheDocument()
        expect(screen.getByText(tags.join(', '))).toBeInTheDocument()
        expect(screen.getByText('+2')).toBeInTheDocument()
    })
})
