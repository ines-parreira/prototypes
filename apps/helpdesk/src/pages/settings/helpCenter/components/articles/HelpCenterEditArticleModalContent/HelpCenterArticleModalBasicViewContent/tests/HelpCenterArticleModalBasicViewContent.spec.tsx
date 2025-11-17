import HelpCenterEditModalFooter from 'pages/settings/helpCenter/components/articles/HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from 'pages/settings/helpCenter/components/articles/HelpCenterEditModalHeader'
import HelpCenterEditor from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/HelpCenterEditor'
import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { getInitialRootCategory } from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import type { ArticleMode } from 'pages/settings/helpCenter/types/articleMode'
import type { RootState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import HelpCenterArticleModalBasicViewContent from '../HelpCenterArticleModalBasicViewContent'

const mockUseScreenSize = jest.fn()
const mockUseAbilityChecker = jest.fn()
const mockUseEditionManager = jest.fn()
const mockUseCurrentHelpCenter = jest.fn()
const mockUseSupportedLocales = jest.fn()

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useScreenSize: () => mockUseScreenSize(),
    SCREEN_SIZE: { SMALL: 'small' },
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => mockUseAbilityChecker(),
}))

jest.mock('pages/settings/helpCenter/providers/EditionManagerContext', () => ({
    useEditionManager: () => mockUseEditionManager(),
}))

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter', () => ({
    __esModule: true,
    default: () => mockUseCurrentHelpCenter(),
}))

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockUseSupportedLocales(),
}))

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditModalFooter',
)

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditModalHeader',
)

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/HelpCenterEditor',
)

describe('HelpCenterArticleModalBasicViewContent', () => {
    const mockOnArticleLanguageSelect = jest.fn()
    const mockOnArticleModalClose = jest.fn()
    const mockOnArticleLanguageSelectActionClick = jest.fn()
    const mockOnArticleChange = jest.fn()
    const mockOnEditorReady = jest.fn()
    const mockOnChangesDiscard = jest.fn()
    const mockOnCopyLinkToClipboard = jest.fn()

    const mockArticleMode: ArticleMode = {
        mode: 'modified',
        onSave: jest.fn(),
        onDelete: jest.fn(),
    }

    const defaultProps = {
        onArticleLanguageSelect: mockOnArticleLanguageSelect,
        autoFocus: false,
        onArticleModalClose: mockOnArticleModalClose,
        onArticleLanguageSelectActionClick:
            mockOnArticleLanguageSelectActionClick,
        onArticleChange: mockOnArticleChange,
        onEditorReady: mockOnEditorReady,
        canSaveArticle: true,
        requiredFieldsArticle: [],
        articleMode: mockArticleMode,
        onChangesDiscard: mockOnChangesDiscard,
        onCopyLinkToClipboard: mockOnCopyLinkToClipboard,
    }

    const renderComponent = (
        isDraftAllowed?: boolean,
        isFullscreenAllowed?: boolean,
        isXSLayout?: boolean,
    ) => {
        const props = {
            ...defaultProps,
            ...(isDraftAllowed !== undefined && { isDraftAllowed }),
            ...(isFullscreenAllowed !== undefined && { isFullscreenAllowed }),
            ...(isXSLayout !== undefined && { isXSLayout }),
        }

        const initialState: Partial<RootState> = {
            entities: {
                helpCenter: {
                    categories: {
                        categoriesById: {
                            '0': getInitialRootCategory,
                        },
                    },
                },
            } as any,
        }

        return renderWithStoreAndQueryClientProvider(
            <HelpCenterArticleModalBasicViewContent {...props} />,
            initialState,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseScreenSize.mockReturnValue('large')
        mockUseAbilityChecker.mockReturnValue({
            isPassingRulesCheck: jest.fn().mockReturnValue(true),
        })
        mockUseEditionManager.mockReturnValue({
            setEditModal: jest.fn(),
            selectedArticle: getSingleArticleEnglish,
            setSelectedArticle: jest.fn(),
            isFullscreenEditModal: false,
            setIsFullscreenEditModal: jest.fn(),
            setIsEditorCodeViewActive: jest.fn(),
        })
        mockUseCurrentHelpCenter.mockReturnValue(
            getSingleHelpCenterResponseFixture,
        )
        mockUseSupportedLocales.mockReturnValue(getLocalesResponseFixture)
        ;(HelpCenterEditModalFooter as jest.Mock).mockReturnValue(
            <div data-testid="help-center-edit-modal-footer">Footer</div>,
        )
        ;(HelpCenterEditModalHeader as jest.Mock).mockReturnValue(
            <div data-testid="help-center-edit-modal-header">Header</div>,
        )
        ;(HelpCenterEditor as jest.Mock).mockReturnValue(
            <div data-testid="help-center-editor">Editor</div>,
        )
    })

    describe('when isDraftAllowed is true', () => {
        it('should pass isDraftAllowed as true to HelpCenterEditModalFooter', () => {
            renderComponent(true)

            expect(HelpCenterEditModalFooter).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDraftAllowed: true,
                }),
                {},
            )
        })
    })

    describe('when isDraftAllowed is false', () => {
        it('should pass isDraftAllowed as false to HelpCenterEditModalFooter', () => {
            renderComponent(false)

            expect(HelpCenterEditModalFooter).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDraftAllowed: false,
                }),
                {},
            )
        })
    })

    describe('when isDraftAllowed is undefined', () => {
        it('should pass isDraftAllowed as true to HelpCenterEditModalFooter (default value)', () => {
            renderComponent()

            expect(HelpCenterEditModalFooter).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDraftAllowed: true,
                }),
                {},
            )
        })
    })

    describe('when isFullscreenAllowed is true', () => {
        it('should pass onResize function to HelpCenterEditModalHeader when screen size is not small', () => {
            mockUseScreenSize.mockReturnValue('large')
            renderComponent(undefined, true)

            expect(HelpCenterEditModalHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    onResize: expect.any(Function),
                }),
                {},
            )
        })

        it('should pass undefined onResize to HelpCenterEditModalHeader when screen size is small', () => {
            mockUseScreenSize.mockReturnValue('small')
            renderComponent(undefined, true)

            expect(HelpCenterEditModalHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    onResize: undefined,
                }),
                {},
            )
        })
    })

    describe('when isFullscreenAllowed is false', () => {
        it('should pass undefined onResize to HelpCenterEditModalHeader regardless of screen size', () => {
            mockUseScreenSize.mockReturnValue('large')
            renderComponent(undefined, false)

            expect(HelpCenterEditModalHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    onResize: undefined,
                }),
                {},
            )
        })
    })

    describe('when isFullscreenAllowed is undefined', () => {
        it('should pass onResize function to HelpCenterEditModalHeader (default value true)', () => {
            mockUseScreenSize.mockReturnValue('large')
            renderComponent()

            expect(HelpCenterEditModalHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    onResize: expect.any(Function),
                }),
                {},
            )
        })
    })

    describe('XS Layout prop', () => {
        describe('when isXSLayout is true', () => {
            it('should pass useXSLayout as true to HelpCenterEditor', () => {
                renderComponent(undefined, undefined, true)

                expect(HelpCenterEditor).toHaveBeenCalledWith(
                    expect.objectContaining({
                        useXSLayout: true,
                    }),
                    {},
                )
            })
        })

        describe('when isXSLayout is false', () => {
            it('should pass useXSLayout as false to HelpCenterEditor', () => {
                renderComponent(undefined, undefined, false)

                expect(HelpCenterEditor).toHaveBeenCalledWith(
                    expect.objectContaining({
                        useXSLayout: false,
                    }),
                    {},
                )
            })
        })

        describe('when isXSLayout is undefined', () => {
            it('should pass useXSLayout as false to HelpCenterEditor (default value)', () => {
                renderComponent()

                expect(HelpCenterEditor).toHaveBeenCalledWith(
                    expect.objectContaining({
                        useXSLayout: false,
                    }),
                    {},
                )
            })
        })
    })
})
