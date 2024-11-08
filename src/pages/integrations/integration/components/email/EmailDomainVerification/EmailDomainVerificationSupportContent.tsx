import {SelectInput} from '@gorgias/merchant-ui-kit'
import React from 'react'

import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import {
    SupportContentDropdownOption,
    supportContentDropdownOptions,
} from './constants'
import css from './EmailDomainVerificationSupportContent.less'
import SupportContentLearnMore from './SupportContentLearnMore'

export default function EmailDomainVerificationSupportContent() {
    const [selectedOption, setSelectedOption] =
        React.useState<SupportContentDropdownOption>(
            supportContentDropdownOptions[0]
        )

    return (
        <div className={css.container}>
            <div>
                <SelectInput<SupportContentDropdownOption>
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
                                        url={'https://mxtoolbox.com/'}
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
    )
}
