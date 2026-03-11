import type { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { AppContextProvider } from '../AppContext'
import { useCollapsibleColumn } from '../common/hooks/useCollapsibleColumn'

jest.unmock('../AppContext')

const wrapper = ({ children }: { children: ReactNode }) => (
    <AppContextProvider>{children}</AppContextProvider>
)

describe('useCollapsibleColumn', () => {
    it('should return initial state values', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        expect(result.current.collapsibleColumnChildren).toBe(null)
        expect(result.current.isCollapsibleColumnOpen).toBe(false)
        expect(result.current.collapsibleColumnWidthConfig).toBeUndefined()
        expect(typeof result.current.setCollapsibleColumnChildren).toBe(
            'function',
        )
        expect(typeof result.current.setIsCollapsibleColumnOpen).toBe(
            'function',
        )
        expect(typeof result.current.setCollapsibleColumnWidthConfig).toBe(
            'function',
        )
    })

    it('should update collapsibleColumnChildren when setCollapsibleColumnChildren is called', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const testContent = <div>Test Content</div>
        act(() => {
            result.current.setCollapsibleColumnChildren(testContent)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(testContent)
    })

    it('should update isCollapsibleColumnOpen when setIsCollapsibleColumnOpen is called', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        expect(result.current.isCollapsibleColumnOpen).toBe(false)

        act(() => {
            result.current.setIsCollapsibleColumnOpen(true)
        })

        expect(result.current.isCollapsibleColumnOpen).toBe(true)

        act(() => {
            result.current.setIsCollapsibleColumnOpen(false)
        })

        expect(result.current.isCollapsibleColumnOpen).toBe(false)
    })

    it('should handle null children', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const testContent = <div>Initial Content</div>
        act(() => {
            result.current.setCollapsibleColumnChildren(testContent)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(testContent)

        act(() => {
            result.current.setCollapsibleColumnChildren(null)
        })

        expect(result.current.collapsibleColumnChildren).toBe(null)
    })

    it('should handle complex ReactNode children', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const complexContent = (
            <>
                <header>Header Section</header>
                <main>
                    <h1>Title</h1>
                    <p>Paragraph</p>
                </main>
                <footer>Footer Section</footer>
            </>
        )

        act(() => {
            result.current.setCollapsibleColumnChildren(complexContent)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(complexContent)
    })

    it('should maintain state across multiple updates', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const content1 = <div>Content 1</div>
        const content2 = <div>Content 2</div>
        const content3 = <div>Content 3</div>

        act(() => {
            result.current.setCollapsibleColumnChildren(content1)
            result.current.setIsCollapsibleColumnOpen(true)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(content1)
        expect(result.current.isCollapsibleColumnOpen).toBe(true)

        act(() => {
            result.current.setCollapsibleColumnChildren(content2)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(content2)
        expect(result.current.isCollapsibleColumnOpen).toBe(true)

        act(() => {
            result.current.setIsCollapsibleColumnOpen(false)
            result.current.setCollapsibleColumnChildren(content3)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(content3)
        expect(result.current.isCollapsibleColumnOpen).toBe(false)
    })

    it('should throw error when used outside of AppContextProvider', () => {
        const consoleError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        expect(() => {
            renderHook(() => useCollapsibleColumn())
        }).toThrow('useAppContext must be used within AppContextProvider')

        consoleError.mockRestore()
    })

    it('should share state between multiple hook instances within same provider', () => {
        let hookResults: any[] = []

        const MultiHookWrapper = ({ children }: { children: ReactNode }) => {
            const hook1 = useCollapsibleColumn()
            const hook2 = useCollapsibleColumn()
            hookResults = [hook1, hook2]
            return <>{children}</>
        }

        const WrapperWithProvider = ({ children }: { children: ReactNode }) => (
            <AppContextProvider>
                <MultiHookWrapper>{children}</MultiHookWrapper>
            </AppContextProvider>
        )

        renderHook(() => {}, { wrapper: WrapperWithProvider })

        const sharedContent = <div>Shared Content</div>
        act(() => {
            hookResults[0].setCollapsibleColumnChildren(sharedContent)
            hookResults[0].setIsCollapsibleColumnOpen(true)
        })

        expect(hookResults[0].collapsibleColumnChildren).toEqual(sharedContent)
        expect(hookResults[0].isCollapsibleColumnOpen).toBe(true)
        expect(hookResults[1].collapsibleColumnChildren).toEqual(sharedContent)
        expect(hookResults[1].isCollapsibleColumnOpen).toBe(true)
    })

    it('should handle string children', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const stringContent = 'Simple string content' as any
        act(() => {
            result.current.setCollapsibleColumnChildren(stringContent)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(stringContent)
    })

    it('should handle number children', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const numberContent = 42 as any
        act(() => {
            result.current.setCollapsibleColumnChildren(numberContent)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(numberContent)
    })

    it('should handle array of elements as children', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const arrayContent = [
            <div key="1">Item 1</div>,
            <div key="2">Item 2</div>,
            <div key="3">Item 3</div>,
        ]
        act(() => {
            result.current.setCollapsibleColumnChildren(arrayContent as any)
        })

        expect(result.current.collapsibleColumnChildren).toEqual(arrayContent)
    })

    it('should preserve function references across renders', () => {
        const { result, rerender } = renderHook(() => useCollapsibleColumn(), {
            wrapper,
        })

        const setChildrenRef = result.current.setCollapsibleColumnChildren
        const setOpenRef = result.current.setIsCollapsibleColumnOpen

        rerender()

        expect(result.current.setCollapsibleColumnChildren).toBe(setChildrenRef)
        expect(result.current.setIsCollapsibleColumnOpen).toBe(setOpenRef)
    })

    it('should return collapsibleColumnRef', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        expect(result.current.collapsibleColumnRef).toBeDefined()
        expect(result.current.collapsibleColumnRef).toHaveProperty('current')
        expect(result.current.collapsibleColumnRef.current).toBe(null)
    })

    it('should return warpToCollapsibleColumn function', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        expect(typeof result.current.warpToCollapsibleColumn).toBe('function')
    })

    it('should return null when warpToCollapsibleColumn is called without ref', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const testComponent = <div>Test Component</div>
        const portal = result.current.warpToCollapsibleColumn(testComponent)

        expect(portal).toBe(null)
    })

    it('should create portal when warpToCollapsibleColumn is called with ref', () => {
        const { result } = renderHook(() => useCollapsibleColumn(), { wrapper })

        const container = document.createElement('div')
        Object.defineProperty(result.current.collapsibleColumnRef, 'current', {
            value: container,
            writable: true,
        })

        const testComponent = <div>Portal Content</div>
        const portal = result.current.warpToCollapsibleColumn(testComponent)

        expect(portal).not.toBe(null)
    })

    it('should preserve warpToCollapsibleColumn function reference across renders', () => {
        const { result, rerender } = renderHook(() => useCollapsibleColumn(), {
            wrapper,
        })

        const warpToCollapsibleColumnRef =
            result.current.warpToCollapsibleColumn

        rerender()

        expect(result.current.warpToCollapsibleColumn).toBe(
            warpToCollapsibleColumnRef,
        )
    })

    it('should preserve collapsibleColumnRef reference across renders', () => {
        const { result, rerender } = renderHook(() => useCollapsibleColumn(), {
            wrapper,
        })

        const refObject = result.current.collapsibleColumnRef

        rerender()

        expect(result.current.collapsibleColumnRef).toBe(refObject)
    })

    describe('collapsibleColumnWidthConfig', () => {
        it('should update width config with all properties', () => {
            const { result } = renderHook(() => useCollapsibleColumn(), {
                wrapper,
            })

            act(() => {
                result.current.setCollapsibleColumnWidthConfig({
                    width: '400px',
                    maxWidth: '600px',
                    minWidth: '200px',
                })
            })

            expect(result.current.collapsibleColumnWidthConfig).toEqual({
                width: '400px',
                maxWidth: '600px',
                minWidth: '200px',
            })
        })

        it('should update width config with partial properties', () => {
            const { result } = renderHook(() => useCollapsibleColumn(), {
                wrapper,
            })

            act(() => {
                result.current.setCollapsibleColumnWidthConfig({
                    width: '300px',
                })
            })

            expect(result.current.collapsibleColumnWidthConfig).toEqual({
                width: '300px',
            })
        })

        it('should clear width config when set to undefined', () => {
            const { result } = renderHook(() => useCollapsibleColumn(), {
                wrapper,
            })

            act(() => {
                result.current.setCollapsibleColumnWidthConfig({
                    width: '400px',
                })
            })

            expect(result.current.collapsibleColumnWidthConfig).toBeDefined()

            act(() => {
                result.current.setCollapsibleColumnWidthConfig(undefined)
            })

            expect(result.current.collapsibleColumnWidthConfig).toBeUndefined()
        })

        it('should preserve setCollapsibleColumnWidthConfig reference across renders', () => {
            const { result, rerender } = renderHook(
                () => useCollapsibleColumn(),
                { wrapper },
            )

            const setWidthConfigRef =
                result.current.setCollapsibleColumnWidthConfig

            rerender()

            expect(result.current.setCollapsibleColumnWidthConfig).toBe(
                setWidthConfigRef,
            )
        })

        it('should share width config state between multiple hook instances within same provider', () => {
            let hookResults: any[] = []

            const MultiHookWrapper = ({
                children,
            }: {
                children: ReactNode
            }) => {
                const hook1 = useCollapsibleColumn()
                const hook2 = useCollapsibleColumn()
                hookResults = [hook1, hook2]
                return <>{children}</>
            }

            const WrapperWithProvider = ({
                children,
            }: {
                children: ReactNode
            }) => (
                <AppContextProvider>
                    <MultiHookWrapper>{children}</MultiHookWrapper>
                </AppContextProvider>
            )

            renderHook(() => {}, { wrapper: WrapperWithProvider })

            act(() => {
                hookResults[0].setCollapsibleColumnWidthConfig({
                    width: '500px',
                    maxWidth: '800px',
                })
            })

            expect(hookResults[0].collapsibleColumnWidthConfig).toEqual({
                width: '500px',
                maxWidth: '800px',
            })
            expect(hookResults[1].collapsibleColumnWidthConfig).toEqual({
                width: '500px',
                maxWidth: '800px',
            })
        })
    })
})
