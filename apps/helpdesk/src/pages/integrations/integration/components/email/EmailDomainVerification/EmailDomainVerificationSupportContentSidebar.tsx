import React, { useState } from 'react'

import { Box, SelectField } from '@gorgias/axiom'

import IconLink from 'core/ui/components/IconLink'
import SettingsSidebar from 'pages/settings/SettingsSidebar'

import { supportContentDropdownOptions } from './constants'

import css from './EmailDomainVerificationSupportContentSidebar.less'

export default function EmailDomainVerificationSupportContentSidebar() {
    const [selectedOption, setSelectedOption] = useState(
        supportContentDropdownOptions[0],
    )

    return (
        <SettingsSidebar className={css.sidebar}>
            <div className={css.container}>
                <div>
                    <SelectField
                        label="Domain verification guide"
                        options={supportContentDropdownOptions}
                        selectedOption={selectedOption}
                        optionMapper={(option) => ({ value: option.label })}
                        onChange={setSelectedOption}
                    />
                </div>

                <div
                    data-candu-id={`email-domain-verification-support-content-${selectedOption.value || 'default'}`}
                />

                <Box gap="var(--layout-spacing-m)">
                    <IconLink
                        icon="menu_book"
                        href="https://link.gorgias.com/a6c23e"
                        content="Verify Your Email Domain"
                    />
                    <IconLink
                        icon="menu_book"
                        href="https://link.gorgias.com/7e4889"
                        content="Domain Verification FAQs"
                    />
                </Box>
            </div>
        </SettingsSidebar>
    )
}
