import React, { MouseEvent, useEffect, useState } from 'react'

import { Chip } from 'pages/common/components/Chip'

import { QuickFilterType } from '../../types/QuickFilter'

import css from './QuickFilters.less'

type Props = {
    defaultActiveFilters?: string[]
    filters: QuickFilterType[]
    onChangeFilters: (filters: string[]) => void
}

export const QuickFilters = ({
    defaultActiveFilters = [],
    filters,
    onChangeFilters,
}: Props) => {
    const [activeFilters, setActiveFilters] = useState<string[]>(
        defaultActiveFilters ?? [],
    )

    const handleFilterClick = (_: MouseEvent, id: string) => {
        let nextActiveFilters = [...activeFilters]
        if (activeFilters.includes(id)) {
            nextActiveFilters = activeFilters.filter((filter) => filter !== id)
        } else {
            nextActiveFilters = [...activeFilters, id]
        }

        setActiveFilters(nextActiveFilters)
        onChangeFilters(nextActiveFilters)
    }

    useEffect(() => {
        if (Array.isArray(defaultActiveFilters)) {
            setActiveFilters(defaultActiveFilters)
        }
    }, [defaultActiveFilters])

    return (
        <div className={css.container}>
            {filters.map((filter) => (
                <div key={filter.id} className={css.item}>
                    <Chip
                        id={filter.id}
                        isActive={activeFilters.includes(filter.id)}
                        label={filter.label}
                        onClick={handleFilterClick}
                    />
                </div>
            ))}
        </div>
    )
}
