import React, {ComponentProps} from 'react'
import {act, render, screen} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'
import CardHeader from 'Infobar/features/Card/display/CardHeader'

import Card from '../Card'

const CARD_HEADER_TEST_ID = 'card-header'
jest.mock('Infobar/features/Card/display/CardHeader', () =>
    jest.fn(() => {
        return <span data-testid={CARD_HEADER_TEST_ID}>card header</span>
    })
)
const CardHeaderMock = assumeMock(CardHeader)

const AFTER_TITLE_TEXT = 'after title'
const BEFORE_CONTENT_TEXT = 'before content'
const AFTER_CONTENT_TEXT = 'after content'
const CUSTOM_ACTION_TEXT = 'custom actions'
const CHILDREN_TEXT = 'children'
const TITLE_WRAPPER_TEST_ID = 'title-wrapper'
const WRAPPER_TEST_ID = 'wrapper'

describe('Card', () => {
    const defaultProps: ComponentProps<typeof Card> = {
        extensions: {
            afterTitle: <div>{AFTER_TITLE_TEXT}</div>,
            beforeContent: <div>{BEFORE_CONTENT_TEXT}</div>,
            afterContent: <div>{AFTER_CONTENT_TEXT}</div>,
            renderTitleWrapper: jest.fn((children: React.ReactNode) => (
                <div data-testid={TITLE_WRAPPER_TEST_ID}>{children}</div>
            )),
            renderWrapper: jest.fn((children: React.ReactNode) => (
                <div data-testid={WRAPPER_TEST_ID}>{children}</div>
            )),
        },
        editionHiddenFields: [],
        customActions: <div>{CUSTOM_ACTION_TEXT}</div>,
        displayedTitle: 'displayed title',
        dynamicLink: 'http://www.foo.bar',
        cardData: {
            title: 'title',
            link: '',
            pictureUrl: '',
            color: '',
            displayCard: true,
            limit: 3,
            orderBy: '+id',
        },
        orderByOptions: [],
        shouldDisplayHeader: true,
        shouldDisplayContent: true,
        isEditionMode: true,
        onEditionStart: jest.fn(),
        onEditionStop: jest.fn(),
        onSubmit: jest.fn(),
        onDelete: jest.fn(),
        canDrop: true,
        isDraggable: true,
        isOpen: true,
        hasNoBorderTop: false,
        children: <div>children</div>,
    }

    describe('containers classes', () => {
        it('should add the "removeBorderTop" class if "hasNoBorderTop" is true', () => {
            render(<Card {...defaultProps} hasNoBorderTop={true} />)

            expect(document.querySelector('.widget-card')).toHaveClass(
                'removeBorderTop'
            )
        })

        it('should add the onlyContent class if "isEditionMode" is false and "cardData.displayCard" is false', () => {
            render(
                <Card
                    {...defaultProps}
                    isEditionMode={false}
                    cardData={{...defaultProps.cardData, displayCard: false}}
                />
            )
            const container = document.querySelector('.widget-card')

            expect(container).toHaveClass('onlyContent')
            expect(container?.firstChild).toHaveClass('onlyContent')
        })

        it('should add the "closed" class if "isOpen" is false and "isEditionMode" is false', () => {
            render(
                <Card {...defaultProps} isOpen={false} isEditionMode={false} />
            )

            expect(document.querySelector('.widget-card')).toHaveClass('closed')
        })

        it('should add the "can-drop" class if "isEditionMode" is true and "canDrop" is true', () => {
            render(
                <Card {...defaultProps} isEditionMode={true} canDrop={true} />
            )

            expect(document.querySelector('.widget-card')).toHaveClass(
                'can-drop'
            )
        })

        it('should add the "draggable" class if "isDraggable" is true', () => {
            render(<Card {...defaultProps} isDraggable={true} />)

            expect(document.querySelector('.widget-card')).toHaveClass(
                'draggable'
            )
        })

        it('should add the "hidden" class if "shouldDisplayContent" is false', () => {
            render(<Card {...defaultProps} shouldDisplayContent={false} />)

            expect(document.querySelector('.widget-card-content')).toHaveClass(
                'hidden'
            )
        })
    })

    describe('header section', () => {
        it('should not display the header if "shouldDisplayHeader" is false', () => {
            render(<Card {...defaultProps} shouldDisplayHeader={false} />)

            expect(screen.queryByTestId(CARD_HEADER_TEST_ID)).toBeNull()
            expect(screen.queryByText(AFTER_TITLE_TEXT)).toBeNull()
            expect(screen.queryByText(CUSTOM_ACTION_TEXT)).toBeNull()
        })

        it('should display the header if "shouldDisplayHeader" is true', () => {
            render(<Card {...defaultProps} />)

            expect(screen.getByTestId(CARD_HEADER_TEST_ID))
            expect(screen.getByText(AFTER_TITLE_TEXT))
            expect(screen.getByText(CUSTOM_ACTION_TEXT))
        })

        it('should pass the correct props to CardHeader', () => {
            render(<Card {...defaultProps} />)

            expect(getLastMockCall(CardHeaderMock)[0]).toEqual(
                expect.objectContaining({
                    displayedTitle: defaultProps.displayedTitle,
                    dynamicLink: defaultProps.dynamicLink,
                    cardData: defaultProps.cardData,
                    editionHiddenFields: defaultProps.editionHiddenFields,
                    orderByOptions: defaultProps.orderByOptions,
                    isEditionMode: defaultProps.isEditionMode,
                    onEditionStart: defaultProps.onEditionStart,
                    onEditionStop: defaultProps.onEditionStop,
                    onDelete: defaultProps.onDelete,
                    onSubmit: defaultProps.onSubmit,
                    renderTitleWrapper:
                        defaultProps.extensions.renderTitleWrapper,
                })
            )
        })

        it("should toggle isOpen prop when onToggleOpen is called on CardHeader's props", () => {
            render(<Card {...defaultProps} />)

            expect(getLastMockCall(CardHeaderMock)[0].isOpen).toBe(true)
            act(() => {
                getLastMockCall(CardHeaderMock)[0].onToggleOpen()
            })
            expect(getLastMockCall(CardHeaderMock)[0].isOpen).toBe(false)
        })

        it("should set isExpandable to false if it's in edition mode and displays header and content", () => {
            const {rerender} = render(
                <Card {...defaultProps} isEditionMode={false} />
            )
            expect(getLastMockCall(CardHeaderMock)[0].isExpandable).toBe(true)
            rerender(<Card {...defaultProps} />)
            expect(getLastMockCall(CardHeaderMock)[0].isExpandable).toBe(false)
        })
    })

    describe('extensions rendering', () => {
        it('should render extensions in the right order', () => {
            render(<Card {...defaultProps} />)

            const customActionsEl = screen.getByText(CUSTOM_ACTION_TEXT)
            const afterTitleEl = screen.getByText(AFTER_TITLE_TEXT)
            const beforeEl = screen.getByText(BEFORE_CONTENT_TEXT)
            const childrenEl = screen.getByText(CHILDREN_TEXT)
            const afterEl = screen.getByText(AFTER_CONTENT_TEXT)
            const wrapperEl = screen.getByTestId(WRAPPER_TEST_ID)

            const following = Node.DOCUMENT_POSITION_FOLLOWING
            const containing = Node.DOCUMENT_POSITION_CONTAINED_BY

            expect(customActionsEl.compareDocumentPosition(afterTitleEl)).toBe(
                following
            )
            expect(afterTitleEl.compareDocumentPosition(beforeEl)).toBe(
                following
            )
            expect(beforeEl.compareDocumentPosition(childrenEl)).toBe(following)
            expect(childrenEl.compareDocumentPosition(afterEl)).toBe(following)
            expect(wrapperEl.compareDocumentPosition(afterEl)).toBe(
                containing + following
            )
        })
    })
})
