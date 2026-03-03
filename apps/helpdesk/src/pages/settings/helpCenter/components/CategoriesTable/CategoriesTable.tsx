import React, { useCallback, useMemo, useState } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {
    getCategoriesById,
    isNonRootCategory,
    savePositions,
} from 'state/entities/helpCenter/categories'

import { CategoriesTableBasicRow } from './components/CategoriesTableBasicRow/CategoriesTableBasicRow'
import type { CategoriesTableRowProps } from './components/CategoriesTableRow'
import { CategoriesTableRow } from './components/CategoriesTableRow'
import { DND_ENTITIES } from './constants'

import css from './CategoriesTable.less'

export type CategoriesPositionsType = {
    categories: number[]
    categoryId: number
    defaultSiblingsPositions: number[]
}

export type CategoriesTableProps = Pick<
    CategoriesTableRowProps,
    'renderArticleList'
> & {
    onReorderFinish: (params: CategoriesPositionsType) => void
    shouldRenderEmptyUncategorizedRow: boolean
    isLoading: boolean
}

export const CategoriesTable = ({
    onReorderFinish,
    renderArticleList,
    shouldRenderEmptyUncategorizedRow,
    isLoading,
}: CategoriesTableProps): JSX.Element => {
    const categoriesById = useAppSelector(getCategoriesById)
    const dispatch = useAppDispatch()
    const topCategories = useMemo(() => {
        const rootCategory = categoriesById['0']
        return rootCategory.children
            .map((categoryId) => categoriesById[categoryId])
            .filter(isNonRootCategory)
    }, [categoriesById])

    const [defaultSiblingsPositions, setDefaultSiblingsPositions] = useState<
        number[]
    >([])
    const [categoriesToReorder, setCategoriesToReorder] =
        useState<CategoriesPositionsType>({
            categories: [],
            categoryId: 0,
            defaultSiblingsPositions: [],
        })

    const handleOnDropCategory = useCallback(
        (dragIndex: number, hoverIndex: number, type: string) => {
            const parentId = Number(type.replace(DND_ENTITIES.CATEGORY, ''))
            const siblings = [...categoriesById[parentId].children]
            const dragValue = siblings[dragIndex]

            siblings.splice(dragIndex, 1)
            siblings.splice(hoverIndex, 0, dragValue)

            setCategoriesToReorder({
                categories: siblings,
                categoryId: parentId,
                defaultSiblingsPositions,
            })

            dispatch(
                savePositions({ children: siblings, categoryId: parentId }),
            )
        },
        [categoriesById, defaultSiblingsPositions, dispatch],
    )

    const handleOnReorderFinish = useCallback(() => {
        onReorderFinish(categoriesToReorder)
    }, [categoriesToReorder, onReorderFinish])

    const handleOnCancelDnD = useCallback(
        (type: string) => {
            const parentId = Number(type.replace(DND_ENTITIES.CATEGORY, ''))
            dispatch(
                savePositions({
                    children: defaultSiblingsPositions,
                    categoryId: parentId,
                }),
            )
        },
        [defaultSiblingsPositions, dispatch],
    )

    const handleOnDragStart = useCallback((children: number[]) => {
        setDefaultSiblingsPositions(children)
    }, [])

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCell style={{ width: 25 }} className={css.headerCell} />
                <HeaderCell className={css.headerCell} />
                <HeaderCell style={{ width: 124 }} className={css.headerCell} />
                <HeaderCell style={{ width: 105 }} className={css.headerCell} />
                <HeaderCell style={{ width: 160 }} className={css.headerCell} />
            </TableHead>
            <TableBody className={css['main-table']}>
                <CategoriesTableBasicRow
                    shouldRenderRowWithoutArticles={
                        shouldRenderEmptyUncategorizedRow
                    }
                    title="Uncategorized articles"
                    renderArticleList={renderArticleList}
                    tooltip="Uncategorized articles will always be the last ones on the list in the live Help Center."
                    isCountBadgeLoading={isLoading}
                />
                {topCategories.map((category, index) => (
                    <CategoriesTableRow
                        key={category.id}
                        categoryId={category.id}
                        childCategories={category.children}
                        level={0}
                        isUnlisted={
                            category.translation.customer_visibility ===
                            'UNLISTED'
                        }
                        category={category}
                        position={index}
                        title={category.translation.title}
                        renderArticleList={renderArticleList}
                        onMoveEntity={handleOnDropCategory}
                        onDropEntity={handleOnReorderFinish}
                        onDragStart={handleOnDragStart}
                        onCancelDnD={handleOnCancelDnD}
                        isCountBadgeLoading={isLoading}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}
