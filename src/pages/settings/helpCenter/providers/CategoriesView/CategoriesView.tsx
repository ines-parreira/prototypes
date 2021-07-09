import React from 'react'
import {chain} from 'lodash'

import {HelpCenter, Category} from '../../../../../models/helpCenter/types'

import {CategoriesTable} from '../../components/CategoriesTable'

import {useHelpcenterApi} from '../../hooks/useHelpcenterApi'
import {useHelpcenterCategories} from '../../hooks/useHelpcenterCategories'

type Props = {
    helpcenter: HelpCenter
    renderArticleList?: (category: Category) => React.ReactElement
}

export const CategoriesViews = ({
    helpcenter,
    renderArticleList,
}: Props): JSX.Element => {
    const {client} = useHelpcenterApi()
    const {data, isLoading} = useHelpcenterCategories(
        helpcenter.id,
        helpcenter.default_locale
    )

    const handleOnReorder = (categories: Category[]) => {
        if (client) {
            const sortedCategories = chain(categories)
                .sortBy(['position'])
                .map((category) => category.id)
                .value()

            void client.setCategoriesPositions(
                {
                    help_center_id: helpcenter.id,
                },
                sortedCategories
            )
        }
    }

    if (isLoading) {
        return <div />
    }

    return (
        <CategoriesTable
            categories={data}
            renderArticleList={renderArticleList}
            onReorderFinish={handleOnReorder}
        />
    )
}
