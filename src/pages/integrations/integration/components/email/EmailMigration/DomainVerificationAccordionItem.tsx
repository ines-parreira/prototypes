import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { Card } from '@gorgias/analytics-ui-kit'
import { EmailDomain } from '@gorgias/api-queries'

import { EmailProvider } from 'models/integration/constants'
import {
    EmailMigrationOutboundVerification,
    EmailMigrationOutboundVerificationStatus,
} from 'models/integration/types'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import Button from 'pages/common/components/button/Button'

import RecordsTable from '../EmailDomainVerification/components/RecordsTable'
import EmailVerificationStatusLabel from '../EmailVerificationStatusLabel'
import useCreateDomainVerification from '../hooks/useCreateDomainVerification'
import { computeDomainVerificationStatus } from './utils'

import css from './MigrationDomainList.less'

type Props = {
    verification: EmailMigrationOutboundVerification
    onVerificationMethodSwitch: (name: string) => void
    refreshMigrationData: () => void
    isSingleSenderEnabled: boolean
}

export default function DomainVerificationAccordionItem({
    verification,
    onVerificationMethodSwitch,
    refreshMigrationData,
    isSingleSenderEnabled,
}: Props) {
    const { name } = verification
    const { isLoading, createDomainVerification } =
        useCreateDomainVerification()

    const handleSwitchMethod = (event: React.MouseEvent) => {
        event.preventDefault()
        onVerificationMethodSwitch(verification.name)
    }

    const handleVerifyDomain = async () => {
        await createDomainVerification({
            domainName: verification.name,
            dkimKeySize: 1024,
            provider: EmailProvider.Sendgrid,
        })
        refreshMigrationData()
    }

    const header = (
        <div className={css.titleContainer}>
            <div className={css.title}>
                <i className={classNames('material-icons', css.icon)}>
                    language
                </i>
                <strong>{verification.name}</strong>
            </div>
            <EmailVerificationStatusLabel
                status={computeDomainVerificationStatus(verification)}
            />
        </div>
    )

    if (
        verification.status ===
        EmailMigrationOutboundVerificationStatus.Verified
    ) {
        return <Card className={css.singleSenderVerifiedCard}>{header}</Card>
    }

    return (
        <AccordionItem key={name} id={name}>
            <AccordionHeader>{header}</AccordionHeader>
            <AccordionBody>
                <div>
                    {isEmpty(verification.domain) ? (
                        <>
                            <p>
                                Verify all of your emails at once by adding new
                                DNS records to your domain registrar.
                            </p>
                            <Button
                                intent="secondary"
                                onClick={handleVerifyDomain}
                                isLoading={isLoading}
                            >
                                Verify domain
                            </Button>
                        </>
                    ) : (
                        <>
                            <p>
                                Copy the details below as new entries in your
                                DNS records on your domain registrar account.
                                Your domain registrar is the company where your
                                domain was purchased (ie. Google Domains).
                            </p>
                            <RecordsTable
                                domain={verification.domain as EmailDomain}
                                domainName={verification.domain.name}
                            />
                        </>
                    )}
                    {isSingleSenderEnabled && (
                        <p className={css.switchMethod}>
                            {`Don't have access to your domain? `}
                            <a onClick={handleSwitchMethod} href="#">
                                Verify emails with your business address
                            </a>
                        </p>
                    )}
                </div>
            </AccordionBody>
        </AccordionItem>
    )
}
