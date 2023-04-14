import React from 'react'
import {isEmpty} from 'lodash'
import classNames from 'classnames'
import {EmailMigrationOutboundVerification} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import RecordsTable from '../EmailDomainVerification/components/RecordsTable'
import EmailVerificationStatusLabel from '../EmailVerificationStatusLabel'
import useCreateDomainVerification from '../hooks/useCreateDomainVerification'
import {computeDomainVerificationStatus} from './utils'

import css from './MigrationDomainList.less'

type Props = {
    verification: EmailMigrationOutboundVerification
    onVerificationMethodSwitch: (name: string) => void
    refreshMigrationData: () => void
}

export default function DomainVerificationAccordionItem({
    verification,
    // onVerificationMethodSwitch,
    refreshMigrationData,
}: Props) {
    const {name} = verification
    const {isLoading, createDomainVerification} = useCreateDomainVerification()

    // const handleSwitchMethod = (event: React.MouseEvent) => {
    //     event.preventDefault()
    //     onVerificationMethodSwitch(verification.name)
    // }

    const handleVerifyDomain = async () => {
        await createDomainVerification(verification.name, 1024, 'sendgrid')
        refreshMigrationData()
    }

    return (
        <AccordionItem key={name} id={name}>
            <AccordionHeader>
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
            </AccordionHeader>
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
                                records={
                                    verification.domain.data.sending_dns_records
                                }
                                provider={verification.domain.provider}
                            />
                        </>
                    )}
                    {/* TODO uncomment when single sender verification is ready */}
                    {/* <p className={css.switchMethod}>
                        Don't have access to your domain?{' '}
                        <a onClick={handleSwitchMethod} href="#">
                            Verify emails with your business address
                        </a>
                    </p> */}
                </div>
            </AccordionBody>
        </AccordionItem>
    )
}
