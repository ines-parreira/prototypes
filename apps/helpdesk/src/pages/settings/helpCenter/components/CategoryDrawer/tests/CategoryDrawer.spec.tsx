import React from 'react'

import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toast } from '@gorgias/axiom'

import { manager } from 'hooks/useModalManager'
import type { Category } from 'models/helpCenter/types'
import { MODALS } from 'pages/settings/helpCenter/constants'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { DefaultExportCurrentHelpCenterContext as CurrentHelpCenterContext } from '../../../contexts/CurrentHelpCenterContext'
import { getSingleCategoryEnglish } from '../../../fixtures/getCategoriesResponse.fixtures'
import { getSingleHelpCenterResponseFixture } from '../../../fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from '../../../fixtures/getLocalesResponse.fixtures'
import { HelpCenterApiClientContext } from '../../../hooks/useHelpCenterApi'
import { SearchContextProvider } from '../../../providers/SearchContext'
import { CategoryDrawer } from '../CategoryDrawer'

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('rest_api/help_center_api', () => ({
    getHelpCenterClient: jest.fn().mockResolvedValue({
        client: {
            listArticles: jest.fn().mockResolvedValue({ data: { data: [] } }),
            getCategory: jest
                .fn()
                .mockResolvedValue({ data: { translation: null } }),
        },
        agentAbility: undefined,
    }),
}))

const ROOT_CATEGORY = {
    ...getSingleCategoryEnglish,
    id: 0,
    children: [5],
    available_locales: [],
    translation: null,
} as unknown as Category

const buildClient = (overrides: Record<string, unknown> = {}) =>
    ({
        getCategory: jest.fn().mockResolvedValue({
            data: { translation: getSingleCategoryEnglish.translation },
        }),
        createCategory: jest.fn().mockResolvedValue({
            data: {
                ...getSingleCategoryEnglish,
                translation: getSingleCategoryEnglish.translation,
            },
        }),
        updateCategoryTranslation: jest.fn().mockResolvedValue({
            data: getSingleCategoryEnglish.translation,
        }),
        createCategoryTranslation: jest
            .fn()
            .mockResolvedValue({ data: getSingleCategoryEnglish.translation }),
        deleteCategory: jest.fn().mockResolvedValue({}),
        deleteCategoryArticles: jest.fn().mockResolvedValue({}),
        deleteCategoryTranslation: jest.fn().mockResolvedValue({}),
        listArticles: jest.fn().mockResolvedValue({ data: { data: [] } }),
        ...overrides,
    }) as unknown as HelpCenterClient

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const MULTI_LOCALE_CATEGORY: Category = {
    ...getSingleCategoryEnglish,
    available_locales: ['en-US', 'fr-FR'],
}

const buildState = (category: Category): Partial<RootState> =>
    ({
        entities: {
            helpCenter: {
                articles: articlesState,
                categories: {
                    ...categoriesState,
                    categoriesById: {
                        '0': ROOT_CATEGORY,
                        '5': category,
                    },
                },
            },
        },
        ui: { helpCenter: uiState },
    }) as unknown as Partial<RootState>

type RenderOptions = {
    client?: ReturnType<typeof buildClient>
    isCreate?: boolean
    category?: Category
}

const renderDrawer = ({
    client = buildClient(),
    isCreate = false,
    category = getSingleCategoryEnglish,
}: RenderOptions = {}) => {
    const store = mockStore(buildState(category))

    const result = render(
        <Provider store={store}>
            <CurrentHelpCenterContext.Provider
                value={getSingleHelpCenterResponseFixture}
            >
                <HelpCenterApiClientContext.Provider
                    value={{ isReady: true, client, agentAbility: undefined }}
                >
                    <SearchContextProvider
                        helpCenter={getSingleHelpCenterResponseFixture}
                    >
                        <CategoryDrawer
                            helpCenter={getSingleHelpCenterResponseFixture}
                        />
                    </SearchContextProvider>
                </HelpCenterApiClientContext.Provider>
            </CurrentHelpCenterContext.Provider>
        </Provider>,
    )

    act(() => {
        manager.openModal(MODALS.CATEGORY, false, { id: 5, isCreate })
    })

    return { ...result, client }
}

describe('<CategoryDrawer />', () => {
    afterEach(() => {
        toast.dismiss()
        if (
            manager.getModal(MODALS.CATEGORY) &&
            manager.isOpen(MODALS.CATEGORY)
        ) {
            act(() => {
                manager.closeModal(MODALS.CATEGORY)
            })
        }
    })

    describe('saving an existing category', () => {
        it('shows a success toast when the category is updated', async () => {
            const user = userEvent.setup()
            renderDrawer()

            const saveButton = await screen.findByText('Save')
            await waitFor(() => expect(saveButton).toBeAriaEnabled())
            await user.click(saveButton)

            const status = await screen.findByRole('status', {
                name: /Category updated with success/,
            })
            expect(status).toHaveAttribute('data-intent', 'success')
        })

        it('shows an error toast when updating the category fails', async () => {
            const user = userEvent.setup()
            renderDrawer({
                client: buildClient({
                    updateCategoryTranslation: jest
                        .fn()
                        .mockRejectedValue(new Error('update failed')),
                }),
            })

            const saveButton = await screen.findByText('Save')
            await waitFor(() => expect(saveButton).toBeAriaEnabled())
            await user.click(saveButton)

            const status = await screen.findByRole('status', {
                name: /Failed to save the category/,
            })
            expect(status).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('creating a category', () => {
        it('shows a success toast when the category is created', async () => {
            const user = userEvent.setup()
            renderDrawer({ isCreate: true })

            const titleInput = await screen.findByTestId('title-input')
            await user.type(titleInput, 'New category')

            await user.click(screen.getByText('Create Category'))

            const status = await screen.findByRole('status', {
                name: /Category created with success/,
            })
            expect(status).toHaveAttribute('data-intent', 'success')
        })

        it('shows an error toast when creating the category fails', async () => {
            const user = userEvent.setup()
            renderDrawer({
                isCreate: true,
                client: buildClient({
                    createCategory: jest
                        .fn()
                        .mockRejectedValue(new Error('create failed')),
                }),
            })

            const titleInput = await screen.findByTestId('title-input')
            await user.type(titleInput, 'New category')

            await user.click(screen.getByText('Create Category'))

            const status = await screen.findByRole('status', {
                name: /Failed to create the category/,
            })
            expect(status).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('deleting a category', () => {
        it('shows a success toast when the category is deleted', async () => {
            const user = userEvent.setup()
            renderDrawer()

            await user.click(await screen.findByText('Delete Category'))
            await user.click(await screen.findByText('Delete category'))

            const status = await screen.findByRole('status', {
                name: /Category deleted with success/,
            })
            expect(status).toHaveAttribute('data-intent', 'success')
        })

        it('shows an error toast when deleting the category fails', async () => {
            const user = userEvent.setup()
            renderDrawer({
                client: buildClient({
                    deleteCategory: jest
                        .fn()
                        .mockRejectedValue(new Error('delete failed')),
                }),
            })

            await user.click(await screen.findByText('Delete Category'))
            await user.click(await screen.findByText('Delete category'))

            const status = await screen.findByRole('status', {
                name: /Failed to delete the category/,
            })
            expect(status).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('deleting a category translation', () => {
        const confirmLanguageDeletion = async (
            user: ReturnType<typeof userEvent.setup>,
        ) => {
            const trigger = await screen.findByTestId('dropdown-select-trigger')
            await user.click(trigger)

            const deleteButtons = await screen.findAllByRole('button', {
                name: 'delete',
            })
            await user.click(deleteButtons[0])

            const confirmButton = await screen.findByRole('button', {
                name: /^Delete .+ - /,
            })
            await user.click(confirmButton)
        }

        it('shows a success toast when the translation is deleted', async () => {
            const user = userEvent.setup()
            renderDrawer({ category: MULTI_LOCALE_CATEGORY })

            await confirmLanguageDeletion(user)

            const status = await screen.findByRole('status', {
                name: /Category translation deleted with success/,
            })
            expect(status).toHaveAttribute('data-intent', 'success')
        })

        it('shows an error toast when deleting the translation fails', async () => {
            const user = userEvent.setup()
            renderDrawer({
                category: MULTI_LOCALE_CATEGORY,
                client: buildClient({
                    deleteCategoryTranslation: jest
                        .fn()
                        .mockRejectedValue(new Error('delete failed')),
                }),
            })

            await confirmLanguageDeletion(user)

            const status = await screen.findByRole('status', {
                name: /Failed to delete category translation/,
            })
            expect(status).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
