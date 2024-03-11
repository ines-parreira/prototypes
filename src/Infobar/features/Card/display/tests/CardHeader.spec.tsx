import React, {ComponentProps} from 'react'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'
import CardEditForm from 'Infobar/features/Card/display/CardEditForm'

import CardHeader, {DELETE_BUTTON_TEXT, EDIT_BUTTON_TEXT} from '../CardHeader'

const CARD_HEADER_ICON_TEST_ID = 'card-header-icon'
jest.mock('Infobar/features/Card/display/CardHeaderIcon', () => ({
    CardHeaderIcon: jest.fn(() => {
        return (
            <span data-testid={CARD_HEADER_ICON_TEST_ID}>card header icon</span>
        )
    }),
}))

const CARD_EDIT_FORM_TEST_ID = 'card-edit-form'
jest.mock('Infobar/features/Card/display/CardEditForm', () =>
    jest.fn(() => {
        return <span data-testid={CARD_EDIT_FORM_TEST_ID}>field edit form</span>
    })
)
const CardEditFormMock = assumeMock(CardEditForm)

const TITLE_WRAPPER_TEST_ID = 'title-wrapper'

describe('Card', () => {
    const displayedTitle = 'displayed title'
    const defaultProps: ComponentProps<typeof CardHeader> = {
        isExpandable: true,
        renderTitleWrapper: jest.fn((children: React.ReactNode) => (
            <div data-testid={TITLE_WRAPPER_TEST_ID}>{children}</div>
        )),
        editionHiddenFields: [],
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
        isEditionMode: true,
        onEditionStart: jest.fn(),
        onEditionStop: jest.fn(),
        onSubmit: jest.fn(),
        onDelete: jest.fn(),
        isOpen: true,
        onToggleOpen: jest.fn(),
    }

    describe('Title display', () => {
        it('should display the title', () => {
            render(<CardHeader {...defaultProps} />)

            expect(screen.getByText(displayedTitle))
        })

        it("should display a titleWrapper if it's provided", () => {
            render(<CardHeader {...defaultProps} />)

            expect(screen.getByTestId(TITLE_WRAPPER_TEST_ID))
        })

        it('should display a dynamic link when provided if there is no title wrapper', () => {
            render(
                <CardHeader {...defaultProps} renderTitleWrapper={() => null} />
            )

            expect(
                screen.getByText(displayedTitle).closest('a')
            ).toHaveProperty('href', 'http://www.foo.bar/')
        })

        it('should display a color tile if there is a color and no pictureUrl and no title wrapper', () => {
            render(
                <CardHeader
                    {...defaultProps}
                    renderTitleWrapper={() => null}
                    cardData={{...defaultProps.cardData, color: 'red'}}
                />
            )

            expect(document.querySelector('.colorTile')).toBeDefined()
        })

        it("should display a CardHeaderIcon if there is a pictureUrl when there's no titleWrapper", () => {
            render(
                <CardHeader
                    {...defaultProps}
                    renderTitleWrapper={() => null}
                    cardData={{...defaultProps.cardData, pictureUrl: 'woah?'}}
                />
            )

            expect(screen.getByTestId(CARD_HEADER_ICON_TEST_ID))
        })
    })

    describe('Toggle display feature', () => {
        it('should display an icon which call `onToggleOpen` on click', () => {
            render(<CardHeader {...defaultProps} />)

            fireEvent.click(screen.getByText('expand_less'))
            expect(defaultProps.onToggleOpen).toHaveBeenCalledTimes(1)
        })

        it('should display an arrow pointing down when `isOpen` is false', () => {
            render(<CardHeader {...defaultProps} isOpen={false} />)

            expect(screen.getByText('expand_more'))
        })
    })

    describe('edition mode management', () => {
        it('should display a "Title" placeholder when no title is provided', () => {
            render(<CardHeader {...defaultProps} displayedTitle={''} />)

            expect(screen.getByText('Title'))
        })

        it('should display that card is hidden when displayCard is false', () => {
            render(
                <CardHeader
                    {...defaultProps}
                    cardData={{...defaultProps.cardData, displayCard: false}}
                />
            )

            expect(screen.getByText('Hidden card')).toBeInTheDocument()
        })

        it('should call `onEditionStart` and show tooltip edit on edit button click', async () => {
            render(<CardHeader {...defaultProps} />)

            fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

            await waitFor(() =>
                expect(
                    screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                ).toBeInTheDocument()
            )

            expect(defaultProps.onEditionStart).toHaveBeenCalledTimes(1)
        })

        it('should call `onDelete` on delete button click', () => {
            const {getByText} = render(<CardHeader {...defaultProps} />)

            fireEvent.click(getByText(DELETE_BUTTON_TEXT))

            expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
        })

        it('should pass data, orderByOptions and hiddenFields to the edition form', () => {
            const {getByText} = render(<CardHeader {...defaultProps} />)

            fireEvent.click(getByText(EDIT_BUTTON_TEXT))

            expect(CardEditFormMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    initialData: defaultProps.cardData,
                    orderByOptions: defaultProps.orderByOptions,
                    hiddenFields: defaultProps.editionHiddenFields,
                }),
                expect.anything()
            )
        })

        it('should hide edit form and call `onEditionStop` when calling `onCancel` from `CardEditForm`', async () => {
            render(<CardHeader {...defaultProps} />)

            fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

            act(() => getLastMockCall(CardEditFormMock)[0].onCancel())

            await waitFor(() =>
                expect(
                    screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                ).not.toBeInTheDocument()
            )
            expect(defaultProps.onEditionStop).toHaveBeenCalledTimes(1)
        })

        it('should hide edit form and call `onEditionStop` when clicking outside of the popover', async () => {
            const {container} = render(<CardHeader {...defaultProps} />)

            fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

            await waitFor(() =>
                expect(
                    screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                ).toBeInTheDocument()
            )

            fireEvent.click(container)

            await waitFor(() =>
                expect(
                    screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                ).not.toBeInTheDocument()
            )
            expect(defaultProps.onEditionStop).toHaveBeenCalledTimes(1)
        })

        it('should hide edit form, call `onSubmit` and `onEditionStop` when calling onSubmit from `CardEditForm`', async () => {
            render(<CardHeader {...defaultProps} />)

            fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

            act(() =>
                getLastMockCall(CardEditFormMock)[0].onSubmit(
                    defaultProps.cardData
                )
            )

            await waitFor(() =>
                expect(
                    screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                ).not.toBeInTheDocument()
            )

            expect(defaultProps.onSubmit).toHaveBeenNthCalledWith(
                1,
                defaultProps.cardData
            )
            expect(defaultProps.onEditionStop).toHaveBeenCalledTimes(1)
            expect(
                (defaultProps.onSubmit as jest.Mock).mock.invocationCallOrder[0]
            ).toBeLessThan(
                (defaultProps.onEditionStop as jest.Mock).mock
                    .invocationCallOrder[0]
            )
        })
    })
})
