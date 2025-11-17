import type { FormEvent } from 'react'
import type React from 'react'
import { useCallback } from 'react'

import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'
import PageHeader from 'pages/common/components/PageHeader'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import CheckBox from 'pages/common/forms/CheckBox'
import NumberInput from 'pages/common/forms/input/NumberInput'
import autoMergeSettingsCss from 'pages/settings/autoMerge/AutoMergeSettings.less'
import {
    defaultAutoMergeSettings,
    MAX_MERGING_WINDOW_DAYS,
} from 'pages/settings/autoMerge/constants'
import useAutoMerge from 'pages/settings/autoMerge/hooks/useAutoMerge'
import useAutoMergeSettings from 'pages/settings/autoMerge/hooks/useAutoMergeSettings'
import css from 'pages/settings/settings.less'

export default function AutoMergeSettings() {
    const { initialAutoMergeSettings, saveAutoMergeSettings } =
        useAutoMergeSettings()
    const autoMergeSettings = useAutoMerge(initialAutoMergeSettings)

    const hasUnsavedChanges =
        initialAutoMergeSettings.enabled !== autoMergeSettings.enabled ||
        initialAutoMergeSettings.merging_window_days !==
            autoMergeSettings.merging_window_days

    const handleSubmit = useCallback(
        (event?: FormEvent<HTMLFormElement>) => {
            if (event) {
                event.preventDefault()
            }

            void saveAutoMergeSettings(autoMergeSettings)
        },
        [autoMergeSettings, saveAutoMergeSettings],
    )

    const handleOnClick = (event: React.FormEvent<HTMLInputElement>) => {
        event.currentTarget.select()
    }

    return (
        <div className="full-width">
            <UnsavedChangesPrompt
                onSave={() => handleSubmit()}
                when={hasUnsavedChanges}
            />
            <PageHeader title="Auto-merge" />
            <form
                className={classNames(css.contentWrapper, css.pageContainer)}
                onSubmit={handleSubmit}
            >
                <div className={autoMergeSettingsCss.marginBottomMedium}>
                    <CheckBox
                        isChecked={autoMergeSettings.enabled}
                        onChange={(enabled) => {
                            autoMergeSettings.onChangeEnabled(enabled)
                        }}
                        caption={
                            <span
                                className={autoMergeSettingsCss.captionWrapper}
                            >
                                When enabled, this will auto-merge any new
                                tickets that are from the same customer, open
                                and are from an eligible channel.
                                <br />
                                <a
                                    href={'https://link.gorgias.com/b5y'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Read more
                                </a>{' '}
                                about auto-merge.
                            </span>
                        }
                    >
                        Auto-merge tickets
                    </CheckBox>

                    <DropdownItemLabel
                        className={autoMergeSettingsCss.marginTopSmall}
                    >
                        <div
                            className={classNames({
                                [autoMergeSettingsCss.isDisabled]:
                                    !autoMergeSettings.enabled,
                            })}
                        >
                            Maximum difference between ticket creation dates:
                        </div>
                        <div
                            className={classNames({
                                [autoMergeSettingsCss.isDisabled]:
                                    !autoMergeSettings.enabled,
                            })}
                        >
                            <NumberInput
                                min={1}
                                max={MAX_MERGING_WINDOW_DAYS}
                                step={1}
                                hasControls
                                isDisabled={!autoMergeSettings.enabled}
                                className={autoMergeSettingsCss.inputWrapper}
                                value={autoMergeSettings.merging_window_days}
                                onChange={(merging_window_days) => {
                                    autoMergeSettings.onChangeMergingWindowDays(
                                        Math.min(
                                            merging_window_days ||
                                                defaultAutoMergeSettings.merging_window_days,
                                            MAX_MERGING_WINDOW_DAYS,
                                        ),
                                    )
                                }}
                                onFocus={handleOnClick}
                                onClick={handleOnClick}
                            />
                            &nbsp;&nbsp;days
                        </div>
                    </DropdownItemLabel>
                </div>

                <Button
                    intent="primary"
                    type="submit"
                    isDisabled={!hasUnsavedChanges}
                >
                    Save Changes
                </Button>
            </form>
        </div>
    )
}
