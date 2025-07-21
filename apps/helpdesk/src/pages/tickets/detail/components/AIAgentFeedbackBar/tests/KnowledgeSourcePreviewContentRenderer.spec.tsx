import { render, screen } from '@testing-library/react'

import { KnowledgeSourcePreviewContentRenderer } from '../KnowledgeSourcePreviewContentRenderer'

describe('KnowledgeSourcePreviewContentRenderer', () => {
    const mockProps = {
        guidanceVariables: [],
        guidanceActions: [],
        shopName: 'test-shop',
    }

    describe('when rendering content with guidance variables and actions', () => {
        it('renders content with guidance variables and actions correctly', () => {
            const content = `<div>- "If the customer &&&customer.email&&& requests to cancel an order:</div>
            <ul>
                <li>Before anything, please ask them to provide a reason for the cancellation if not provided already. </li>
                <li>Only after you have a reason for the cancellation, check &&&order.order_tags&&&. </li>
                <ul>
                    <li>If it contains "do_not_edit", then tell the customer that the order is too late to cancel and close the ticket.</li>
                    <li>If it doesn't, $$$01J7KWHHMDY3H5S174D89VG7S3$$$</li>
                </ul>
            </ul>`

            const { container } = render(
                <KnowledgeSourcePreviewContentRenderer
                    content={content}
                    {...mockProps}
                />,
            )

            // Check that the static text content is present
            expect(screen.getByText(/If the customer/i)).toBeInTheDocument()
            expect(
                screen.getByText(/requests to cancel an order/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Before anything, please ask them to provide a reason/i,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Only after you have a reason for the cancellation, check/i,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/If it contains "do_not_edit"/i),
            ).toBeInTheDocument()
            expect(screen.getByText(/If it doesn't/i)).toBeInTheDocument()

            // Check that the processed content contains the kbd placeholders, ReactMarkdown shows escaped HTML in test environment
            const innerHTML = container.innerHTML
            expect(innerHTML).toContain(
                '&lt;kbd data-index="0"&gt;&lt;/kbd&gt;',
            )
            expect(innerHTML).toContain(
                '&lt;kbd data-index="1"&gt;&lt;/kbd&gt;',
            )
            expect(innerHTML).toContain(
                '&lt;kbd data-index="2"&gt;&lt;/kbd&gt;',
            )
        })
    })

    describe('when rendering content without guidance variables and actions', () => {
        it('renders plain text content correctly', () => {
            const content = `<div>Simple instructions for customer service:</div>
            <ul>
                <li>Always be polite and professional</li>
                <li>Listen to the customer's concerns</li>
                <li>Provide clear and helpful solutions</li>
            </ul>`

            render(
                <KnowledgeSourcePreviewContentRenderer
                    content={content}
                    {...mockProps}
                />,
            )

            expect(
                screen.getByText(/Simple instructions for customer service/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Always be polite and professional/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Listen to the customer's concerns/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Provide clear and helpful solutions/i),
            ).toBeInTheDocument()
        })
    })
})
