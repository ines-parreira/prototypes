import React from 'react'

import whatsAppIcon from 'assets/img/integrations/whatsapp.svg'

import css from './WhatsAppVariablePreview.less'

export default function WhatsAppVariablePreview() {
    return (
        <div className={css.container}>
            <img src={whatsAppIcon} alt="logo-whatsapp" className={css.logo} />
            <div className={css.text}>WhatsApp Variable</div>
        </div>
    )
}
