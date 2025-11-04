import { KeyboardEvent, useCallback, useState } from 'react'

import { Button } from 'reactstrap'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import { useCampaignFormContext } from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import { UtmConfiguration } from 'pages/convert/campaigns/types/CampaignFormConfiguration'

import css from './AddUtm.less'

export type AddUtmProps = {
    onKeyDown: (event: any) => void
    onApply: () => void
}

const AddUtm = (props: AddUtmProps) => {
    const { utmConfiguration } = useCampaignFormContext()
    const [save, setSave] = useState(false)

    const { onApply: propsOnApply, onKeyDown: propsOnKeyDown } = props

    const {
        utmEnabled,
        onUtmEnabledChange,
        utmQueryString,
        onUtmQueryStringChange,
        onUtmApply,
        onUtmReset,
    } = utmConfiguration as UtmConfiguration

    const onApply = useCallback(async () => {
        await onUtmApply(save)
        propsOnApply()
    }, [save, propsOnApply, onUtmApply])

    const onKeyDown = async (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            await onApply()
        } else propsOnKeyDown(event)
    }

    const onReset = () => {
        onUtmReset()
    }

    return (
        <div className={css.wrapper} onKeyDown={onKeyDown}>
            <ToggleField
                className="form-item"
                value={utmEnabled}
                onChange={() => onUtmEnabledChange(!utmEnabled)}
                caption={
                    <div>
                        <span>
                            Use your own unique UTM link by adding it to the
                            field above. Need help creating a UTM?
                        </span>{' '}
                        <a href="https://ga-dev-tools.google/ga4/campaign-url-builder/">
                            Learn more
                        </a>
                    </div>
                }
                label="Enable UTM tracking"
            />
            <DEPRECATED_InputField
                label="UTM Tracking"
                className={css.formItem + ' form-item'}
                value={utmQueryString}
                onChange={onUtmQueryStringChange}
                placeholder="?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=campaignName"
                autoFocus={!utmQueryString}
                disabled={!utmEnabled}
            ></DEPRECATED_InputField>
            <CheckBox
                className={css.formItem + ' form-item'}
                isChecked={save}
                onChange={setSave}
            >
                Save as default for future URLs
            </CheckBox>
            <div className="form-item">
                <Button color={'primary'} onClick={onApply}>
                    Apply
                </Button>
                <Button color={'secondary'} onClick={onReset}>
                    Reset
                </Button>
            </div>
        </div>
    )
}

export default AddUtm
