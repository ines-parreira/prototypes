import { Link } from 'react-router-dom'

import { LegacyBadge as Badge, CheckBoxField } from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { aiAgentRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import SectionHeader from 'pages/common/components/SectionHeader/SectionHeader'

import css from './AIAutofill.less'

interface AIAutofillProps {
    value: boolean
    onChange: (value: boolean) => void
}

export default function AIAutofill({ value, onChange }: AIAutofillProps) {
    const { hasAccess } = useAiAgentAccess()

    return (
        <div className={css.container}>
            <div className={css.headerWithBadge}>
                <SectionHeader title="AI Autofill" />
                {!hasAccess && (
                    <Badge type="magenta" upperCase>
                        <i className="material-icons">auto_awesome</i>
                        Upgrade
                    </Badge>
                )}
            </div>
            {hasAccess ? (
                <p className="mb-2">
                    Let AI Agent autofill this ticket field. Manage{' '}
                    <Link to={aiAgentRoutes.overview}>AI Agent settings</Link>.
                </p>
            ) : (
                <>
                    <p className="mb-2">
                        Let AI Agent autofill this ticket field.
                    </p>
                    <Link
                        className={css.aiAgentInfo}
                        to={aiAgentRoutes.overview}
                    >
                        <i className="material-icons mr-1">info</i>
                        Learn more about AI Agent
                    </Link>
                </>
            )}
            <div className={css.checkboxWrapper}>
                <CheckBoxField
                    label="Autofill ticket field"
                    value={value}
                    onChange={onChange}
                    isDisabled={!hasAccess}
                />
            </div>
        </div>
    )
}
