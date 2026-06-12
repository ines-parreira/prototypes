import React, { useMemo } from 'react'
import { noop } from '@gorgias/toolkit'
import { Filter } from 'domains/reporting/pages/common/components/Filter'
import type { DropdownOption } from 'domains/reporting/pages/types'
import { DefaultExportSearch as Search } from 'pages/common/components/Search'

import type { App } from '../types'

import css from './ActionsPlatformTemplatesFilters.less'

const getDropdownOptionFromApp = (app: App): DropdownOption => {
    return {
        label: app.name,
        value: app.id,
    }
}

type Props = {
    apps: App[]
    app: App | null
    onAppChange: (app: App | null) => void
    name: string
    onNameChange: (name: string) => void
}

const ActionsPlatformTemplatesFilters = ({
    apps,
    app,
    onAppChange,
    name,
    onNameChange,
}: Props) => {
    const appOptions = useMemo<DropdownOption[]>(
        () => apps.map(getDropdownOptionFromApp),
        [apps],
    )
    const selectedAppOptions = useMemo<DropdownOption[]>(
        () => (app ? [getDropdownOptionFromApp(app)] : []),
        [app],
    )

    return (
        <div className={css.container}>
            <div className={css.leftGroup}>
                <Filter
                    filterName="App"
                    filterOptionGroups={[
                        {
                            options: appOptions,
                        },
                    ]}
                    logicalOperators={[]}
                    onChangeLogicalOperator={noop}
                    onChangeOption={(option) => {
                        onAppChange(
                            apps.find((app) => app.id === option.value) ?? null,
                        )
                    }}
                    onRemove={() => {
                        onAppChange(null)
                    }}
                    onRemoveAll={noop}
                    onSelectAll={noop}
                    selectedLogicalOperator={null}
                    selectedOptions={selectedAppOptions}
                    isMultiple={false}
                    showQuickSelect={false}
                />
            </div>
            <Search
                value={name}
                onChange={onNameChange}
                placeholder="Search name"
                className={css.search}
            />
        </div>
    )
}

export { ActionsPlatformTemplatesFilters }
