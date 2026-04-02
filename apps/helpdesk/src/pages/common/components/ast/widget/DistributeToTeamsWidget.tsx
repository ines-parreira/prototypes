import React, { useCallback, useMemo } from 'react'

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

    const emitChange = useCallback(
        (updated: TeamEntry[]) => {
            onChange(JSON.stringify(updated))
        },
        [onChange],
    )

    const handleTeamChange = useCallback(
        (index: number, option: TeamOption) => {
            const updated = [...entries]
            updated[index] = { ...updated[index], team_id: option.id }
            emitChange(updated)
        },
        [entries, emitChange],
    )

    const handlePercentageChange = useCallback(
        (index: number, pct: number) => {
            const updated = [...entries]
            updated[index] = { ...updated[index], percentage: pct }
            emitChange(updated)
        },
        [entries, emitChange],
    )

    const handleRemove = useCallback(
        (index: number) => {
            const updated = entries.filter((_, i) => i !== index)
            emitChange(updated)
        },
        [entries, emitChange],
    )

    const handleAdd = useCallback(() => {
        emitChange([...entries, { team_id: '', percentage: 0 }])
    }, [entries, emitChange])

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

    const getSelectedOption = useCallback(
        (teamId: string | number): TeamOption | undefined => {
            if (!teamId) return undefined
            return allTeamOptions.find((opt) => opt.id === teamId)
        },
        [allTeamOptions],
    )

    const getOptionsForRow = useCallback(
        (index: number): TeamOption[] => {
            const selectedIds = entries
                .filter((_, i) => i !== index)
                .map((e) => e.team_id)
                .filter(Boolean)
            return allTeamOptions.filter(
                (opt: TeamOption) => !selectedIds.includes(opt.id),
            )
        },
        [entries, allTeamOptions],
    )

    const total = entries.reduce((sum, e) => sum + (e.percentage || 0), 0)
    const isValid = total === 100

    return (
        <div className={`${css.container} ${className || ''}`}>
            {entries.map((entry, index) => (
                <div key={index} className={css.teamRow}>
                    <div className={css.teamSelect}>
                        <SelectField<TeamOption>
                            placeholder="Select team"
                            items={getOptionsForRow(index)}
                            value={getSelectedOption(entry.team_id)}
                            onChange={(option: TeamOption) =>
                                handleTeamChange(index, option)
                            }
                        >
                            {(option: TeamOption) => (
                                <ListItem id={option.id} label={option.label} />
                            )}
                        </SelectField>
                    </div>
                    <div className={css.percentageGroup}>
                        <input
                            type="number"
                            value={entry.percentage || ''}
                            onChange={(e) =>
                                handlePercentageChange(
                                    index,
                                    parseInt(e.target.value, 10) || 0,
                                )
                            }
                            className={css.percentageInput}
                            min={1}
                            max={100}
                        />
                        <span>%</span>
                    </div>
                    {entries.length > 1 && (
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className={css.removeButton}
                        >
                            &times;
                        </button>
                    )}
                </div>
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
