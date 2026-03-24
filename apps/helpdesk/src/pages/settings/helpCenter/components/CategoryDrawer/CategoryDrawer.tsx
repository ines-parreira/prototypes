import type React from 'react'
import { useEffect } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { reportError } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import type {
    Category,
    CreateCategoryDto,
    HelpCenter,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from 'models/helpCenter/types'
import { HelpCenterCategoryEdit } from 'pages/settings/helpCenter/components/HelpCenterCategoryEdit'
import {
    HELP_CENTER_DEFAULT_LOCALE,
    MODALS,
} from 'pages/settings/helpCenter/constants'
import { useCategoriesActions } from 'pages/settings/helpCenter/hooks/useCategoriesActions'
import {
    getCategoryById,
    updateCategoryTranslation,
} from 'state/entities/helpCenter/categories'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { changeViewLanguage, getViewLanguage } from 'state/ui/helpCenter'

import { useSearchContext } from '../../providers/SearchContext'
import { getGenericMessageFromError } from '../../utils'

type Props = {
    helpCenter: HelpCenter
}

export const CategoryDrawer: React.FC<Props> = ({ helpCenter }: Props) => {
    const dispatch = useAppDispatch()
    const { isOpen, closeModal, getParams } = useModalManager(MODALS.CATEGORY)
    // @ts-expect-error
    const params: Category & {
        isCreate?: boolean
        parentCategoryId?: number
    } = getParams()
    const category = useAppSelector(getCategoryById(params?.id))
    const categoriesActions = useCategoriesActions()
    const { setSearchInput } = useSearchContext()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const [{ loading, value: translation }, getCategoryTranslation] =
        useAsyncFn(
            (categoryId: number, locale: LocaleCode) => {
                if (category?.available_locales.includes(locale)) {
                    return categoriesActions.getCategoryTranslation(
                        categoryId,
                        locale,
                    )
                }

                return Promise.resolve(undefined)
            },
            [category, categoriesActions],
        )

    useEffect(() => {
        if (!category?.id || !category.translation) {
            return
        }
        void getCategoryTranslation(category.id, category.translation.locale)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])

    useEffect(() => {
        async function loadTranslation() {
            if (!category?.id || !category.translation) {
                return
            }

            if (category.translation.locale !== viewLanguage) {
                const translation = await getCategoryTranslation(
                    category.id,
                    viewLanguage,
                )

                if (translation !== undefined) {
                    dispatch(updateCategoryTranslation(translation))
                }
            }
        }

        void loadTranslation()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewLanguage, category])

    const handleOnSave = async (
        payload: UpdateCategoryTranslationDto,
        locale: LocaleCode,
    ) => {
        try {
            if (category?.available_locales.includes(locale)) {
                // Update translation
                await categoriesActions.updateCategoryTranslation(
                    params.id,
                    locale,
                    payload,
                )
            } else {
                // Create translation
                await categoriesActions.createCategoryTranslation(params.id, {
                    locale,
                    title: payload.title || '',
                    description: payload.description || '',
                    image_url: payload.image_url,
                    parent_category_id: payload.parent_category_id || null,
                    slug: payload.slug || '',
                    seo_meta: {
                        title: payload.seo_meta?.title || null,
                        description: payload.seo_meta?.description || null,
                    },
                })
            }

            void dispatch(
                notify({
                    message: 'Category updated with success',
                    status: NotificationStatus.Success,
                }),
            )

            closeModal()
            setSearchInput('')
        } catch (err) {
            const errorMessage = getGenericMessageFromError(err)

            void dispatch(
                notify({
                    message: `Failed to save the category: ${errorMessage}`,
                    status: NotificationStatus.Error,
                }),
            )

            reportError(err as Error)
        }
    }

    const handleOnCreate = async (payload: CreateCategoryDto) => {
        try {
            await categoriesActions.createCategory(payload)

            void dispatch(
                notify({
                    message: 'Category created with success',
                    status: NotificationStatus.Success,
                }),
            )

            closeModal()
            setSearchInput('')
        } catch (err) {
            const errorMessage = getGenericMessageFromError(err)

            void dispatch(
                notify({
                    message: `Failed to create the category: ${errorMessage}`,
                    status: NotificationStatus.Error,
                }),
            )

            reportError(err as Error)
        }
    }

    const handleOnDelete = async (categoryId: number) => {
        try {
            await categoriesActions.deleteCategory(categoryId)

            void dispatch(
                notify({
                    message: 'Category deleted with success',
                    status: NotificationStatus.Success,
                }),
            )
            closeModal()
            setSearchInput('')
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Failed to delete the category',
                    status: NotificationStatus.Error,
                }),
            )

            reportError(err as Error)
        }
    }

    const handleOnDeleteTranslation = async (
        categoryId: number,
        locale: LocaleCode,
    ) => {
        try {
            await categoriesActions.deleteCategoryTranslation(
                categoryId,
                locale,
            )

            void dispatch(
                notify({
                    message: 'Category translation deleted with success',
                    status: NotificationStatus.Success,
                }),
            )
            setSearchInput('')
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Failed to delete category translation',
                    status: NotificationStatus.Error,
                }),
            )

            reportError(err as Error)
        }
    }

    return (
        <HelpCenterCategoryEdit
            isLoading={loading}
            isCreate={params?.isCreate}
            parentCategoryId={params?.parentCategoryId}
            category={category}
            helpCenter={helpCenter}
            isOpen={isOpen()}
            canSave={!categoriesActions.isLoading}
            translation={translation}
            onLocaleChange={(locale) => {
                dispatch(changeViewLanguage(locale))
            }}
            onSave={handleOnSave}
            onCreate={handleOnCreate}
            onClose={() => closeModal()}
            onDelete={handleOnDelete}
            onDeleteTranslation={handleOnDeleteTranslation}
        />
    )
}
