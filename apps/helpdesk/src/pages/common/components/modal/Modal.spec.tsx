import type { ReactNode } from 'react'

import { render } from '@testing-library/react'

import Modal from './Modal'

const focusTrapMock = jest.fn(
    ({
        children,
    }: {
        active: boolean
        children: ReactNode
        focusTrapOptions?: {
            returnFocusOnDeactivate?: boolean
            setReturnFocus?: (
                nodeFocusedBeforeActivation: HTMLElement | SVGElement,
            ) => false | HTMLElement | SVGElement
        }
    }) => <>{children}</>,
)

jest.mock('focus-trap-react', () => ({
    __esModule: true,
    default: (props: {
        active: boolean
        children: ReactNode
        focusTrapOptions?: {
            returnFocusOnDeactivate?: boolean
            setReturnFocus?: (
                nodeFocusedBeforeActivation: HTMLElement | SVGElement,
            ) => false | HTMLElement | SVGElement
        }
    }) => focusTrapMock(props),
}))

jest.mock('react-transition-group', () => ({
    CSSTransition: ({
        children,
        in: isOpen,
    }: {
        children: ReactNode
        in: boolean
    }) => (isOpen ? <>{children}</> : null),
}))

jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (node: ReactNode) => node,
}))

jest.mock('appNode', () => ({
    useAppNode: () => document.body,
}))

describe('<Modal />', () => {
    beforeEach(() => {
        focusTrapMock.mockClear()
    })

    it('restores focus on close by default', () => {
        render(
            <Modal isOpen onClose={jest.fn()} forceFocus>
                <div>Content</div>
            </Modal>,
        )

        expect(focusTrapMock).toHaveBeenCalledWith(
            expect.objectContaining({
                active: true,
                focusTrapOptions: {
                    returnFocusOnDeactivate: true,
                },
            }),
        )
    })

    it('can disable focus restoration on close', () => {
        render(
            <Modal
                isOpen
                onClose={jest.fn()}
                forceFocus
                restoreFocusOnClose={false}
            >
                <div>Content</div>
            </Modal>,
        )

        expect(focusTrapMock).toHaveBeenCalledWith(
            expect.objectContaining({
                active: true,
                focusTrapOptions: {
                    returnFocusOnDeactivate: false,
                },
            }),
        )
    })

    it('can override the return focus target when closing', () => {
        const getReturnFocusTarget = jest.fn<false, []>(() => false)

        render(
            <Modal
                isOpen
                onClose={jest.fn()}
                forceFocus
                getReturnFocusTarget={getReturnFocusTarget}
            >
                <div>Content</div>
            </Modal>,
        )

        expect(focusTrapMock).toHaveBeenCalledWith(
            expect.objectContaining({
                active: true,
                focusTrapOptions: expect.objectContaining({
                    setReturnFocus: expect.any(Function),
                }),
            }),
        )

        const setReturnFocus =
            focusTrapMock.mock.calls[0]?.[0].focusTrapOptions?.setReturnFocus

        expect(setReturnFocus?.(document.body)).toBe(false)
        expect(getReturnFocusTarget).toHaveBeenCalled()
    })
    it('falls back to the previously focused node when the return focus target is undefined', () => {
        const previouslyFocusedNode = document.createElement('button')
        const getReturnFocusTarget = jest.fn<
            HTMLElement | SVGElement | undefined,
            []
        >(() => undefined)

        render(
            <Modal
                isOpen
                onClose={jest.fn()}
                forceFocus
                getReturnFocusTarget={getReturnFocusTarget}
            >
                <div>Content</div>
            </Modal>,
        )

        const setReturnFocus =
            focusTrapMock.mock.calls[0]?.[0].focusTrapOptions?.setReturnFocus

        expect(setReturnFocus?.(previouslyFocusedNode)).toBe(
            previouslyFocusedNode,
        )
        expect(getReturnFocusTarget).toHaveBeenCalled()
    })
})
