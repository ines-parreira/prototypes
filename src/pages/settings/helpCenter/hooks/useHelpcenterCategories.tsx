import React from 'react'

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
    const [data, setData] = React.useState<Category[]>([])
    const [isLoading, setLoading] = React.useState(true)
    const {isReady, client} = useHelpcenterApi()

    React.useEffect(() => {
        async function init() {
            if (isReady && client) {
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

                setData(categories as Category[])
                setLoading(false)
            }
        }

        void init()
    }, [helpcenterId, isReady])

    return {
        data,
        isLoading,
    }
}
