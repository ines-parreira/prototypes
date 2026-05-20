import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { clearViewsCount, setViewsCount } from '../../store/viewsCountStore'
import { ViewCountBadge } from '../ViewCountBadge'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

beforeEach(() => {
    clearViewsCount()
})

describe('ViewCountBadge', () => {
    it('renders nothing when there is no count for the view', () => {
        const { container } = render(<ViewCountBadge viewId={1} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders zero when count is zero', () => {
        setViewsCount({ 1: 0 })

        render(<ViewCountBadge viewId={1} />)

        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('renders the count when it exists', () => {
        setViewsCount({ 1: 42 })

        render(<ViewCountBadge viewId={1} />)

        expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders large counts in compact notation', () => {
        setViewsCount({ 1: 1500 })

        render(<ViewCountBadge viewId={1} />)

        expect(screen.getByText('1.5k')).toBeInTheDocument()
    })

    it('renders with purple color when active', () => {
        setViewsCount({ 1: 42 })

        render(<ViewCountBadge viewId={1} isActive />)

        expect(screen.getByText('42').closest('[data-color]')).toHaveAttribute(
            'data-color',
            'purple',
        )
    })
})
