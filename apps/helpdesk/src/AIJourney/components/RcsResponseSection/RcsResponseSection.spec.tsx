import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { RcsTestSendResponse } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'

import { RcsResponseSection } from './RcsResponseSection'

const baseResponse: RcsTestSendResponse = {
    content_sid: null,
    template_name: null,
    variables: null,
    message_classification: 'text_only',
    resolution_path: 'exact',
    twilio_message_sid: null,
    warnings: [],
    templates_in_pool: null,
}

describe('<ResponseSection />', () => {
    it('renders the response card header', () => {
        render(<RcsResponseSection response={baseResponse} />)

        expect(screen.getByText('Response')).toBeInTheDocument()
    })

    it('renders message classification and resolution path', () => {
        render(<RcsResponseSection response={baseResponse} />)

        expect(screen.getByText('text_only')).toBeInTheDocument()
        expect(screen.getByText('exact')).toBeInTheDocument()
    })

    it('renders rich_content classification', () => {
        render(
            <RcsResponseSection
                response={{
                    ...baseResponse,
                    message_classification: 'rich_content',
                }}
            />,
        )

        expect(screen.getByText('rich_content')).toBeInTheDocument()
    })

    it('renders content_sid when present', () => {
        render(
            <RcsResponseSection
                response={{ ...baseResponse, content_sid: 'HX123abc' }}
            />,
        )

        expect(screen.getByText('Content SID')).toBeInTheDocument()
        expect(screen.getByText('HX123abc')).toBeInTheDocument()
    })

    it('does not render content_sid section when null', () => {
        render(<RcsResponseSection response={baseResponse} />)

        expect(screen.queryByText('Content SID')).not.toBeInTheDocument()
    })

    it('renders template_name when present', () => {
        render(
            <RcsResponseSection
                response={{ ...baseResponse, template_name: 'rcs_promo_v2' }}
            />,
        )

        expect(screen.getByText('Template name')).toBeInTheDocument()
        expect(screen.getByText('rcs_promo_v2')).toBeInTheDocument()
    })

    it('does not render template_name section when null', () => {
        render(<RcsResponseSection response={baseResponse} />)

        expect(screen.queryByText('Template name')).not.toBeInTheDocument()
    })

    it('renders twilio_message_sid when present', () => {
        render(
            <RcsResponseSection
                response={{ ...baseResponse, twilio_message_sid: 'SM456' }}
            />,
        )

        expect(screen.getByText('Twilio message SID')).toBeInTheDocument()
        expect(screen.getByText('SM456')).toBeInTheDocument()
    })

    it('renders templates_in_pool when present', () => {
        render(
            <RcsResponseSection
                response={{ ...baseResponse, templates_in_pool: 7 }}
            />,
        )

        expect(screen.getByText('Templates in pool')).toBeInTheDocument()
        expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('does not render templates_in_pool section when null', () => {
        render(<RcsResponseSection response={baseResponse} />)

        expect(screen.queryByText('Templates in pool')).not.toBeInTheDocument()
    })

    it('renders variables as formatted JSON', () => {
        render(
            <RcsResponseSection
                response={{
                    ...baseResponse,
                    variables: { discount: '10%', name: 'Alice' },
                }}
            />,
        )

        expect(screen.getByText('Variables')).toBeInTheDocument()
        expect(screen.getByText(/discount/)).toBeInTheDocument()
    })

    it('renders warnings when present', () => {
        render(
            <RcsResponseSection
                response={{
                    ...baseResponse,
                    warnings: ['Image too large', 'Button limit exceeded'],
                }}
            />,
        )

        expect(screen.getByText('Warnings')).toBeInTheDocument()
        expect(screen.getByText('Image too large')).toBeInTheDocument()
        expect(screen.getByText('Button limit exceeded')).toBeInTheDocument()
    })

    it('does not render warnings section when empty', () => {
        render(<RcsResponseSection response={baseResponse} />)

        expect(screen.queryByText('Warnings')).not.toBeInTheDocument()
    })
})
