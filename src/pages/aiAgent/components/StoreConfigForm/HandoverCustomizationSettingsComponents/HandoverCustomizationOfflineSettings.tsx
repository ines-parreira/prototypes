import React from 'react'

import cn from 'classnames'

import { Button } from '@gorgias/merchant-ui-kit'

import { Label } from 'gorgias-design-system/Input/Label'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './HandoverCustomizationOfflineSettings.less'

// This component will be completed in the next PRs. Until then, the hanlers are implemented only with empty functions.

const HandoverCustomizationOfflineSettings = () => {
    return (
        <div>
            <div className={css.offlineInstructionsContainer}>
                <Label
                    htmlFor="handover-customization-offline-instructions"
                    label={'Offline instructions'}
                    className={`${css.offlineInstructionsTitle} mb-2`}
                >
                    Instructions
                </Label>
                <TextArea
                    id="handover-customization-offline-instructions"
                    rows={5}
                    name="handover-customization-offline-instructions"
                    aria-label="Offline instructions"
                    placeholder={`Apologize and acknowledge the issue. Request the customers’ email address for our team to reach back.`}
                    onChange={() => {}}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    Write optional instructions for AI Agent to follow during
                    handover. AI Agent will match your tone of voice. By
                    default, it sends a fixed message.
                </Caption>
            </div>

            <div className="mb-5 d-flex align-items-center">
                <ToggleInput
                    isToggled={true}
                    name="share-business-hours-toggle"
                    id="share-business-hours-toggle"
                    aria-label="Share business hours in handover message"
                    onClick={() => {}}
                >
                    <span className="body-semibold">
                        Share business hours in handover message
                    </span>
                    <a
                        href="/app/settings/business-hours"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(css.link, css.businessHoursLink)}
                    >
                        View Business Hours
                    </a>
                </ToggleInput>
            </div>

            <section className="mb-0">
                <Button
                    type="submit"
                    color="primary"
                    className="mr-2"
                    size="small"
                    onClick={() => {}}
                >
                    Save Changes
                </Button>

                <Button
                    intent="secondary"
                    color="secondary"
                    size="small"
                    onClick={() => {}}
                >
                    Cancel
                </Button>
            </section>
        </div>
    )
}

export default HandoverCustomizationOfflineSettings
