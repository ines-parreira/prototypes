import React, {useEffect} from 'react'
import axios from 'axios'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'

import {
    Category,
    CreateCategoryTranslationDto,
    HelpCenter,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from '../../../../../models/helpCenter/types'
import useAppDispatch from '../../../../../hooks/useAppDispatch'

import {getCategoryById} from '../../../../../state/helpCenter/categories'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {notify} from '../../../../../state/notifications/actions'

import {useModalManager} from '../../../../../hooks/useModalManager'

import {HelpCenterCategory} from '../../components/articles/HelpCenterCategory'
import {useCategoriesActions} from '../../hooks/useCategoriesActions'

import {MODALS} from '../../constants'

type Props = {
    helpCenter: HelpCenter
}

export const CategoryDrawer: React.FC<Props> = ({helpCenter}: Props) => {
    const dispatch = useAppDispatch()
    const {isOpen, closeModal, getParams} = useModalManager(MODALS.CATEGORY)
    const params = getParams() as Category & {isCreate?: boolean}
    const category = useSelector(getCategoryById(params?.id))
    const categoriesActions = useCategoriesActions()

    const [{loading, value: translation}, getCategoryTranslation] = useAsyncFn(
        (categoryId: number, locale: LocaleCode) => {
            if (category.available_locales.includes(locale)) {
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
        if (category?.id) {
            void getCategoryTranslation(
                category.id,
                category.translation.locale
            )
        }
    }, [category])

    const handleOnSave = async (
        payload: UpdateCategoryTranslationDto,
        locale: LocaleCode
    ) => {
        try {
            if (category.available_locales.includes(locale)) {
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
                    slug: payload.slug || '',
                    seo_meta: {
                        title: payload.seo_meta?.title || null,
                        description: payload.seo_meta?.description || null,
                    },
                })
            }

            void dispatch(
                notify({
                    message: 'Successfully updated the category',
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

    const handleOnCreate = async (
        translation: CreateCategoryTranslationDto
    ) => {
        try {
            await categoriesActions.createCategory({translation})

            void dispatch(
                notify({
                    message: 'Successfully created the category',
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
                    message: 'Successfully deleted the category',
                    status: NotificationStatus.Success,
                })
            )
            closeModal()
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Something went wrong',
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
                    message: 'Successfully deleted the category translations',
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            void dispatch(
                notify({
                    message:
                        'Something went wrong. Cannot delete category translation',
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }

    return (
        <HelpCenterCategory
            isLoading={loading}
            isCreate={params?.isCreate}
            category={category}
            helpCenter={helpCenter}
            isOpen={isOpen()}
            canSave={!categoriesActions.isLoading}
            translation={translation}
            onLocaleChange={(locale) => {
                if (category?.id) {
                    void getCategoryTranslation(category.id, locale)
                }
            }}
            onSave={handleOnSave}
            onCreate={handleOnCreate}
            onClose={() => closeModal()}
            onDelete={handleOnDelete}
            onDeleteTranslation={handleOnDeleteTranslation}
        />
    )
}
