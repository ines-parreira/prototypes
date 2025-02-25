import React from 'react'

import { render, screen } from '@testing-library/react'

import { TaxIdRows } from 'pages/settings/new_billing/views/PaymentInformationView/components/TaxIdRows'
import { TaxIdType, TaxIdVerificationStatus } from 'state/billing/types'

describe('TaxIdRows', () => {
    it('should render Sales Tax ID row when country is empty string', () => {
        render(<TaxIdRows taxIDs={undefined} address={{ country: '' }} />)
        expect(screen.getByText('Sales Tax ID:')).toBeVisible()
    })

    it('should render Sales Tax ID row when country is undefined', () => {
        render(<TaxIdRows taxIDs={undefined} address={{}} />)
        expect(screen.getByText('Sales Tax ID:')).toBeVisible()
    })

    it('should render Sales Tax ID row when country is null', () => {
        render(<TaxIdRows taxIDs={undefined} address={{ country: null }} />)
        expect(screen.getByText('Sales Tax ID:')).toBeVisible()
    })

    it('should render GST/HST for Canada with no province', () => {
        render(
            <TaxIdRows
                taxIDs={{
                    [TaxIdType.ca_gst_hst]: {
                        value: '123456789RT0002',
                        type: TaxIdType.ca_gst_hst,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                }}
                address={{ country: 'CA' }}
            />,
        )
        expect(screen.getByText('GST/HST ID:')).toBeVisible()
        expect(screen.getByText('123456789RT0002')).toBeVisible()
    })

    it('should render GST/HST and QST ID for Canada with province QC', () => {
        render(
            <TaxIdRows
                taxIDs={{
                    [TaxIdType.ca_gst_hst]: {
                        value: '123456789RT0002',
                        type: TaxIdType.ca_gst_hst,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                    [TaxIdType.ca_qst]: {
                        value: '1234567890TQ1234',
                        type: TaxIdType.ca_qst,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                }}
                address={{ country: 'CA', state: 'QC' }}
            />,
        )
        expect(screen.getByText('GST/HST ID:')).toBeVisible()
        expect(screen.getByText('123456789RT0002')).toBeVisible()

        expect(screen.getByText('QST ID:')).toBeVisible()
        expect(screen.getByText('1234567890TQ1234')).toBeVisible()
    })

    it('should render GST/HST and PST ID for Canada with province BC', () => {
        render(
            <TaxIdRows
                taxIDs={{
                    [TaxIdType.ca_gst_hst]: {
                        value: '123456789RT0002',
                        type: TaxIdType.ca_gst_hst,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                    [TaxIdType.ca_pst_bc]: {
                        value: 'PST-1234-5678',
                        type: TaxIdType.ca_pst_bc,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                }}
                address={{ country: 'CA', state: 'BC' }}
            />,
        )
        expect(screen.getByText('GST/HST ID:')).toBeVisible()
        expect(screen.getByText('123456789RT0002')).toBeVisible()

        expect(screen.getByText('PST ID:')).toBeVisible()
        expect(screen.getByText('PST-1234-5678')).toBeVisible()
    })

    it('should render GST/HST and PST ID for Canada with province MB', () => {
        render(
            <TaxIdRows
                taxIDs={{
                    [TaxIdType.ca_gst_hst]: {
                        value: '123456789RT0002',
                        type: TaxIdType.ca_gst_hst,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                    [TaxIdType.ca_pst_mb]: {
                        value: '123456-7',
                        type: TaxIdType.ca_pst_mb,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                }}
                address={{ country: 'CA', state: 'MB' }}
            />,
        )

        expect(screen.getByText('GST/HST ID:')).toBeVisible()
        expect(screen.getByText('123456789RT0002')).toBeVisible()

        expect(screen.getByText('PST ID:')).toBeVisible()
        expect(screen.getByText('123456-7')).toBeVisible()
    })

    it('should render GST/HST and PST ID for Canada with province SK', () => {
        render(
            <TaxIdRows
                taxIDs={{
                    [TaxIdType.ca_gst_hst]: {
                        value: '123456789RT0002',
                        type: TaxIdType.ca_gst_hst,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                    [TaxIdType.ca_pst_sk]: {
                        value: '1234567',
                        type: TaxIdType.ca_pst_sk,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                }}
                address={{ country: 'CA', state: 'SK' }}
            />,
        )

        expect(screen.getByText('GST/HST ID:')).toBeVisible()
        expect(screen.getByText('123456789RT0002')).toBeVisible()

        expect(screen.getByText('PST ID:')).toBeVisible()
        expect(screen.getByText('1234567')).toBeVisible()
    })

    it('should render ABN for Australia', () => {
        render(
            <TaxIdRows
                taxIDs={{
                    [TaxIdType.au_abn]: {
                        value: '12345678912',
                        type: TaxIdType.au_abn,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                }}
                address={{ country: 'AU' }}
            />,
        )
        expect(screen.getByText('ABN:')).toBeVisible()
        expect(screen.getByText('12345678912')).toBeVisible()
    })

    it('should render VAT Number for a European country', () => {
        render(
            <TaxIdRows
                taxIDs={{
                    [TaxIdType.eu_vat]: {
                        value: 'FRAB123456789',
                        type: TaxIdType.eu_vat,
                        verification: TaxIdVerificationStatus.Pending,
                    },
                }}
                address={{ country: 'FR' }}
            />,
        )
        expect(screen.getByText('VAT Number:')).toBeVisible()
        expect(screen.getByText('FRAB123456789')).toBeVisible()
    })

    it('should render nothing for unsupported country', () => {
        const { container } = render(
            <TaxIdRows taxIDs={{}} address={{ country: 'US' }} />,
        )
        expect(container).toBeEmptyDOMElement()
    })
})
