import React, { useCallback, useMemo, useRef, useState } from 'react'

import type { List as ImmutableList } from 'immutable'
import { connect } from 'react-redux'

import { ListItem, SelectField } from '@gorgias/axiom'

import * as teamSelectors from '../../../../../state/teams/selectors'
import type { RootState } from '../../../../../state/types'

import css from './DistributeToTeamsWidget.less'

type TeamEntry = {
    team_id: string | number
    percentage: number
}

type TeamOption = {
    id: string | number
    label: string
}

type OwnProps = {
    onChange: (value: string) => void
    value: string | TeamEntry[]
    className?: string
}

type StateProps = {
    teams: ImmutableList<any>
}

type Props = OwnProps & StateProps

type TeamRowProps = {
    entry: TeamEntry
    index: number
    allTeamOptions: TeamOption[]
    selectedTeamIds: (string | number)[]
    showRemove: boolean
    onTeamChange: (index: number, option: TeamOption) => void
    onPercentageChange: (index: number, pct: number) => void
    onRemove: (index: number) => void
}

const renderOption = (option: TeamOption) => (
    <ListItem id={option.id} label={option.label} />
)

const TeamRow = React.memo(function TeamRow({
    entry,
    index,
    allTeamOptions,
    selectedTeamIds,
    showRemove,
    onTeamChange,
    onPercentageChange,
    onRemove,
}: TeamRowProps) {
    const [search, setSearch] = useState('')

    const items = useMemo(
        () =>
            allTeamOptions
                .filter((opt) => !selectedTeamIds.includes(opt.id))
                .filter(
                    (opt) =>
                        !search ||
                        opt.label.toLowerCase().includes(search.toLowerCase()),
                ),
        [allTeamOptions, selectedTeamIds, search],
    )

    const selectedOption = useMemo(
        () =>
            entry.team_id
                ? allTeamOptions.find((opt) => opt.id === entry.team_id)
                : undefined,
        [allTeamOptions, entry.team_id],
    )

    const handleTeamChange = useCallback(
        (option: TeamOption) => {
            onTeamChange(index, option)
            setSearch('')
        },
        [onTeamChange, index],
    )

    const handlePercentageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) =>
            onPercentageChange(index, parseInt(e.target.value, 10) || 0),
        [onPercentageChange, index],
    )

    const handleRemove = useCallback(() => onRemove(index), [onRemove, index])

    return (
        <div className={css.teamRow}>
            <div className={css.teamSelect}>
                <SelectField<TeamOption>
                    placeholder="Select team"
                    items={items}
                    value={selectedOption}
                    onChange={handleTeamChange}
                    isSearchable
                    searchValue={search}
                    onSearchChange={setSearch}
                    maxHeight={200}
                >
                    {renderOption}
                </SelectField>
            </div>
            <div className={css.percentageGroup}>
                <input
                    type="number"
                    value={entry.percentage || ''}
                    onChange={handlePercentageChange}
                    className={css.percentageInput}
                    min={1}
                    max={100}
                />
                <span>%</span>
            </div>
            {showRemove && (
                <button
                    type="button"
                    onClick={handleRemove}
                    className={css.removeButton}
                >
                    &times;
                </button>
            )}
        </div>
    )
})

function parseTeams(value: string | TeamEntry[]): TeamEntry[] {
    if (Array.isArray(value)) return value
    if (typeof value === 'string' && value) {
        try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return parsed
        } catch {
            // ignore parse errors
        }
    }
    return []
}

function DistributeToTeamsWidget({ teams, value, onChange, className }: Props) {
    const entries = useMemo(() => parseTeams(value), [value])
    const entriesRef = useRef(entries)
    entriesRef.current = entries

    const emitChange = useCallback(
        (updated: TeamEntry[]) => {
            onChange(JSON.stringify(updated))
        },
        [onChange],
    )

    const handleTeamChange = useCallback(
        (index: number, option: TeamOption) => {
            const updated = [...entriesRef.current]
            updated[index] = { ...updated[index], team_id: option.id }
            emitChange(updated)
        },
        [emitChange],
    )

    const handlePercentageChange = useCallback(
        (index: number, pct: number) => {
            const updated = [...entriesRef.current]
            updated[index] = { ...updated[index], percentage: pct }
            emitChange(updated)
        },
        [emitChange],
    )

    const handleRemove = useCallback(
        (index: number) => {
            const updated = entriesRef.current.filter((_, i) => i !== index)
            emitChange(updated)
        },
        [emitChange],
    )

    const handleAdd = useCallback(() => {
        emitChange([...entriesRef.current, { team_id: '', percentage: 0 }])
    }, [emitChange])

    const allTeamOptions: TeamOption[] = useMemo(
        () =>
            teams
                .map((team) => ({
                    id: team!.get('id'),
                    label: team!.get('name'),
                }))
                .toJS(),
        [teams],
    )

    const selectedTeamIdsByRow = useMemo(
        () =>
            entries.map((_, index) =>
                entries
                    .filter((_, i) => i !== index)
                    .map((e) => e.team_id)
                    .filter(Boolean),
            ),
        [entries],
    )

    const total = entries.reduce((sum, e) => sum + (e.percentage || 0), 0)
    const isValid = total === 100

    return (
        <div className={`${css.container} ${className || ''}`}>
            {entries.map((entry, index) => (
                <TeamRow
                    key={entry.team_id || `empty-${index}`}
                    entry={entry}
                    index={index}
                    allTeamOptions={allTeamOptions}
                    selectedTeamIds={selectedTeamIdsByRow[index]}
                    showRemove={entries.length > 1}
                    onTeamChange={handleTeamChange}
                    onPercentageChange={handlePercentageChange}
                    onRemove={handleRemove}
                />
            ))}
            <div className={css.footer}>
                <button
                    type="button"
                    onClick={handleAdd}
                    className={css.addButton}
                >
                    + Add team
                </button>
                <span className={isValid ? css.totalValid : css.totalInvalid}>
                    Total: {total}%
                    {isValid ? ' \u2713' : ' \u2014 must equal 100%'}
                </span>
            </div>
        </div>
    )
}

const connector = connect((state: RootState) => ({
    teams: teamSelectors.getTeams(state),
}))

export default connector(DistributeToTeamsWidget)
