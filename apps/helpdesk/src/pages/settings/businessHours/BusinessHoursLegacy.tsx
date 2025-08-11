import { ReactNode, useEffect, useState } from 'react'

import classnames from 'classnames'
import { Link } from 'react-router-dom'
import { Col, Form, Label, Row } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import PageHeader from 'pages/common/components/PageHeader'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import { submitSetting } from 'state/currentAccount/actions'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import {
    AccountSettingBusinessHours,
    AccountSettingType,
    BusinessHour,
} from 'state/currentAccount/types'
import { getMomentTimezoneNames } from 'utils/date'

import BusinessHoursForm from './BusinessHoursForm'
import { DEFAULT_BUSINESS_HOUR, MAX_BUSINESS_HOURS } from './constants'

import settingsCss from '../settings.less'
import css from './BusinessHours.less'

const BusinessHoursLegacy = ({ children }: { children?: ReactNode }) => {
    const [items, setItems] = useState([DEFAULT_BUSINESS_HOUR])
    const [timezone, setTimezone] = useState<string>('UTC')
    const [loading, setLoading] = useState<boolean>(false)

    const dispatch = useAppDispatch()
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)

    useEffect(() => {
        if (!!businessHoursSettings) {
            setTimezone(businessHoursSettings.data.timezone)
            setItems(businessHoursSettings.data.business_hours)
        }
    }, [businessHoursSettings])

    const handleChange = (index: number, data?: BusinessHour) => {
        const newItems = [...items]
        if (!!data) {
            newItems.splice(index, 1, data)
        } else {
            newItems.splice(index, 1)
        }
        setItems(newItems)
    }

    const onSubmit = async (evt: Event) => {
        evt.preventDefault()
        setLoading(true)

        if (!!businessHoursSettings) {
            const setting: AccountSettingBusinessHours = {
                id: businessHoursSettings.id,
                type: AccountSettingType.BusinessHours,
                data: {
                    timezone,
                    business_hours: items,
                },
            }

            try {
                await dispatch(submitSetting(setting))
            } catch {
                // pass
            }

            setLoading(false)
        }
    }

    const addBusinessHours = () => {
        if (items.length >= MAX_BUSINESS_HOURS) {
            return
        }

        setItems([...items, DEFAULT_BUSINESS_HOUR])
    }

    return (
        <div className="full-width">
            <PageHeader title="Business hours" />

            <div className={settingsCss.pageContainer}>
                <div
                    className={classnames(
                        'body-regular',
                        settingsCss.contentWrapper,
                        'mb-5',
                    )}
                >
                    <div className={settingsCss.mb32}>
                        <p>
                            Let customers know when your team is online.
                            <br />
                            This way, you can set different auto-responders in
                            the rules based on when your team is working.
                        </p>
                        <p>
                            The appearance of your{' '}
                            <Link to="/app/settings/channels/gorgias_chat">
                                Chat integrations
                            </Link>{' '}
                            will change when outside business hours.
                        </p>
                    </div>

                    <Form onSubmit={onSubmit as any}>
                        <Row>
                            <Col>
                                <div
                                    className={classnames(
                                        settingsCss.inputField,
                                        settingsCss.mb32,
                                    )}
                                >
                                    <Label
                                        className={classnames(
                                            'control-label',
                                            css.businessHoursLabelWrapper,
                                        )}
                                    >
                                        Business hours
                                    </Label>
                                    {items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={classnames(
                                                'flex',
                                                settingsCss.mb24,
                                            )}
                                        >
                                            <BusinessHoursForm
                                                businessHour={item}
                                                onChange={(data) =>
                                                    handleChange(idx, data)
                                                }
                                            />
                                            <div
                                                className={css.deleteButton}
                                                onClick={() =>
                                                    handleChange(idx)
                                                }
                                            >
                                                <i className="material-icons red">
                                                    clear
                                                </i>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        intent="secondary"
                                        onClick={addBusinessHours}
                                        leadingIcon="add"
                                    >
                                        Add business hours
                                    </Button>
                                </div>

                                <DEPRECATED_InputField
                                    type="select"
                                    name="timezone"
                                    label="Time zone"
                                    value={timezone}
                                    onChange={(timezone) =>
                                        setTimezone(timezone)
                                    }
                                    className={classnames(
                                        settingsCss.inputField,
                                        settingsCss.mb40,
                                    )}
                                >
                                    {getMomentTimezoneNames().map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </DEPRECATED_InputField>
                            </Col>
                        </Row>

                        <Button
                            type="submit"
                            isLoading={loading}
                            isDisabled={loading}
                        >
                            Save changes
                        </Button>
                    </Form>
                </div>
                {children}
            </div>
        </div>
    )
}

export default BusinessHoursLegacy
