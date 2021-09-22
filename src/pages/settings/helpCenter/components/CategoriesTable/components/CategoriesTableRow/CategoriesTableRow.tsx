import classNames from 'classnames'
import React, {MouseEvent, ReactElement, useMemo, useState} from 'react'
import {Badge, Spinner} from 'reactstrap'

import {useModalManager} from '../../../../../../../hooks/useModalManager'
import {
    Category,
    HelpCenterArticle,
    LocaleCode,
} from '../../../../../../../models/helpCenter/types'
import {LanguageList} from '../../../../../../common/components/LanguageBulletList'
import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'
import {MODALS} from '../../../../constants'
import {useArticles} from '../../../../hooks/useArticles'
import {useSupportedLocales} from '../../../../providers/SupportedLocales'
import {
    DroppableTableBodyRow,
    RowEventListeners,
} from '../../../DroppableTableBodyRow'
import {TableActions} from '../../../TableActions'
import {DND_ENTITIES} from '../../constants'

import css from './CategoriesTableRow.less'

export type CategoriesTableRowProps =
    | BaseCategoriesTableRowProps
    | ({category: Category} & BaseCategoriesTableRowProps & RowEventListeners)

type BaseCategoriesTableRowProps = {
    categoryId: number
    viewLanguage: LocaleCode
    title?: string
    renderArticleList?: (
        categoryId: number,
        articles: HelpCenterArticle[]
    ) => ReactElement
}

type FixedCategoriesTableRowProps = {
    headerCell: ReactElement
    bodyInnerClass: string
}

const FixedCategoriesTableRow = ({
    headerCell,
    bodyInnerClass,
}: FixedCategoriesTableRowProps) => {
    return (
        <TableBodyRow className={css.row}>
            <BodyCell>{''}</BodyCell>
            {headerCell}
            <BodyCell innerClassName={bodyInnerClass}>{''}</BodyCell>
            <BodyCell width={120} innerClassName={bodyInnerClass}>
                {''}
            </BodyCell>
        </TableBodyRow>
    )
}

type DroppableCategoriesTableRowProps = {
    category: Category
    headerCell: ReactElement
    bodyInnerClass: string
    onDragStart: () => void
} & RowEventListeners

const DroppableCategoriesTableRow = ({
    category,
    headerCell,
    bodyInnerClass,
    onDragStart,
    onMoveEntity,
    onDropEntity,
}: DroppableCategoriesTableRowProps) => {
    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const articleModal = useModalManager(MODALS.ARTICLE, {autoDestroy: false})
    const localesByCode = useSupportedLocales()

    const languageList = useMemo(() => {
        if (
            category?.available_locales &&
            category.available_locales.length > 0
        ) {
            return category.available_locales.map((code) => localesByCode[code])
        }

        if (category?.translation) {
            return [localesByCode[category.translation.locale]]
        }

        return []
    }, [category, localesByCode])

    const handleOnActionClick = (ev: MouseEvent, name: string) => {
        if (!category) return

        if (name === 'categorySettings') {
            categoryModal.openModal(MODALS.CATEGORY, false, category)
            return
        }

        if (name === 'createInCategory') {
            articleModal.openModal(MODALS.ARTICLE, true, {
                categoryId: category.id,
            })
            return
        }
    }

    return (
        <DroppableTableBodyRow
            className={css['droppable-row']}
            dragItem={{
                id: category.id,
                position: category.position,
                type: DND_ENTITIES.CATEGORY,
            }}
            onDragStart={onDragStart}
            onMoveEntity={onMoveEntity}
            onDropEntity={onDropEntity}
        >
            {headerCell}
            <BodyCell innerClassName={bodyInnerClass}>
                {category.translation && (
                    <LanguageList
                        helpcenterId={category.id}
                        defaultLanguage={
                            localesByCode[category.translation.locale]
                        }
                        languageList={languageList}
                    />
                )}
            </BodyCell>
            <BodyCell
                width={120}
                innerClassName={classNames(css.actions, bodyInnerClass)}
            >
                <TableActions
                    actions={[
                        {
                            name: 'createInCategory',
                            icon: 'add_circle_outline',
                            // tooltip: 'Compose article in category',
                        },
                        {
                            name: 'categorySettings',
                            icon: 'settings',
                            // tooltip: 'Category settings',
                        },
                    ]}
                    onClick={handleOnActionClick}
                />
            </BodyCell>
        </DroppableTableBodyRow>
    )
}

export const CategoriesTableRow = ({
    categoryId,
    viewLanguage,
    renderArticleList,
    title,
    ...props
}: CategoriesTableRowProps): JSX.Element => {
    const [isOpen, setOpen] = useState(false)
    const {articles, isLoading} = useArticles(viewLanguage, categoryId)
    const count = useMemo(() => articles.length, [articles])

    const bodyInnerClass = classNames({
        [css['no-click']]: articles.length === 0,
    })

    const caret =
        count > 0 && renderArticleList ? (
            <span className={classNames(css.caret, 'material-icons')}>
                {isOpen ? 'arrow_drop_down' : 'arrow_right'}
            </span>
        ) : (
            <span className={css['caret-placeholder']} />
        )
    const countElement = isLoading ? (
        <Spinner size="sm" color="secondary" style={{marginLeft: 8}} />
    ) : (
        <Badge pill color="light" className={css.count}>
            {count > 0 ? count : 'No Published Articles'}
        </Badge>
    )
    const headerCell = (
        <BodyCell
            className={css['cell']}
            innerClassName={bodyInnerClass}
            onClick={() => setOpen(!isOpen)}
        >
            {caret}
            {title && <span>{title}</span>}
            {countElement}
        </BodyCell>
    )

    const shouldCollapseRow = isOpen && articles.length > 0

    return (
        <>
            {'category' in props ? (
                <DroppableCategoriesTableRow
                    headerCell={headerCell}
                    bodyInnerClass={bodyInnerClass}
                    onDragStart={() => setOpen(false)}
                    {...props}
                />
            ) : (
                <FixedCategoriesTableRow
                    headerCell={headerCell}
                    bodyInnerClass={bodyInnerClass}
                />
            )}
            {shouldCollapseRow && renderArticleList && (
                <TableBodyRow>
                    <BodyCell colSpan={4} className={css['parent-cell']}>
                        {renderArticleList(categoryId, articles)}
                    </BodyCell>
                </TableBodyRow>
            )}
        </>
    )
}
