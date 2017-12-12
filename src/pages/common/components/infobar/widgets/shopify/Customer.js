// @flow
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ActionButtonsGroup from '../ActionButtonsGroup'
import type {ActionType} from '../types'

export default () => {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper, // eslint-disable-line,
        AfterTitle, // eslint-disable-line
    }
}

type AfterTitleProps = {
    source: Map<string,*>
}

class AfterTitle extends React.Component<AfterTitleProps> {
    render() {
        const {source}  = this.props

        const actions: Array<ActionType> = [
            // {
            //     key: 'creategiftcard',
            //     options: [{
            //         value: 'shopifyCreateGiftCard',
            //         label: 'Create gift card',
            //         parameters: [{
            //             name: 'value',
            //             type: 'number',
            //             defaultValue: 10.00,
            //             placeholder: 'Value',
            //             required: true,
            //             step: 0.01,
            //             min: 0.01
            //         }, {
            //             name: 'code',
            //             type: 'text',
            //             defaultValue: 'HELLO123' // {{ticket.requester.name}}{{ticket.id}}
            //         }]
            //     }],
            //     title: (
            //         <div>
            //             <i className="fa fa-fw fa-gift mr-2" />
            //             Create gift card
            //         </div>
            //     ),
            //     child: (
            //         <div>
            //             <i className="fa fa-fw fa-gift mr-2" />
            //             Create gift card
            //         </div>
            //     )
            // }
        ]

        const payload = {
            customer_id: source.get('id')
        }

        return (
            <ActionButtonsGroup
                actions={actions}
                payload={payload}
            />
        )
    }
}


type TitleWrapperProps = {
    children: Object,
    source: Map<string,*>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const shopName : string = this.context.integration.getIn(['meta', 'shop_name'])

        return (
            <a
                href={`https://${shopName}.myshopify.com/admin/customers/${(source.get('id') || '').toString()}`}
                target="_blank"
            >
                {children}
            </a>
        )
    }
}
