import React from 'react'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'

import {
    HelpCenter,
    Category,
    LocaleCode,
    CategoryTranslation,
    CreateCategoryDto,
} from '../../../../../models/helpCenter/types'
import useAppDispatch from '../../../../../hooks/useAppDispatch'

import {readCategory} from '../../../../../state/helpCenter/categories'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {notify} from '../../../../../state/notifications/actions'

import {useModalManager} from '../../../../../hooks/useModalManager'

import {HelpCenterCategory} from '../../components/articles/HelpCenterCategory'
import {useCategoriesActions} from '../../hooks/useCategoriesActions'

import {MODALS} from '../../constants'

type Props = {
    helpCenter: HelpCenter
}

export const CategoryDrawer = ({helpCenter}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const {isOpen, closeModal, getParams} = useModalManager(MODALS.CATEGORY)
    const params = getParams() as Category & {isCreate?: boolean}

    const category = useSelector(readCategory(params?.id))
    const actions = useCategoriesActions()

    const [translation, readTranslation] = useAsyncFn(
        (categoryId: number, locale: LocaleCode) => {
            if (category.available_locales.includes(locale)) {
                return actions.getCategoryTranslation(categoryId, locale)
            }

            return Promise.resolve(undefined)
        },
        [actions]
    )

    React.useEffect(() => {
        if (category?.id && category?.translation?.locale) {
            void readTranslation(category.id, category.translation.locale)
        }
    }, [helpCenter, category, params])

    const handleOnSave = async (
        payload: Partial<CategoryTranslation>,
        locale: LocaleCode
    ) => {
        try {
            if (category?.available_locales.includes(locale)) {
                // Update translation
                await actions.updateCategoryTranslation(
                    params.id,
                    locale,
                    payload
                )
            } else {
                // Create translation
                await actions.createCategoryTranslation(params.id, {
                    title: payload?.title || '',
                    description: payload?.description || '',
                    slug: payload?.slug || '',
                    locale,
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
            console.error(err)
            void dispatch(
                notify({
                    message: 'Something went wrong',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    const handleOnCreate = async (payload: CreateCategoryDto) => {
        try {
            await actions.createCategory(payload)

            void dispatch(
                notify({
                    message: 'Successfully created the category',
                    status: NotificationStatus.Success,
                })
            )

            closeModal()
        } catch (err) {
            console.error(err)
            void dispatch(
                notify({
                    message: 'Something went wrong',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    const handleOnDelete = async (categoryId: number) => {
        try {
            await actions.deleteCategory(categoryId)

            void dispatch(
                notify({
                    message: 'Successfully deleted the category',
                    status: NotificationStatus.Success,
                })
            )
            closeModal()
        } catch (err) {
            console.error(err)
            void dispatch(
                notify({
                    message: 'Something went wrong',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    const handleOnDeleteTranslation = async (
        categoryId: number,
        locale: LocaleCode
    ) => {
        try {
            await actions.deleteCategoryTranslation(categoryId, locale)

            void dispatch(
                notify({
                    message: 'Successfully deleted the category translations',
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            console.error(err)
            void dispatch(
                notify({
                    message:
                        'Something went wrong. Cannot delete category translation',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    return (
        <HelpCenterCategory
            isLoading={translation.loading}
            isCreate={params?.isCreate}
            category={category}
            helpCenter={helpCenter}
            isOpen={isOpen()}
            translation={translation.value}
            onLocaleChange={(locale) => {
                if (category?.id) {
                    void readTranslation(category.id, locale)
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
