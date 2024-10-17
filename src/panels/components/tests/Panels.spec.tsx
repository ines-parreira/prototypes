import {fireEvent, render} from '@testing-library/react'
import React, {MouseEvent as ReactMouseEvent, ReactNode} from 'react'

import {usePanels, useScreenSize} from '../../hooks'
import type {Config} from '../../types'
import Panel from '../Panel'
import Panels from '../Panels'

jest.mock('../../hooks', () => ({
    usePanels: jest.fn(),
    useScreenSize: jest.fn(),
}))
jest.mock(
    '../Handle',
    () =>
        ({onResizeStart}: {onResizeStart: (ev: ReactMouseEvent) => void}) => (
            <div onMouseDown={onResizeStart}>Handle</div>
        )
)
jest.mock(
    '../Panel',
    () =>
        ({children, width}: {children: ReactNode; width: number}) => (
            <div>
                <p>Panel width: {width}</p>
                {children}
            </div>
        )
)

const usePanelsMock = usePanels as jest.Mock
const useScreenSizeMock = useScreenSize as jest.Mock

describe('Panels', () => {
    const config: Config = [[200], [Infinity]]

    let resizeStartHandler1: jest.Mock
    let resizeStartHandler2: jest.Mock

    beforeEach(() => {
        jest.restoreAllMocks()

        resizeStartHandler1 = jest.fn()
        resizeStartHandler2 = jest.fn()

        usePanelsMock.mockReturnValue({
            panelWidths: [200, 800],
            resizeStartHandlers: [resizeStartHandler1],
        })
        useScreenSizeMock.mockReturnValue([1200, 1024])
    })

    it('should render a handle between each panel', () => {
        const {getByText} = render(
            <Panels config={config}>
                <Panel>
                    <p>Navigation</p>
                </Panel>
                <Panel>
                    <p>Panel one</p>
                </Panel>
            </Panels>
        )

        expect(getByText('Navigation')).toBeInTheDocument()
        expect(getByText('Handle')).toBeInTheDocument()
        expect(getByText('Panel one')).toBeInTheDocument()
    })

    it('should pass the width into each panel', () => {
        const {getByText} = render(
            <Panels config={config}>
                <Panel>
                    <p>Navigation</p>
                </Panel>
                <Panel>
                    <p>Panel one</p>
                </Panel>
            </Panels>
        )

        expect(getByText('Panel width: 200')).toBeInTheDocument()
        expect(getByText('Panel width: 800')).toBeInTheDocument()
    })

    it('should call the correct resize handler when a handler is mousedowned', () => {
        const {getByText} = render(
            <Panels config={config}>
                <Panel>
                    <p>Navigation</p>
                </Panel>
                <Panel>
                    <p>Panel one</p>
                </Panel>
            </Panels>
        )

        const handle = getByText('Handle')
        fireEvent.mouseDown(handle)

        expect(resizeStartHandler1).toHaveBeenCalledWith(expect.any(Object))
        expect(resizeStartHandler2).not.toHaveBeenCalled()
    })

    it('should call the correct resize handler when a handler is mousedowned', () => {
        usePanelsMock.mockReturnValue({
            panelWidths: [200, 400, 400],
            resizeStartHandlers: [resizeStartHandler1, resizeStartHandler2],
        })

        const {getAllByText} = render(
            <Panels config={config}>
                <Panel>
                    <p>Navigation</p>
                </Panel>
                <Panel>
                    <p>Panel one</p>
                </Panel>
                <Panel>
                    <p>Panel two</p>
                </Panel>
            </Panels>
        )

        const handles = getAllByText('Handle')
        expect(handles.length).toBe(2)
        const handle = handles[1]
        fireEvent.mouseDown(handle)

        expect(resizeStartHandler1).not.toHaveBeenCalled()
        expect(resizeStartHandler2).toHaveBeenCalledWith(expect.any(Object))
    })

    it('should call the onResize handler when the panel widths change', () => {
        const onResize = jest.fn()
        usePanelsMock.mockReturnValue({
            panelWidths: [200, 400],
            resizeStartHandlers: [resizeStartHandler1, resizeStartHandler2],
        })

        const {rerender} = render(
            <Panels config={config} onResize={onResize}>
                <Panel>
                    <p>Navigation</p>
                </Panel>
                <Panel>
                    <p>Panel one</p>
                </Panel>
            </Panels>
        )

        usePanelsMock.mockReturnValue({
            panelWidths: [300, 400],
            resizeStartHandlers: [resizeStartHandler1, resizeStartHandler2],
        })

        rerender(
            <Panels config={config} onResize={onResize}>
                <Panel>
                    <p>Navigation</p>
                </Panel>
                <Panel>
                    <p>Panel one</p>
                </Panel>
            </Panels>
        )

        expect(onResize).toHaveBeenCalledWith([300, 400])
    })
})
