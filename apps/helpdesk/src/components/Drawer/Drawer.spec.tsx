import React from 'react'

import { render, screen } from '@testing-library/react'

import { Drawer } from './Drawer'

// Mock vaul drawer
jest.mock('vaul', () => ({
    Drawer: {
        Root: ({
            children,
            modal,
            noBodyStyles,
            disablePreventScroll,
            ...props
        }: any) => (
            <div
                data-testid="vaul-drawer-root"
                data-modal={modal}
                data-no-body-styles={noBodyStyles}
                data-disable-prevent-scroll={disablePreventScroll}
                {...props}
            >
                {children}
            </div>
        ),
        Trigger: ({ children, ...props }: any) => (
            <button data-testid="vaul-drawer-trigger" {...props}>
                {children}
            </button>
        ),
        Portal: ({ children, ...props }: any) => (
            <div data-testid="vaul-drawer-portal" {...props}>
                {children}
            </div>
        ),
        Overlay: ({ children, ...props }: any) => (
            <div data-testid="vaul-drawer-overlay" {...props}>
                {children}
            </div>
        ),
        Content: ({ children, ...props }: any) => (
            <div data-testid="vaul-drawer-content" {...props}>
                {children}
            </div>
        ),
        Close: ({ children, ...props }: any) => (
            <button data-testid="vaul-drawer-close" {...props}>
                {children}
            </button>
        ),
    },
}))

describe('<Drawer />', () => {
    beforeEach(() => {
        // Reset document.body.style.pointerEvents before each test
        document.body.style.pointerEvents = ''

        // Mock requestAnimationFrame
        const mockRequestAnimationFrame = jest.fn((callback) => {
            callback()
            return 1
        })
        Object.defineProperty(window, 'requestAnimationFrame', {
            value: mockRequestAnimationFrame,
            writable: true,
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('Drawer.Root', () => {
        it('should render with default props', () => {
            render(
                <Drawer.Root>
                    <div>Drawer content</div>
                </Drawer.Root>,
            )

            expect(screen.getByTestId('vaul-drawer-root')).toBeInTheDocument()
            expect(screen.getByText('Drawer content')).toBeInTheDocument()
        })

        it('should pass modal prop correctly', () => {
            render(
                <Drawer.Root modal={true}>
                    <div>Modal drawer</div>
                </Drawer.Root>,
            )

            const drawerRoot = screen.getByTestId('vaul-drawer-root')
            expect(drawerRoot).toHaveAttribute('data-modal', 'true')
        })

        it('should default modal to false', () => {
            render(
                <Drawer.Root>
                    <div>Non-modal drawer</div>
                </Drawer.Root>,
            )

            const drawerRoot = screen.getByTestId('vaul-drawer-root')
            expect(drawerRoot).toHaveAttribute('data-modal', 'false')
        })
    })

    describe('useEffect behavior for non-modal drawers', () => {
        it('should set pointerEvents to auto when non-modal drawer opens', () => {
            render(
                <Drawer.Root modal={false} open={true}>
                    <div>Non-modal drawer</div>
                </Drawer.Root>,
            )

            expect(window.requestAnimationFrame).toHaveBeenCalled()
            expect(document.body.style.pointerEvents).toBe('auto')
        })

        it('should not set pointerEvents when modal drawer opens', () => {
            render(
                <Drawer.Root modal={true} open={true}>
                    <div>Modal drawer</div>
                </Drawer.Root>,
            )

            expect(window.requestAnimationFrame).not.toHaveBeenCalled()
            expect(document.body.style.pointerEvents).toBe('')
        })

        it('should not set pointerEvents when non-modal drawer is closed', () => {
            render(
                <Drawer.Root modal={false} open={false}>
                    <div>Closed non-modal drawer</div>
                </Drawer.Root>,
            )

            expect(window.requestAnimationFrame).not.toHaveBeenCalled()
            expect(document.body.style.pointerEvents).toBe('')
        })

        it('should call requestAnimationFrame when non-modal drawer opens', () => {
            render(
                <Drawer.Root modal={false} open={true}>
                    <div>Non-modal drawer</div>
                </Drawer.Root>,
            )

            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
        })

        it('should update pointerEvents when open prop changes from false to true', () => {
            const { rerender } = render(
                <Drawer.Root modal={false} open={false}>
                    <div>Non-modal drawer</div>
                </Drawer.Root>,
            )

            expect(document.body.style.pointerEvents).toBe('')

            rerender(
                <Drawer.Root modal={false} open={true}>
                    <div>Non-modal drawer</div>
                </Drawer.Root>,
            )

            expect(document.body.style.pointerEvents).toBe('auto')
        })

        it('should not update pointerEvents when modal prop changes but open remains false', () => {
            const { rerender } = render(
                <Drawer.Root modal={true} open={false}>
                    <div>Modal drawer</div>
                </Drawer.Root>,
            )

            expect(document.body.style.pointerEvents).toBe('')

            rerender(
                <Drawer.Root modal={false} open={false}>
                    <div>Non-modal drawer</div>
                </Drawer.Root>,
            )

            expect(document.body.style.pointerEvents).toBe('')
        })
    })

    describe('Drawer composition', () => {
        it('should expose all Vaul drawer components', () => {
            expect(Drawer.Root).toBeDefined()
            expect(Drawer.Trigger).toBeDefined()
            expect(Drawer.Portal).toBeDefined()
            expect(Drawer.Overlay).toBeDefined()
            expect(Drawer.Content).toBeDefined()
            expect(Drawer.Close).toBeDefined()
        })

        it('should render a complete drawer with all components', () => {
            render(
                <Drawer.Root>
                    <Drawer.Trigger>Open Drawer</Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Overlay />
                        <Drawer.Content>
                            <div>Drawer content</div>
                            <Drawer.Close>Close</Drawer.Close>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>,
            )

            expect(screen.getByTestId('vaul-drawer-root')).toBeInTheDocument()
            expect(
                screen.getByTestId('vaul-drawer-trigger'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('vaul-drawer-portal')).toBeInTheDocument()
            expect(
                screen.getByTestId('vaul-drawer-overlay'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('vaul-drawer-content'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('vaul-drawer-close')).toBeInTheDocument()
            expect(screen.getByText('Open Drawer')).toBeInTheDocument()
            expect(screen.getByText('Drawer content')).toBeInTheDocument()
            expect(screen.getByText('Close')).toBeInTheDocument()
        })
    })

    describe('edge cases', () => {
        it('should handle undefined open prop gracefully', () => {
            render(
                <Drawer.Root modal={false}>
                    <div>Drawer without open prop</div>
                </Drawer.Root>,
            )

            expect(document.body.style.pointerEvents).toBe('')
        })

        it('should handle multiple re-renders correctly', () => {
            const { rerender } = render(
                <Drawer.Root modal={false} open={true}>
                    <div>Non-modal drawer</div>
                </Drawer.Root>,
            )

            expect(document.body.style.pointerEvents).toBe('auto')

            // Re-render with same props
            rerender(
                <Drawer.Root modal={false} open={true}>
                    <div>Non-modal drawer</div>
                </Drawer.Root>,
            )

            expect(document.body.style.pointerEvents).toBe('auto')
        })
    })

    describe('withPopovers prop behavior', () => {
        let addEventListenerSpy: jest.SpyInstance
        let removeEventListenerSpy: jest.SpyInstance

        beforeEach(() => {
            addEventListenerSpy = jest.spyOn(document, 'addEventListener')
            removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
        })

        afterEach(() => {
            addEventListenerSpy.mockRestore()
            removeEventListenerSpy.mockRestore()
        })

        it('should default withPopovers to false', () => {
            render(
                <Drawer.Root>
                    <div>Default drawer</div>
                </Drawer.Root>,
            )

            expect(addEventListenerSpy).not.toHaveBeenCalledWith(
                'focusin',
                expect.any(Function),
            )
            expect(addEventListenerSpy).not.toHaveBeenCalledWith(
                'focusout',
                expect.any(Function),
            )
        })

        it('should not add event listeners when withPopovers is false', () => {
            render(
                <Drawer.Root withPopovers={false}>
                    <div>Drawer without popovers</div>
                </Drawer.Root>,
            )

            expect(addEventListenerSpy).not.toHaveBeenCalledWith(
                'focusin',
                expect.any(Function),
            )
            expect(addEventListenerSpy).not.toHaveBeenCalledWith(
                'focusout',
                expect.any(Function),
            )
        })

        it('should add focusin and focusout event listeners when withPopovers is true', () => {
            render(
                <Drawer.Root withPopovers={true}>
                    <div>Drawer with popovers</div>
                </Drawer.Root>,
            )

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'focusin',
                expect.any(Function),
            )
            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'focusout',
                expect.any(Function),
            )
        })

        it('should call stopImmediatePropagation on focusin event', () => {
            render(
                <Drawer.Root withPopovers={true}>
                    <div>Drawer with popovers</div>
                </Drawer.Root>,
            )

            const focusinHandler = addEventListenerSpy.mock.calls.find(
                (call) => call[0] === 'focusin',
            )?.[1]

            expect(focusinHandler).toBeDefined()

            const mockEvent = {
                stopImmediatePropagation: jest.fn(),
            }

            focusinHandler(mockEvent)

            expect(mockEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1)
        })

        it('should call stopImmediatePropagation on focusout event', () => {
            render(
                <Drawer.Root withPopovers={true}>
                    <div>Drawer with popovers</div>
                </Drawer.Root>,
            )

            const focusoutHandler = addEventListenerSpy.mock.calls.find(
                (call) => call[0] === 'focusout',
            )?.[1]

            expect(focusoutHandler).toBeDefined()

            const mockEvent = {
                stopImmediatePropagation: jest.fn(),
            }

            focusoutHandler(mockEvent)

            expect(mockEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1)
        })

        it('should pass noBodyStyles and disablePreventScroll props correctly when withPopovers is true', () => {
            render(
                <Drawer.Root withPopovers={true}>
                    <div>Drawer with popovers</div>
                </Drawer.Root>,
            )

            const drawerRoot = screen.getByTestId('vaul-drawer-root')
            expect(drawerRoot).toHaveAttribute('data-no-body-styles', 'true')
            expect(drawerRoot).toHaveAttribute(
                'data-disable-prevent-scroll',
                'false',
            )
        })

        it('should pass noBodyStyles and disablePreventScroll props correctly when withPopovers is false', () => {
            render(
                <Drawer.Root withPopovers={false}>
                    <div>Drawer without popovers</div>
                </Drawer.Root>,
            )

            const drawerRoot = screen.getByTestId('vaul-drawer-root')
            expect(drawerRoot).not.toHaveAttribute('data-no-body-styles')
            expect(drawerRoot).not.toHaveAttribute(
                'data-disable-prevent-scroll',
            )
        })

        it('should handle withPopovers prop change from false to true', () => {
            const { rerender } = render(
                <Drawer.Root withPopovers={false}>
                    <div>Drawer</div>
                </Drawer.Root>,
            )

            expect(addEventListenerSpy).not.toHaveBeenCalledWith(
                'focusin',
                expect.any(Function),
            )

            rerender(
                <Drawer.Root withPopovers={true}>
                    <div>Drawer</div>
                </Drawer.Root>,
            )

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'focusin',
                expect.any(Function),
            )
            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'focusout',
                expect.any(Function),
            )
        })
    })
})
