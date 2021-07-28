import React from 'react'
import {useSelector} from 'react-redux'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {
    readCategories,
    saveCategories,
} from '../../../../state/helpCenter/categories'
import {Category, LocaleCode} from '../../../../models/helpCenter/types'

import {useHelpcenterApi} from './useHelpcenterApi'

type HelpCenterCategoriesHook = {
    data: Category[]
    isLoading: boolean
}

export const useHelpcenterCategories = (
    helpcenterId: number,
    locale: LocaleCode
): HelpCenterCategoriesHook => {
    const dispatch = useAppDispatch()
    const data = useSelector(readCategories)

    const [isLoading, setLoading] = React.useState(true)
    const {isReady, client} = useHelpcenterApi()

    React.useEffect(() => {
        async function init() {
            if (isReady && client) {
                try {
                    const {data} = await client.listCategories({
                        help_center_id: helpcenterId,
                        locale,
                    })

                    const positions = await client
                        .getCategoriesPositions({
                            help_center_id: helpcenterId,
                        })
                        .then((response) => response.data)

                    const categories = data.data.map((category) => {
                        return {
                            ...category,
                            position: positions.findIndex(
                                (index) => index === category.id
                            ),
                            articles: [],
                        }
                    })

                    dispatch(saveCategories(categories))
                } catch (err) {
                    console.error(err)
                } finally {
                    setLoading(false)
                }
            }
        }

        void init()
    }, [helpcenterId, isReady])

    return {
        data,
        isLoading,
    }
}
