import _noop from 'lodash/noop'
import React, {useMemo} from 'react'

import Search from 'pages/common/components/Search'
import Filter from 'pages/stats/common/components/Filter'
import {DropdownOption} from 'pages/stats/types'

import {App} from '../types'

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
        [apps]
    )
    const selectedAppOptions = useMemo<DropdownOption[]>(
        () => (app ? [getDropdownOptionFromApp(app)] : []),
        [app]
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
                    onChangeLogicalOperator={_noop}
                    onChangeOption={(option) => {
                        onAppChange(
                            apps.find((app) => app.id === option.value) ?? null
                        )
                    }}
                    onRemove={() => {
                        onAppChange(null)
                    }}
                    onRemoveAll={_noop}
                    onSelectAll={_noop}
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

export default ActionsPlatformTemplatesFilters
