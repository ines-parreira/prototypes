import { fireEvent, render, screen } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { OptionItem } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'
import { setPendingDeleteLocaleOptionItem } from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

import { HelpCenterArticleDeleteModal } from '../HelpCenterArticleDeleteModal'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('pages/settings/helpCenter/hooks/useArticlesActions')

const mockDispatch = jest.fn()
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

describe('HelpCenterArticleDeleteModal', () => {
    const defaultProps = {
        selectedArticleId: 123,
        onDeleteConfirm: jest.fn(),
    }

    const mockOptionItem: OptionItem = {
        label: 'English',
        value: 'en-US',
        text: 'English Translation',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppDispatch.mockReturnValue(mockDispatch)
    })

    describe('when pendingDeleteLocaleOptionItem is undefined', () => {
        it('should return null and not render anything', () => {
            mockUseAppSelector.mockReturnValue(undefined)

            const { container } = render(
                <HelpCenterArticleDeleteModal {...defaultProps} />,
            )

            expect(container.firstChild).toBeNull()
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('when pendingDeleteLocaleOptionItem is provided', () => {
        beforeEach(() => {
            mockUseAppSelector.mockReturnValue(mockOptionItem)
        })

        it('should render the ConfirmationModal', () => {
            render(<HelpCenterArticleDeleteModal {...defaultProps} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('should display correct title with option label', () => {
            render(<HelpCenterArticleDeleteModal {...defaultProps} />)

            expect(
                screen.getByText(
                    /Are you sure you want to delete English for this article\?/,
                ),
            ).toBeInTheDocument()
        })

        it('should display correct warning message with option label', () => {
            render(<HelpCenterArticleDeleteModal {...defaultProps} />)

            expect(
                screen.getByText(
                    /You will lose all content saved and published of this language \(English\)/,
                ),
            ).toBeInTheDocument()
            expect(screen.getByText(/undo this action/)).toBeInTheDocument()
        })

        it('should display correct buttons', () => {
            render(<HelpCenterArticleDeleteModal {...defaultProps} />)

            expect(
                screen.getByRole('button', {
                    name: 'Delete English Translation',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
        })

        it('should dispatch setPendingDeleteLocaleOptionItem with undefined when cancel button is clicked', () => {
            render(<HelpCenterArticleDeleteModal {...defaultProps} />)

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            fireEvent.click(cancelButton)

            expect(mockDispatch).toHaveBeenCalledWith(
                setPendingDeleteLocaleOptionItem(undefined),
            )
        })

        describe('when confirm button is clicked', () => {
            it('should call deleteArticleTranslation with correct parameters', () => {
                render(<HelpCenterArticleDeleteModal {...defaultProps} />)

                const confirmButton = screen.getByRole('button', {
                    name: 'Delete English Translation',
                })
                fireEvent.click(confirmButton)

                expect(defaultProps.onDeleteConfirm).toHaveBeenCalledTimes(1)
                expect(defaultProps.onDeleteConfirm).toHaveBeenCalledWith(
                    123,
                    'en-US',
                )
            })

            it('should dispatch setPendingDeleteLocaleOptionItem with undefined after deletion', () => {
                render(<HelpCenterArticleDeleteModal {...defaultProps} />)

                const confirmButton = screen.getByRole('button', {
                    name: 'Delete English Translation',
                })
                fireEvent.click(confirmButton)

                expect(mockDispatch).toHaveBeenCalledWith(
                    setPendingDeleteLocaleOptionItem(undefined),
                )
            })

            it('should call onDeleteConfirm if provided', () => {
                render(<HelpCenterArticleDeleteModal {...defaultProps} />)

                const confirmButton = screen.getByRole('button', {
                    name: 'Delete English Translation',
                })
                fireEvent.click(confirmButton)

                expect(defaultProps.onDeleteConfirm).toHaveBeenCalledTimes(1)
            })

            it('should call actions in correct order: deleteArticleTranslation, then dispatch, then onDeleteConfirm', () => {
                const callOrder: string[] = []

                mockDispatch.mockImplementation(() => {
                    callOrder.push('dispatch')
                })

                defaultProps.onDeleteConfirm.mockImplementation(() => {
                    callOrder.push('onDeleteConfirm')
                })

                render(<HelpCenterArticleDeleteModal {...defaultProps} />)

                const confirmButton = screen.getByRole('button', {
                    name: 'Delete English Translation',
                })
                fireEvent.click(confirmButton)

                expect(callOrder).toEqual(['onDeleteConfirm', 'dispatch'])
            })
        })
    })
})
