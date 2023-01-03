import React, {FC, useEffect, useMemo, useState} from 'react'
import classNames from 'classnames'

import {Label} from 'reactstrap'

import warningIcon from 'assets/img/icons/warning2.svg'

import Button from 'pages/common/components/button/Button'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import ToggleInput from 'pages/common/forms/ToggleInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import css from './ArticleRecommendation.less'

const getClosestMatchingHelpCenterId = (
    helpCenterList: Props['helpCenterList'],
    associatedShopifyStoreName: string
) => {
    const closestMatchingHelpCenter =
        helpCenterList.find((el) =>
            el.text
                .toString()
                .toLowerCase()
                .includes(associatedShopifyStoreName.toLowerCase())
        ) ?? helpCenterList[0]

    return closestMatchingHelpCenter.value
}

type Props = {
    isLoading?: boolean
    initialValues?: {
        isEnabled?: boolean
        selectedHelpCenterId?: number
    }
    helpCenterList: {text: string; label: string; value: number}[]
    onToggleEnabled?: (enabled: boolean) => void
    onSaveChanges: (isEnabled: boolean, helpCenterId: number) => void
    associatedShopifyStoreName: string
}

// TODO: Add "Read more" anchor
const ArticleRecommendation: FC<Props> = ({
    isLoading = false,
    helpCenterList = [],
    initialValues = {
        isEnabled: false,
        selectedHelpCenterId: undefined,
    },
    onToggleEnabled,
    onSaveChanges,
    associatedShopifyStoreName,
}) => {
    const [isEnabled, setEnabled] = useState(initialValues.isEnabled ?? false)
    const [selectedHelpCenterId, setSelectedHelpCenterId] = useState(
        initialValues.selectedHelpCenterId
    )

    useEffect(() => {
        setEnabled(initialValues.isEnabled ?? false)
    }, [initialValues.isEnabled])

    useEffect(() => {
        setSelectedHelpCenterId(initialValues.selectedHelpCenterId)
    }, [initialValues.selectedHelpCenterId])

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
        setSelectedHelpCenterId(value as number)
    }

    const handleSaveChanges = () => {
        onSaveChanges(isEnabled, selectedHelpCenterId as number)
    }

    const allowSaveChanges = useMemo(() => {
        if (isEnabled) {
            if (
                isEnabled !== initialValues.isEnabled ||
                selectedHelpCenterId !== initialValues.selectedHelpCenterId
            ) {
                return Boolean(selectedHelpCenterId)
            }
        }

        return isEnabled !== initialValues.isEnabled
    }, [isEnabled, selectedHelpCenterId, initialValues])

    useEffect(() => {
        if (isEnabled && !selectedHelpCenterId && helpCenterList.length > 0) {
            if (helpCenterList.length === 1) {
                setSelectedHelpCenterId(helpCenterList[0].value)
            } else {
                setSelectedHelpCenterId(
                    getClosestMatchingHelpCenterId(
                        helpCenterList,
                        associatedShopifyStoreName
                    )
                )
            }
        }
    }, [
        helpCenterList,
        selectedHelpCenterId,
        isEnabled,
        associatedShopifyStoreName,
    ])

    return (
        <div>
            <h3>Article recommendation</h3>
            <p>
                Relevant articles from your help center are automatically
                suggested to answer customer questions. If customers are not
                satisfied, they can ask to speak with an agent and a ticket is
                created.
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
                        isLoading={isLoading}
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
                    {helpCenterList.length > 1 && (
                        <Alert type={AlertType.Warning} className={css.alert}>
                            <div className={css.alertContent}>
                                <img src={warningIcon} alt="warning icon" />
                                <p className={css.alertMessage}>
                                    You have more than 1 help center. Ensure the
                                    desired help center is selected below.
                                </p>
                            </div>
                        </Alert>
                    )}
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
                        value={selectedHelpCenterId}
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
