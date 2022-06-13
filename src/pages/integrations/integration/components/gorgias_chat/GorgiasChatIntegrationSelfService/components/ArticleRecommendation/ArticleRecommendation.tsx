import React, {FC, useEffect, useMemo, useState} from 'react'
import classNames from 'classnames'

import {Label} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import {AlertType} from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import ToggleInput from 'pages/common/forms/ToggleInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {SelectableOption} from 'pages/common/forms/SelectField/types'

import css from './ArticleRecommendation.less'

type Props = {
    isLoading?: boolean
    initialValues?: {
        isEnabled?: boolean
        selectedHelpCenter?: string
    }
    helpCenterList: (SelectableOption & {id: number})[]
    onToggleEnabled?: (enabled: boolean) => void
    onSaveChanges: (isEnabled: boolean, helpCenterId: number) => void
}

// TODO: Add "Read more" anchor
const ArticleRecommendation: FC<Props> = ({
    isLoading = false,
    helpCenterList = [],
    initialValues = {
        isEnabled: false,
        selectedHelpCenter: '',
    },
    onToggleEnabled,
    onSaveChanges,
}) => {
    const [isEnabled, setEnabled] = useState(initialValues.isEnabled ?? false)
    const [selectedHelpCenter, setSelectedHelpCenter] = useState(
        initialValues.selectedHelpCenter ?? ''
    )

    useEffect(() => {
        setEnabled(initialValues.isEnabled ?? false)
    }, [initialValues.isEnabled])

    useEffect(() => {
        setSelectedHelpCenter(initialValues.selectedHelpCenter ?? '')
    }, [initialValues.selectedHelpCenter])

    const handleToggleInput = (nextValue: boolean) => {
        if (helpCenterList.length === 0) {
            return
        }

        setEnabled(nextValue)
        onToggleEnabled && onToggleEnabled(nextValue)
    }

    const handleClickLabel = () => {
        handleToggleInput(!isEnabled)
    }

    const handleSelectHelpCenter = (value: string | number) => {
        setSelectedHelpCenter(value.toString())
    }

    const handleSaveChanges = () => {
        const helpCenterId = (
            helpCenterList.find((el) => el.value === selectedHelpCenter) as {
                id: number
            }
        ).id
        onSaveChanges(isEnabled, helpCenterId)
    }

    const allowSaveChanges = useMemo(() => {
        if (isEnabled) {
            if (
                isEnabled !== initialValues.isEnabled ||
                selectedHelpCenter !== initialValues.selectedHelpCenter
            ) {
                return selectedHelpCenter !== ''
            }
        }

        return isEnabled !== initialValues.isEnabled
    }, [isEnabled, selectedHelpCenter, initialValues])

    useEffect(() => {
        if (
            isEnabled &&
            selectedHelpCenter === '' &&
            helpCenterList.length === 1
        ) {
            setSelectedHelpCenter(helpCenterList[0].value.toString())
        }
    }, [helpCenterList, selectedHelpCenter, isEnabled])

    return (
        <div>
            <h3>Article recommendation</h3>
            <p>
                Enable help center article recommendation in chat to answer your
                customers' questions. If customers are not satisfied with the
                recommendation, they can ask to speak with an agent.
            </p>
            {!isLoading && helpCenterList.length === 0 && (
                <LinkAlert
                    icon
                    actionHref="/app/settings/help-center/new"
                    actionLabel="Create Help Center"
                    type={AlertType.Info}
                >
                    Create a Help Center and add articles to enable this
                    feature.
                </LinkAlert>
            )}
            <div className={css['switch-container']}>
                <span>
                    <ToggleInput
                        aria-label="Enable article recommendation"
                        aria-disabled={helpCenterList.length === 0}
                        id="article-recommendation-switch"
                        isDisabled={helpCenterList.length === 0}
                        isToggled={isEnabled}
                        onClick={handleToggleInput}
                    />
                </span>
                <Label
                    className={classNames('control-label ml-2', {
                        [css['label-disabled']]: helpCenterList.length === 0,
                    })}
                    htmlFor="article-recommendation-switch"
                    onClick={handleClickLabel}
                >
                    <p>Enable article recommendation</p>
                </Label>
            </div>
            {isEnabled && (
                <div>
                    <Label
                        htmlFor="help-center-select"
                        className="control-label"
                    >
                        Help Center
                    </Label>
                    <SelectField
                        fullWidth
                        id="help-center-select"
                        options={helpCenterList}
                        placeholder="Select an option"
                        value={selectedHelpCenter}
                        onChange={handleSelectHelpCenter}
                    />
                </div>
            )}
            <div className={css['footer']}>
                <Button
                    aria-label="Save changes"
                    aria-disabled={!allowSaveChanges}
                    isDisabled={!allowSaveChanges}
                    onClick={handleSaveChanges}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    )
}

export default ArticleRecommendation
