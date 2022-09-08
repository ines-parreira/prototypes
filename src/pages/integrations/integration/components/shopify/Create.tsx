import React, {FormEvent, useState} from 'react'
import {Col, Container, Form, Row} from 'reactstrap'

import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'
import * as utils from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/settings/settings.less'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import InputGroup from 'pages/common/forms/input/InputGroup'
import Label from 'pages/common/forms/Label/Label'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import Caption from 'pages/common/forms/Caption/Caption'

type Props = {
    redirectUri: string
}

export default function Create({redirectUri}: Props) {
    const [shopName, setShopName] = useState('')

    const shopifyIntegrationAlreadyExists = !useAppSelector(
        getShopifyIntegrationByShopName(shopName)
    ).isEmpty()

    const handleCreate = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()
        window.location.href = redirectUri.replace(
            '{shop_name}',
            utils.subdomain(shopName)
        )
    }

    const error = shopifyIntegrationAlreadyExists
        ? 'There is already an integration for this Shopify store'
        : null

    return (
        <Container fluid className={css.pageContainer}>
            <Row>
                <Col md="8">
                    <p>
                        Let’s connect your store to Gorgias. We'll import your
                        Shopify customers in Gorgias, along with their order
                        information. This way, when they contact you, you'll be
                        able to see their Shopify information next to tickets.
                    </p>
                    <Form onSubmit={handleCreate}>
                        <div className="mb-4">
                            <Label htmlFor="store-field" className="mb-2">
                                Store name
                            </Label>
                            <InputGroup>
                                <TextInput
                                    id="store-field"
                                    hasError={Boolean(error)}
                                    name="store-name"
                                    value={shopName}
                                    onChange={(name) => setShopName(name)}
                                    placeholder={
                                        'ex: "acme" for acme.myshopify.com'
                                    }
                                />
                                <GroupAddon>.myshopify.com</GroupAddon>
                            </InputGroup>
                            {error && <Caption error={error} />}
                        </div>

                        <div>
                            <Button type="submit" isDisabled={Boolean(error)}>
                                Connect App
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}
