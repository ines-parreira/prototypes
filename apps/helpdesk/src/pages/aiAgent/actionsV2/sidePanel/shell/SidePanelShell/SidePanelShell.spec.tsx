import { render, userEvent } from '@repo/testing'

import type { SidePanelRailItem } from './SidePanelShell'
import { SidePanelShell } from './SidePanelShell'

const railItems: SidePanelRailItem[] = [
    { id: 'library', iconName: 'book', label: 'Actions library' },
    { id: 'performance', iconName: 'chart-line', label: 'Performance' },
]

describe('SidePanelShell', () => {
    it('renders panel children when open', () => {
        const { getByText } = render(
            <SidePanelShell
                mode="library"
                isOpen
                onToggleOpen={() => {}}
                onModeChange={() => {}}
                railItems={railItems}
            >
                <div>Body</div>
            </SidePanelShell>,
        )
        expect(getByText('Body')).toBeInTheDocument()
    })

    it('hides panel children when collapsed but keeps the rail visible', () => {
        const { queryByText, getByRole } = render(
            <SidePanelShell
                mode="library"
                isOpen={false}
                onToggleOpen={() => {}}
                onModeChange={() => {}}
                railItems={railItems}
            >
                <div>Body</div>
            </SidePanelShell>,
        )
        expect(queryByText('Body')).not.toBeInTheDocument()
        expect(
            getByRole('button', { name: /expand panel/i }),
        ).toBeInTheDocument()
        expect(
            getByRole('button', { name: /actions library/i }),
        ).toBeInTheDocument()
    })

    it('toggles open state when the collapse button is clicked', async () => {
        const user = userEvent.setup()
        const onToggleOpen = jest.fn()
        const { getByRole } = render(
            <SidePanelShell
                mode="library"
                isOpen
                onToggleOpen={onToggleOpen}
                onModeChange={() => {}}
                railItems={railItems}
            >
                <div>Body</div>
            </SidePanelShell>,
        )
        await user.click(getByRole('button', { name: /collapse panel/i }))
        expect(onToggleOpen).toHaveBeenCalledTimes(1)
    })

    it('switches modes when a rail button is clicked', async () => {
        const user = userEvent.setup()
        const onModeChange = jest.fn()
        const { getByRole } = render(
            <SidePanelShell
                mode="library"
                isOpen
                onToggleOpen={() => {}}
                onModeChange={onModeChange}
                railItems={railItems}
            >
                <div>Body</div>
            </SidePanelShell>,
        )
        await user.click(getByRole('button', { name: /performance/i }))
        expect(onModeChange).toHaveBeenCalledWith('performance')
    })

    it('expands the panel when a rail mode is clicked while collapsed', async () => {
        const user = userEvent.setup()
        const onToggleOpen = jest.fn()
        const onModeChange = jest.fn()
        const { getByRole } = render(
            <SidePanelShell
                mode="library"
                isOpen={false}
                onToggleOpen={onToggleOpen}
                onModeChange={onModeChange}
                railItems={railItems}
            >
                <div>Body</div>
            </SidePanelShell>,
        )
        await user.click(getByRole('button', { name: /performance/i }))
        expect(onToggleOpen).toHaveBeenCalledTimes(1)
        expect(onModeChange).toHaveBeenCalledWith('performance')
    })
})
