import type { ReactNode } from 'react'
import React from 'react'

import { render } from '@repo/testing'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { drop } from 'state/widgets/actions'

import { isSortableEvent, ReactSortable } from '../ReactSortable'
import { DragWrapper } from '../WidgetsDragWrapper'

jest.mock('hooks/useAppDispatch')
jest.mock('state/widgets/actions', () => ({
    drop: jest.fn(),
    drag: jest.fn(),
    cancelDrag: jest.fn(),
    stopWidgetEdition: jest.fn(),
}))
jest.mock('../ReactSortable', () => ({
    __esModule: true,
    ReactSortable: jest.fn(),
    isSortableEvent: jest.fn(),
}))

const ReactSortableMock = ReactSortable as unknown as jest.Mock
const isSortableEventMock = isSortableEvent as unknown as jest.Mock
const mockDispatch = jest.fn()
const mockDropResult = { type: 'DROP' }

function makeEl(dataKey: string): HTMLElement {
    const el = document.createElement('div')
    el.dataset.key = dataKey
    return el
}

type EventOverrides = {
    type?: string
    itemKey?: string
    toChildren?: HTMLElement[]
    newIndex?: number
    oldIndex?: number
}

function makeEvent(overrides: EventOverrides = {}) {
    const {
        type = 'update',
        itemKey = '2',
        toChildren = [makeEl('0'), makeEl('1'), makeEl('2'), makeEl('3')],
        newIndex = 1,
        oldIndex = 2,
    } = overrides

    const item = makeEl(itemKey)
    const to = document.createElement('div')
    toChildren.forEach((child) => to.appendChild(child))

    return { type, item, to, newIndex, oldIndex }
}

const defaultGroup = { name: 'root', pull: false as const, put: true }

describe('DragWrapper', () => {
    let capturedOnChange:
        | ((order: string[], sortable: unknown, evt: unknown) => void)
        | undefined

    beforeEach(() => {
        ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
        ;(drop as jest.Mock).mockReturnValue(mockDropResult)
        isSortableEventMock.mockReturnValue(true)

        ReactSortableMock.mockImplementation(
            ({
                children,
                onChange,
            }: {
                children: ReactNode
                onChange: typeof capturedOnChange
            }) => {
                capturedOnChange = onChange
                return <>{children}</>
            },
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
        capturedOnChange = undefined
    })

    it('renders children without ReactSortable when not editing', () => {
        const { getByText } = render(
            <DragWrapper group={defaultGroup} isEditing={false}>
                <span>child</span>
            </DragWrapper>,
        )

        expect(getByText('child')).toBeInTheDocument()
        expect(ReactSortableMock).not.toHaveBeenCalled()
    })

    describe('when watchDrop is false', () => {
        it('does not dispatch drop on sortable events', () => {
            render(
                <DragWrapper group={defaultGroup} isEditing watchDrop={false}>
                    <div />
                </DragWrapper>,
            )

            capturedOnChange!([], undefined, makeEvent())

            expect(drop).not.toHaveBeenCalled()
        })
    })

    describe('when watchDrop is true', () => {
        const renderWrapper = (templatePath = '') =>
            render(
                <DragWrapper
                    group={defaultGroup}
                    isEditing
                    watchDrop
                    templatePath={templatePath}
                >
                    <div />
                </DragWrapper>,
            )

        it('dispatches drop with toIndex from data-key of element at newIndex', () => {
            renderWrapper('1.template')

            capturedOnChange!(
                [],
                undefined,
                makeEvent({
                    type: 'update',
                    itemKey: '0',
                    toChildren: [makeEl('0'), makeEl('1'), makeEl('2')],
                    newIndex: 2,
                    oldIndex: 0,
                }),
            )

            expect(drop).toHaveBeenCalledWith('update', '1.template', '0', 2, 0)
            expect(mockDispatch).toHaveBeenCalledWith(mockDropResult)
        })

        it('dispatches drop for add events', () => {
            renderWrapper()

            capturedOnChange!(
                [],
                undefined,
                makeEvent({
                    type: 'add',
                    itemKey: '5',
                    newIndex: 1,
                    oldIndex: 0,
                }),
            )

            expect(drop).toHaveBeenCalledWith('add', '', '5', 1, 0)
        })

        it('does not dispatch drop for non-add/update event types', () => {
            renderWrapper()

            capturedOnChange!([], undefined, makeEvent({ type: 'remove' }))

            expect(drop).not.toHaveBeenCalled()
        })

        it('falls back to evt.newIndex when children[newIndex] has no data-key', () => {
            renderWrapper()

            // children[newIndex] exists but carries no dataset.key → rawToKeyStr is
            // undefined, toKeyStr is undefined, toIndex falls back to evt.newIndex.
            const noKeyEl = document.createElement('div')
            capturedOnChange!(
                [],
                undefined,
                makeEvent({
                    itemKey: '0',
                    toChildren: [makeEl('1'), noKeyEl, makeEl('3')],
                    newIndex: 1,
                    oldIndex: 0,
                }),
            )

            expect(drop).toHaveBeenCalledWith('update', '', '0', 1, 0)
        })

        describe('drag-up-by-1 toIndex fix', () => {
            it('reads children[newIndex+1] when children[newIndex] is the dragged item', () => {
                renderWrapper()

                // ReactSortable revert bug: after dragging item key="2" up by 1,
                // the broken revert leaves it at newIndex=1 instead of oldIndex=2,
                // so children[1].dataset.key === itemKey. Fix reads children[2] → toIndex=1.
                capturedOnChange!(
                    [],
                    undefined,
                    makeEvent({
                        itemKey: '2',
                        toChildren: [
                            makeEl('0'),
                            makeEl('2'),
                            makeEl('1'),
                            makeEl('3'),
                        ],
                        newIndex: 1,
                        oldIndex: 2,
                    }),
                )

                expect(drop).toHaveBeenCalledWith('update', '', '2', 1, 2)
            })

            it('falls back to evt.newIndex when the dragged item is last with no next sibling', () => {
                renderWrapper()

                // Bug at end of list: children[newIndex] is dragged item,
                // children[newIndex+1] is undefined → toIndex falls back to evt.newIndex.
                capturedOnChange!(
                    [],
                    undefined,
                    makeEvent({
                        itemKey: '3',
                        toChildren: [
                            makeEl('0'),
                            makeEl('1'),
                            makeEl('2'),
                            makeEl('3'),
                        ],
                        newIndex: 3,
                        oldIndex: 2,
                    }),
                )

                expect(drop).toHaveBeenCalledWith('update', '', '3', 3, 2)
            })
        })
    })
})
