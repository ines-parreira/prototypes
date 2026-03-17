import React from 'react'

import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { render } from '../../tests/render.utils'
import { ViewPanel } from '../ViewPanel'

vi.mock('@repo/layout', () => ({
    Panel: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

vi.mock('../ViewHeader', () => ({
    ViewHeader: () => <div>ViewHeader</div>,
}))

describe('ViewPanel', () => {
    it('renders', () => {
        render(<ViewPanel viewId={42} />)
        expect(screen.getByText('ViewHeader')).toBeInTheDocument()
    })
})
