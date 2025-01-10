import {act, renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'

import type {ContextValue} from '../../Context'
import type {PanelConfig, PanelState} from '../../types'
import usePanel from '../usePanel'
import usePanels from '../usePanels'

jest.mock('../usePanels', () => jest.fn())
const usePanelsMock = assumeMock(usePanels)

describe('usePanel', () => {
    const config = {
        defaultSize: 200,
        minSize: 100,
        maxSize: 300,
    }

    let addPanel: jest.Mock

    beforeEach(() => {
        addPanel = jest.fn()
        usePanelsMock.mockReturnValue({addPanel} as unknown as ContextValue)
    })

    it('should return the default panel state', () => {
        const {result} = renderHook(() => usePanel('panel1', config))
        expect(result.current).toEqual({size: 0})
    })

    it('should return the updated panel state when the listener is called', () => {
        const {result} = renderHook(() => usePanel('panel1', config))
        expect(addPanel).toHaveBeenCalledWith(
            'panel1',
            config,
            expect.any(Function)
        )
        const [[, , listener]] = addPanel.mock.calls as [
            string,
            PanelConfig,
            (state: PanelState) => void,
        ][]
        act(() => {
            listener({size: 100, resizer: jest.fn()})
        })
        expect(result.current).toEqual({
            size: 100,
            resizer: expect.any(Function),
        })
    })
})
