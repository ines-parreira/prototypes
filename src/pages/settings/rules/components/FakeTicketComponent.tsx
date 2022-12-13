import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import css from './FakeTicketComponent.less'

type FakeTicketProps = {
    title: string
    description: string
    closed: boolean
}
const FakeTicket = ({title, description, closed}: FakeTicketProps) => (
    <div className={css.fakeTicket}>
        <div className={css.fakeTicketTitleWrapper}>
            <span className={css.fakeTicketTitle}>{title}</span>
            {closed && (
                <Badge
                    type={ColorType.Error}
                    className={css.fakeTicketClosed}
                    style={{
                        backgroundColor: '#ffeaea',
                        color: '#a32e2e',
                    }}
                >
                    closed
                </Badge>
            )}
        </div>
        <div className={css.fakeTicketDescription}>{description}</div>
    </div>
)

const fakeTickets = [
    {
        title: 'Newsletter',
        description: 'Check out our new product!',
        closed: true,
    },
    {
        title: 'Product question',
        description: 'I have ordered...',
        closed: false,
    },
    {
        title: 'Promotion! -50%...',
        description: 'Until Monday all of our products...',
        closed: true,
    },
]

const FakeTicketComponent: React.FC = () => (
    <div className={css.container}>
        {fakeTickets.map((ticket: FakeTicketProps, idx) => (
            <FakeTicket key={idx} {...ticket} />
        ))}
    </div>
)

export default FakeTicketComponent
