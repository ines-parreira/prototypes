import React, {useEffect} from 'react'
import axios from 'axios'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import {useModalManager} from 'hooks/useModalManager'
import {
    Category,
    CreateCategoryDto,
    HelpCenter,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from 'models/helpCenter/types'
import {getCategoryById} from 'state/entities/helpCenter/categories'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppSelector from 'hooks/useAppSelector'
import {MODALS} from 'pages/settings/helpCenter/constants'
import {useCategoriesActions} from 'pages/settings/helpCenter/hooks/useCategoriesActions'
import {HelpCenterCategoryEdit} from 'pages/settings/helpCenter/components/HelpCenterCategoryEdit'
import {changeViewLanguage} from 'state/ui/helpCenter'

type Props = {
    helpCenter: HelpCenter
}

export const CategoryDrawer: React.FC<Props> = ({helpCenter}: Props) => {
    const dispatch = useAppDispatch()
    const {isOpen, closeModal, getParams} = useModalManager(MODALS.CATEGORY)
    // @ts-expect-error
    const params: Category & {
        isCreate?: boolean
        parentCategoryId?: number
    } = getParams()
    const category = useAppSelector(getCategoryById(params?.id))
    const categoriesActions = useCategoriesActions()

    const [{loading, value: translation}, getCategoryTranslation] = useAsyncFn(
        (categoryId: number, locale: LocaleCode) => {
            if (category?.available_locales.includes(locale)) {
                return categoriesActions.getCategoryTranslation(
                    categoryId,
                    locale
                )
            }

            return Promise.resolve(undefined)
        },
        [category, categoriesActions]
    )

    useEffect(() => {
        if (!category?.id || !category.translation) {
            return
        }
        void getCategoryTranslation(category.id, category.translation.locale)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])

    const handleOnSave = async (
        payload: UpdateCategoryTranslationDto,
        locale: LocaleCode
    ) => {
        try {
            if (category?.available_locales.includes(locale)) {
                // Update translation
                await categoriesActions.updateCategoryTranslation(
                    params.id,
                    locale,
                    payload
                )
            } else {
                // Create translation
                await categoriesActions.createCategoryTranslation(params.id, {
                    locale,
                    title: payload.title || '',
                    description: payload.description || '',
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
                })
            )

            closeModal()
        } catch (err) {
            const errorMessage =
                axios.isAxiosError(err) && err.response?.status === 400
                    ? 'some fields are empty or invalid.'
                    : 'please try again later.'

            void dispatch(
                notify({
                    message: `Failed to save the category: ${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }

    const handleOnCreate = async (payload: CreateCategoryDto) => {
        try {
            await categoriesActions.createCategory(payload)

            void dispatch(
                notify({
                    message: 'Category created with success',
                    status: NotificationStatus.Success,
                })
            )

            closeModal()
        } catch (err) {
            const errorMessage =
                axios.isAxiosError(err) && err.response?.status === 400
                    ? 'some fields are empty or invalid.'
                    : 'please try again later.'

            void dispatch(
                notify({
                    message: `Failed to create the category: ${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }

    const handleOnDelete = async (categoryId: number) => {
        try {
            await categoriesActions.deleteCategory(categoryId)

            void dispatch(
                notify({
                    message: 'Category deleted with success',
                    status: NotificationStatus.Success,
                })
            )
            closeModal()
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Failed to delete the category',
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }

    const handleOnDeleteTranslation = async (
        categoryId: number,
        locale: LocaleCode
    ) => {
        try {
            await categoriesActions.deleteCategoryTranslation(
                categoryId,
                locale
            )

            void dispatch(
                notify({
                    message: 'Category translation deleted with success',
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Failed to delete category translation',
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
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
