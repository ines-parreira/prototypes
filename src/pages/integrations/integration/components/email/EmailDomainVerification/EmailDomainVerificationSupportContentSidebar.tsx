import {SelectField} from '@gorgias/merchant-ui-kit'
import React, {useState} from 'react'

import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import SettingsSidebar from 'pages/settings/SettingsSidebar'

import {supportContentDropdownOptions} from './constants'
import css from './EmailDomainVerificationSupportContentSidebar.less'
import SupportContentLearnMore from './SupportContentLearnMore'

export default function EmailDomainVerificationSupportContentSidebar() {
    const [selectedOption, setSelectedOption] = useState(
        supportContentDropdownOptions[0]
    )

    return (
        <SettingsSidebar className={css.sidebar}>
            <div className={css.container}>
                <div>
                    <SelectField
                        label="Domain Verification Guide"
                        options={supportContentDropdownOptions}
                        selectedOption={selectedOption}
                        optionMapper={(option) => ({value: option.label})}
                        onChange={setSelectedOption}
                    />
                </div>

                <div
                    data-candu-id={`email-domain-verification-support-content-${selectedOption.value || 'default'}`}
                />

                <Accordion defaultExpandedItem="support-content-accordion-item">
                    <AccordionItem id="support-content-accordion-item">
                        <AccordionHeader>
                            <span className={css.accordionTitle}>
                                Need more help?
                            </span>
                        </AccordionHeader>
                        <AccordionBody>
                            <div className={css.supportContentLinks}>
                                {!selectedOption.value && (
                                    <>
                                        <SupportContentLearnMore
                                            url={
                                                'https://mxtoolbox.com/dmarc.aspx'
                                            }
                                        >
                                            Identify Your Domain Registrar
                                        </SupportContentLearnMore>
                                        <SupportContentLearnMore
                                            url={
                                                'https://docs.gorgias.com/en-US/adding-values-to-a-domain-registrar-414708'
                                            }
                                        >
                                            Adding values to a Domain Registrar
                                        </SupportContentLearnMore>
                                    </>
                                )}
                                {selectedOption.learnMoreURL && (
                                    <SupportContentLearnMore
                                        url={selectedOption.learnMoreURL}
                                    >
                                        {selectedOption.label} Support
                                    </SupportContentLearnMore>
                                )}
                                <SupportContentLearnMore
                                    url={
                                        'https://docs.gorgias.com/en-US/email-domain-verification-101-81757'
                                    }
                                >
                                    Email Domain Verification 101
                                </SupportContentLearnMore>
                                <SupportContentLearnMore
                                    url={
                                        'https://docs.gorgias.com/en-US/domain-verification-faqs-404374'
                                    }
                                >
                                    Domain Verification FAQs
                                </SupportContentLearnMore>
                            </div>
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            </div>
        </SettingsSidebar>
    )
}
