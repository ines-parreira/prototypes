import type { ReactNode } from 'react'
import React from 'react'

import { render } from '@testing-library/react'

import { Panel, Panels } from 'panels'
import { LayoutKeys } from 'split-ticket-view/constants'

import type { PanelLayoutConfig } from '../PanelLayout'
import PanelLayout from '../PanelLayout'

jest.mock('panels', () => ({
    Panel: jest.fn(),
    Panels: jest.fn(),
}))
const PanelMock = Panel as jest.Mock
const PanelsMock = Panels as jest.Mock

describe('PanelLayout', () => {
    beforeEach(() => {
        PanelMock.mockReturnValue(<div>Panel</div>)
        PanelsMock.mockImplementation(
            ({ children }: { children: ReactNode }) => (
                <div>
                    <p>Panels</p>
                    {children}
                </div>
            ),
        )
    })

    it('should convert the given config', () => {
        const config: PanelLayoutConfig[] = [
            {
                key: 'navbar-panel',
                content: <p>Navbar</p>,
                panelConfig: [250, 200, 300],
            },
            {
                key: 'ticket-panel',
                content: <p>Ticket</p>,
                panelConfig: [Infinity, 400],
            },
        ]

        const { getByText } = render(
            <PanelLayout config={config} layoutKey={LayoutKeys.TICKET} />,
        )

        expect(PanelMock).toHaveBeenCalledWith(
            expect.objectContaining({
                children: <p>Navbar</p>,
            }),
            expect.anything(),
        )

        expect(PanelMock).toHaveBeenCalledWith(
            expect.objectContaining({
                children: <p>Ticket</p>,
            }),
            expect.anything(),
        )
        expect(PanelsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                config: [
                    [250, 200, 300],
                    [Infinity, 400],
                ],
            }),
            expect.anything(),
        )
        expect(getByText('Panels')).toBeInTheDocument()
    })
})
