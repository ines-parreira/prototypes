import React, {useCallback, useEffect, useRef, useState} from 'react'
import get from 'lodash/get'
import classNames from 'classnames'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import useHelpCenterArticleTree from '../hooks/useHelpCenterArticleTree'
import {
    Components,
    Paths,
} from '../../../../rest_api/help_center_api/client.generated'
import DropdownSearch from '../../../common/components/dropdown/DropdownSearch'
import DropdownSection from '../../../common/components/dropdown/DropdownSection'
import SelectInputBox, {
    SelectInputBoxContext,
} from '../../../common/forms/input/SelectInputBox'
import css from './ArticleSelect.less'

type Props = {
    helpCenterId: number
    onChange: (id: number) => void
    locale?: Paths.GetCategoryTree.Parameters.Locale
    includeAllArticles?: boolean
    contained?: boolean
    selectInputClassName?: string
    autoFocus?: boolean
}

const ArticleRow = ({
    article,
    onClick,
    title,
}: {
    article: Partial<Components.Schemas.CategoryTreeArticleDto> & {id: number}
    onClick: (value: number) => void
    title?: string
}) => {
    return (
        <DropdownItem
            key={article.id}
            onClick={onClick}
            option={{
                label:
                    article.translation_versions?.current?.title || title || '',
                value: article.id,
            }}
        />
    )
}

const CategoryRow = ({
    category,
    onClick,
    i,
}: {
    category: Components.Schemas.CategoryTreeDto
    onClick: (value: string) => void
    i: number
}) => {
    return (
        <DropdownItem
            key={category.id}
            data-category-id={category.id}
            onClick={onClick}
            option={{
                label: category.translation?.title || '',
                value: `category_${i}`,
            }}
        >
            {(highlatedLabel) => (
                <div className={css.categoryLabel}>
                    {highlatedLabel}
                    <i className={classNames('material-icons', css.chevron)}>
                        chevron_right
                    </i>
                </div>
            )}
        </DropdownItem>
    )
}

const ArticleSelect = ({
    helpCenterId,
    onChange,
    locale,
    includeAllArticles,
    autoFocus = true,
    contained = true,
    selectInputClassName = '',
}: Props) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState<number>()
    const [search, setSearch] = useState<string>('')

    const {data, map} = useHelpCenterArticleTree(helpCenterId, locale)
    const [isOpen, setIsOpen] = useState(false)
    const [path, setPath] = useState<string>('')
    const allArticles = Array.from(map.entries())

    useEffect(() => {
        setSearch('')
        if (searchRef) {
            searchRef.current?.focus()
        }
    }, [path, searchRef])

    const handleClickBack = useCallback(() => {
        setPath(path.split('.').slice(0, -1).join('.'))
    }, [path, setPath])

    const handleCategoryClick = useCallback(
        (value: string) => {
            const i = value.split('_')[1]
            setPath(`${path ? path + '.' : ''}children[${i}]`)
        },
        [path, setPath]
    )

    const isAtRootLevel = path === ''

    const currentTreeNode: Components.Schemas.CategoryTreeDto | null = get(
        data,
        path,
        data
    )

    useEffect(() => {
        if (includeAllArticles) {
            setValue(0)
        }
    }, [includeAllArticles])

    const categories = currentTreeNode?.children
    const articles = currentTreeNode?.articles
    return (
        <div className={css.container}>
            <SelectInputBox
                className={classNames(css.selectInput, selectInputClassName)}
                floating={floatingRef}
                placeholder="Select an article..."
                label={value !== undefined ? map.get(value) : ''}
                onToggle={setIsOpen}
                ref={targetRef}
                autoFocus={autoFocus}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => {
                        const handleArticleClick = (articleId: number) => {
                            setValue(articleId)
                            setPath('')
                            setIsOpen(false)
                            context?.onBlur()
                            onChange(articleId)
                        }
                        return (
                            <Dropdown
                                placement="bottom-start"
                                className={css.dropdown}
                                isOpen={isOpen}
                                onToggle={() => context!.onBlur()}
                                ref={floatingRef}
                                target={targetRef}
                                value={value}
                                contained={contained}
                                shouldFlip
                            >
                                {!isAtRootLevel && (
                                    <DropdownHeader
                                        prefix={
                                            <i className="material-icons">
                                                arrow_back
                                            </i>
                                        }
                                        onClick={handleClickBack}
                                    >
                                        Back
                                    </DropdownHeader>
                                )}
                                <DropdownSearch
                                    value={search}
                                    onChange={setSearch}
                                    ref={searchRef}
                                    autoFocus
                                />
                                <DropdownBody>
                                    {isAtRootLevel && !search && (
                                        <DropdownSection
                                            title={
                                                includeAllArticles
                                                    ? ''
                                                    : 'No Response'
                                            }
                                        >
                                            {includeAllArticles && (
                                                <DropdownItem
                                                    onClick={handleArticleClick}
                                                    option={{
                                                        label: 'All Articles',
                                                        value: 0,
                                                    }}
                                                />
                                            )}
                                            <DropdownItem
                                                onClick={handleArticleClick}
                                                option={{
                                                    label: 'No relevant articles',
                                                    value: -1,
                                                }}
                                            />
                                        </DropdownSection>
                                    )}
                                    {!!categories?.length && (
                                        <DropdownSection title="Categories">
                                            {categories.map((category, i) => (
                                                <CategoryRow
                                                    key={category.id}
                                                    category={category}
                                                    i={i}
                                                    onClick={
                                                        handleCategoryClick
                                                    }
                                                />
                                            ))}
                                        </DropdownSection>
                                    )}
                                    {!!articles?.length &&
                                        isAtRootLevel &&
                                        !search && (
                                            <DropdownSection title="Uncategorized articles">
                                                {articles.map((article) => (
                                                    <ArticleRow
                                                        key={article.id}
                                                        onClick={
                                                            handleArticleClick
                                                        }
                                                        article={article}
                                                    />
                                                ))}
                                            </DropdownSection>
                                        )}
                                    {articles &&
                                        !isAtRootLevel &&
                                        !search &&
                                        articles.map((article) => (
                                            <ArticleRow
                                                key={article.id}
                                                onClick={handleArticleClick}
                                                article={article}
                                            />
                                        ))}

                                    {!!search &&
                                        allArticles.map(([id, title]) => (
                                            <ArticleRow
                                                key={id}
                                                onClick={handleArticleClick}
                                                article={{id}}
                                                title={title}
                                            />
                                        ))}
                                </DropdownBody>
                            </Dropdown>
                        )
                    }}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </div>
    )
}

export default ArticleSelect
