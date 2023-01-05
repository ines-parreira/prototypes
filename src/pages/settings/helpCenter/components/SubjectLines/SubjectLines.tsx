import React, {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import _uniqueId from 'lodash/uniqueId'
import useAppSelector from 'hooks/useAppSelector'
import {
    HelpCenter,
    LocaleCode,
    UpdateContactForm,
} from 'models/helpCenter/types'
import {IntegrationType} from 'models/integration/constants'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {ShopifyIntegration} from 'models/integration/types'
import {fetchSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import Button from 'pages/common/components/button/Button'
import CheckBox from 'pages/common/forms/CheckBox'
import SubjectLine, {SubjectLineProps} from '../SubjectLine/SubjectLine'

import {
    LINE_HEIGHT,
    sspFlowTranslations,
    VISIBLE_LINES,
    MAX_SUBJECT_LINES,
    MAX_CHARACTERS,
} from './constants'
import css from './SubjectLines.less'

type SubjectLinesProps = {
    helpCenter: HelpCenter
    contactForm: UpdateContactForm
    currentLocale: LocaleCode
    updateContactForm: React.Dispatch<React.SetStateAction<UpdateContactForm>>
    translationsLoaded: boolean
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
}

const SubjectLines = ({
    helpCenter,
    currentLocale,
    contactForm,
    updateContactForm,
    translationsLoaded,
    setIsDirty,
}: SubjectLinesProps) => {
    const integrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify)
    )

    const [sspConfiguration, setSspConfiguration] =
        useState<SelfServiceConfiguration | null>(null)

    const [subjectLinesWithId, setSubjectLinesWithId] = useState<
        {id: string; value: string}[]
    >([])
    const [subjectLinesExpanded, setSubjectLinesExpanded] = useState(false)

    const shopifyIntegration = integrations.find(
        (integration) => integration.name === helpCenter.shop_name
    )

    const [{loading: loadingSSP}, fetchGlobalSsp] = useAsyncFn(async () => {
        if (shopifyIntegration && helpCenter.shop_name) {
            try {
                const shopifyIntegrationId = shopifyIntegration.id

                const sspConfiguration = await fetchSelfServiceConfiguration(
                    `${shopifyIntegrationId}`
                )

                setSspConfiguration(sspConfiguration)
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    useEffect(() => void fetchGlobalSsp(), [fetchGlobalSsp])

    // Set the subject lines. If they aren't present, use the SSP configuration to set the defaults.
    useEffect(() => {
        // Wait for the contactFrom
        if (!translationsLoaded) {
            return
        }

        // Wait for the SSP configuration if the contact form doesn't have subject lines
        if (!contactForm.subject_lines && loadingSSP) {
            return
        }

        const supportedLocales = helpCenter.supported_locales
        const subjectLines: UpdateContactForm['subject_lines'] = {}

        supportedLocales.forEach((locale) => {
            // If the subject lines are already set for the locale, use them
            if (
                contactForm.subject_lines &&
                contactForm.subject_lines[locale]
            ) {
                subjectLines[locale] = contactForm.subject_lines[locale]
                return
            }

            subjectLines[locale] = {
                options: [],
                allow_other: true,
            }

            // If the subject lines are not set for the locale, but we have the SSP enabled, add the enabled flows
            if (sspConfiguration && !sspConfiguration.deactivated_datetime) {
                if (sspConfiguration.track_order_policy.enabled) {
                    subjectLines[locale].options.push(
                        sspFlowTranslations[locale].contactSubjectTrack
                    )
                }

                if (sspConfiguration.report_issue_policy.enabled) {
                    subjectLines[locale].options.push(
                        sspFlowTranslations[locale].contactSubjectReportIssue
                    )
                }

                if (sspConfiguration.return_order_policy.enabled) {
                    subjectLines[locale].options.push(
                        sspFlowTranslations[locale].contactSubjectReturn
                    )
                }

                if (sspConfiguration.cancel_order_policy.enabled) {
                    subjectLines[locale].options.push(
                        sspFlowTranslations[locale].contactSubjectCancelOrder
                    )
                }

                // If SSP is enabled, but no flows are enabled, add the default flows
                if (subjectLines[locale].options.length === 0) {
                    subjectLines[locale].options.push(
                        sspFlowTranslations[locale].contactSubjectTrack,
                        sspFlowTranslations[locale].contactSubjectReportIssue,
                        sspFlowTranslations[locale].contactSubjectReturn,
                        sspFlowTranslations[locale].contactSubjectCancelOrder
                    )
                }
            } else if (!loadingSSP) {
                // If the subject lines are not set for the locale, and we don't have the SSP enabled, add the default flows
                subjectLines[locale].options.push(
                    sspFlowTranslations[locale].contactSubjectTrack,
                    sspFlowTranslations[locale].contactSubjectReportIssue,
                    sspFlowTranslations[locale].contactSubjectReturn,
                    sspFlowTranslations[locale].contactSubjectCancelOrder
                )
            }
        })

        updateContactForm((prevContactForm) => ({
            ...prevContactForm,
            subject_lines: {
                ...prevContactForm.subject_lines,
                ...subjectLines,
            },
        }))

        if (!subjectLines[currentLocale]) {
            return
        }

        setSubjectLinesWithId(
            subjectLines[currentLocale].options.map((option) => ({
                id: _uniqueId('subject-line-'),
                value: option,
            }))
        )

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translationsLoaded, currentLocale, loadingSSP])

    // Update the contact form when the subject lines change
    useEffect(() => {
        if (!contactForm.subject_lines) {
            return
        }

        updateContactForm((prevContactForm) => ({
            ...prevContactForm,
            subject_lines: {
                ...prevContactForm.subject_lines,
                [currentLocale]: {
                    allow_other:
                        prevContactForm.subject_lines?.[currentLocale]
                            ?.allow_other ?? true,
                    options: subjectLinesWithId.map(
                        (subjectLine) => subjectLine.value
                    ),
                },
            },
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectLinesWithId])

    const handleOnChange = (newValue: string, id: string) => {
        const subjectLines = [...subjectLinesWithId]
        const subjectLineIndex = subjectLines.findIndex(
            (subjectLine) => subjectLine.id === id
        )

        if (subjectLineIndex === -1 || newValue.length > MAX_CHARACTERS) {
            return
        }

        subjectLines[subjectLineIndex].value = newValue

        setSubjectLinesWithId(subjectLines)
        setIsDirty(true)
    }

    const handleOnDelete = (id: string) => {
        const subjectLines = [...subjectLinesWithId]
        const subjectLineIndex = subjectLines.findIndex(
            (subjectLine) => subjectLine.id === id
        )

        if (subjectLineIndex === -1) {
            return
        }

        subjectLines.splice(subjectLineIndex, 1)

        setSubjectLinesWithId(subjectLines)
        setIsDirty(true)
    }

    const handleOnAdd = () => {
        setSubjectLinesWithId((prevSubjectLines) => [
            ...(prevSubjectLines || []),
            {id: _uniqueId('subject-line-'), value: ''},
        ])
        setSubjectLinesExpanded(true)
        setIsDirty(true)
    }

    const handleOnMoveEntity = (dragIndex: number, hoverIndex: number) => {
        const subjectLines = [...subjectLinesWithId]
        const dragSubjectLine = subjectLines[dragIndex]

        subjectLines.splice(dragIndex, 1)
        subjectLines.splice(hoverIndex, 0, dragSubjectLine)

        setSubjectLinesWithId(subjectLines)
        setIsDirty(true)
    }

    const handleOnToggleCheckbox = (value: boolean) => {
        const subjectLines: UpdateContactForm['subject_lines'] = {
            ...contactForm.subject_lines,
            [currentLocale]: {
                options:
                    contactForm.subject_lines?.[currentLocale].options || [],
                allow_other: value,
            },
        }

        updateContactForm((prevContactForm) => ({
            ...prevContactForm,
            subject_lines: {
                ...prevContactForm.subject_lines,
                ...subjectLines,
            },
        }))
        setIsDirty(true)
    }

    return (
        <div className={css.wrapper}>
            <div className={css.title}>
                Edit the subject of the contact form
            </div>
            <div className={css.description}>
                Here is a default list of subject lines. If there is no subject
                added, user can freely type any subject.
            </div>
            {subjectLinesWithId.length > 0 && (
                <CheckBox
                    isChecked={
                        contactForm.subject_lines?.[currentLocale]?.allow_other
                    }
                    onChange={handleOnToggleCheckbox}
                    className={css.checkbox}
                >
                    Allow custom input using “Other”
                </CheckBox>
            )}

            <div
                className={css.subjectLinesWrapper}
                style={{
                    maxHeight: subjectLinesExpanded
                        ? `${subjectLinesWithId.length * LINE_HEIGHT}px`
                        : `${VISIBLE_LINES * LINE_HEIGHT}px`,
                }}
                onMouseDown={() => setSubjectLinesExpanded(true)}
            >
                {subjectLinesWithId?.map((line, index) => {
                    const subjectLine: SubjectLineProps = {
                        value: line.value,
                        position: index,
                        onDelete: () => handleOnDelete(line.id),
                        onChange: (value) => handleOnChange(value, line.id),
                        onMoveEntity: handleOnMoveEntity,
                    }
                    return (
                        <SubjectLine
                            key={`subjectLine-${line.id}`}
                            {...subjectLine}
                        />
                    )
                })}
            </div>
            <div className={css.footer}>
                <Button
                    intent="secondary"
                    onClick={handleOnAdd}
                    className={css.button}
                    isDisabled={subjectLinesWithId.length >= MAX_SUBJECT_LINES}
                >
                    <i className="material-icons">add</i>
                    <span>Add Subject Line</span>
                </Button>
                {subjectLinesWithId?.length > 5 && (
                    <div
                        className={css.textButton}
                        onMouseDown={(event) => {
                            event.stopPropagation()
                            setSubjectLinesExpanded((prev) => !prev)
                        }}
                    >
                        {subjectLinesExpanded ? 'Show less' : 'Show all'}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubjectLines
