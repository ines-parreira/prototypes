import React from 'react'

import {HelpCenter, Category} from '../../../../../models/helpCenter/types'

import {CategoriesTable} from '../../components/CategoriesTable'

import {useHelpcenterCategories} from '../../hooks/useHelpcenterCategories'
import {useCategoriesActions} from '../../hooks/useCategoriesActions'

type Props = {
    helpcenter: HelpCenter
    renderArticleList?: (category: Category) => React.ReactElement
}

export const CategoriesViews = ({
    helpcenter,
    renderArticleList,
}: Props): JSX.Element => {
    const actions = useCategoriesActions()
    const {data, isLoading} = useHelpcenterCategories(
        helpcenter.id,
        helpcenter.default_locale
    )

    const handleOnReorder = (categories: Category[]) => {
        void actions.updateCategoriesPosition(categories)
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
