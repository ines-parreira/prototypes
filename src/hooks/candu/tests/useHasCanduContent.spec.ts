import { renderHook } from '@testing-library/react-hooks'

import useHasCanduContent from '../useHasCanduContent'

describe('useHasCanduContent', () => {
    it('should return false if Candu does not have content', () => {
        const { result } = renderHook(() => useHasCanduContent(''))

        expect(result.current.hasCanduContent).toBeFalsy()
    })

    it('should render true if Candu has content', () => {
        const id = 'navbar-dropdown'

        const canduNodes = new Map()
        const canduRoot = document.createElement('div')
        canduRoot.dataset.canduId = id
        const imgElement = document.createElement('img')
        imgElement.dataset.canduContentId = 'xxx'
        canduRoot.appendChild(imgElement)
        canduNodes.set(canduRoot, { shadowChild: canduRoot })
        window.Candu = {
            elementCanduRootMap: canduNodes,
            init: jest.fn(),
        }
        const { result } = renderHook(() => useHasCanduContent(id))

        expect(result.current.hasCanduContent).toBeTruthy()
    })

    it('should return false if Candu has only injected the root', () => {
        const id = 'navbar-dropdown'

        const canduNodes = new Map()
        const canduRoot = document.createElement('div')
        canduRoot.dataset.canduId = id
        canduNodes.set(canduRoot, { shadowChild: canduRoot })
        window.Candu = {
            elementCanduRootMap: canduNodes,
            init: jest.fn(),
        }
        const { result } = renderHook(() => useHasCanduContent(id))

        expect(result.current.hasCanduContent).toBeFalsy()
    })
})
