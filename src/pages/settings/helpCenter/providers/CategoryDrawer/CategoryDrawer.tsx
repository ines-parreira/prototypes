import React from 'react'

import {
    HelpCenter,
    Category,
    LocaleCode,
    CategoryTranslation,
    CreateCategoryDto,
} from '../../../../../models/helpCenter/types'

import useAppDispatch from '../../../../../hooks/useAppDispatch'

import {NotificationStatus} from '../../../../../state/notifications/types'
import {notify} from '../../../../../state/notifications/actions'

import {useModalManager} from '../../../../../hooks/useModalManager'

import {HelpCenterCategory} from '../../components/articles/HelpCenterCategory'
import {useHelpcenterApi} from '../../hooks/useHelpcenterApi'
import {useCategoriesActions} from '../../hooks/useCategoriesActions'

import {MODALS} from '../../constants'

type Props = {
    helpCenter: HelpCenter
}

export const CategoryDrawer = ({helpCenter}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const {isReady, client} = useHelpcenterApi()
    const [isLoading, setLoading] = React.useState<boolean>(true)
    const [category, setCategory] = React.useState<Category | null>(null)
    const {isOpen, closeModal, getParams} = useModalManager(MODALS.CATEGORY)
    const actions = useCategoriesActions()

    const params = getParams() as Category & {isCreate?: boolean}

    React.useEffect(() => {
        async function init() {
            if (isReady && client && params?.id) {
                if (params.translation) {
                    try {
                        const response = await client?.getCategory({
                            help_center_id: helpCenter.id,
                            id: params.id,
                            locale: params?.translation.locale,
                        })

                        setCategory(response.data as Category)
                        setLoading(false)
                    } catch (e) {
                        console.error(e)
                        closeModal()
                    }
                }
            } else {
                if (isOpen()) {
                    setLoading(false)
                }
            }
        }

        void init()
    }, [helpCenter, isReady, params])

    React.useEffect(() => {
        if (isOpen() === false) {
            setCategory(null)
        }
    }, [isOpen()])

    const handleOnSave = async (
        payload: Partial<CategoryTranslation>,
        locale: LocaleCode
    ) => {
        try {
            await actions.updateCategoryTranslation(params.id, locale, payload)

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

    return (
        <HelpCenterCategory
            isLoading={isLoading}
            isCreate={params?.isCreate}
            helpCenter={helpCenter}
            isOpen={isOpen()}
            category={category}
            onSave={handleOnSave}
            onCreate={handleOnCreate}
            onClose={() => closeModal()}
        />
    )
}
