import React from 'react'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'

import css from './AIArticlesLibraryPreview.less'

const AIArticlesLibraryPreview = () => {
    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>Article Preview</div>
                <div className={css.actions}>
                    <i
                        className={classNames(
                            'material-icons',
                            'rounded',
                            css.iconEdit
                        )}
                    >
                        edit
                    </i>
                    <Button intent="secondary">Archive</Button>
                    <Button intent="primary">Publish</Button>
                </div>
            </div>
            <div className={css.descriptionContainer}>
                <h3>
                    Can I find vintage or discontinued Barbie dolls in store?
                </h3>
                <div className={css.description}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Curabitur posuere nulla sit amet ipsum commodo ultricies sed
                    mattis tortor. Vestibulum sodales arcu turpis, nec
                    vestibulum risus placerat ultricies. Nunc nec justo
                    venenatis, consectetur quam eget, consequat mauris. Nulla ac
                    scelerisque arcu, eu convallis nisi. Aliquam sodales velit
                    eget lorem commodo, nec feugiat tortor fringilla.
                    Pellentesque habitant morbi tristique senectus et netus et
                    malesuada fames ac turpis egestas. Etiam quis leo tempus
                    lacus malesuada maximus suscipit et ligula. Nam feugiat,
                    odio at suscipit congue, est nisl venenatis massa, nec
                    egestas ex massa id tortor. Vivamus massa elit, vehicula in
                    convallis quis, scelerisque a elit.
                    <br />
                    <br />
                    Donec pharetra gravida rhoncus. Fusce bibendum quis nibh
                    viverra tincidunt. Donec varius libero eget ipsum convallis,
                    eget varius sapien pellentesque. Nam at augue auctor, porta
                    urna vel, varius ipsum. In interdum, metus bibendum
                    tincidunt porta, risus urna imperdiet enim, nec mattis urna
                    odio nec nisi. Maecenas posuere tortor nec orci tempor
                    commodo id at mi. Sed feugiat ex eget diam luctus iaculis.
                    Cras in pretium ligula.
                    <br />
                    <br />
                    Donec et quam id purus molestie tristique. Quisque dictum
                    ligula in dignissim efficitur. Curabitur finibus ultrices
                    elit in blandit. Maecenas commodo nulla ligula, eget tempor
                    dui porttitor at. Suspendisse justo ipsum, ultricies et
                    consectetur at, dictum sodales lectus. Pellentesque volutpat
                    quam eget nibh semper, vitae mattis ex molestie. Donec
                    consectetur et enim vel efficitur. Etiam tristique rutrum
                    quam non consequat.
                    <br />
                    <br />
                    Vivamus a purus arcu. Donec sagittis ut est eu pellentesque.
                    Maecenas ipsum quam, commodo nec nulla et, eleifend blandit
                    velit. Mauris quis ex in nunc auctor aliquam. Aliquam erat
                    volutpat. Nunc id ullamcorper turpis. Cras nisl sem, blandit
                    vel mollis at, faucibus ac urna. Ut sed lacinia neque.
                    Mauris eu dolor elit. Vivamus convallis tempus erat, ac
                    cursus urna placerat eu. Donec elementum nibh porta,
                    porttitor libero at, lobortis felis. Sed vestibulum
                    facilisis quam, quis auctor dui laoreet vel. Cras bibendum
                    enim ut bibendum tempor. Morbi tincidunt hendrerit lacinia.
                    <br />
                    Vestibulum ante ipsum primis in faucibus orci luctus et
                    ultrices posuere cubilia curae; Aenean fringilla sem
                    fermentum pellentesque mattis. Donec tempus rutrum orci ut
                    elementum. Etiam in odio sit amet lectus cursus interdum.
                    Phasellus eu felis pretium, rhoncus elit non, pellentesque
                    elit. Aliquam et mauris nunc. Etiam ac sem urna. Nunc mollis
                    augue tellus, eget cursus enim gravida ac. Proin nec ligula
                    aliquet, vulputate nibh sit amet, dictum justo.
                    <br />
                    Nunc laoreet enim ut malesuada blandit. Pellentesque
                    scelerisque iaculis nunc sit amet interdum. Aenean tristique
                    purus enim, at malesuada ligula tincidunt nec. Curabitur
                    massa ante, posuere sit amet nulla quis, pulvinar varius
                    neque.
                </div>
            </div>
        </div>
    )
}

export default AIArticlesLibraryPreview
