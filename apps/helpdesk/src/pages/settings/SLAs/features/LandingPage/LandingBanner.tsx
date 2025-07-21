import templatesImage from 'assets/img/presentationals/sla-policies.svg'

import css from './LandingBanner.less'

const LandingBanner = () => (
    <div className={css.banner}>
        <div className={css.text}>
            <h1 className={css.title}>
                Get started with service level agreements (SLAs)
            </h1>
            <p className={css.description}>
                Service Level Agreements (SLAs) boost customer satisfaction,
                enhance accountability, optimize resource allocation, streamline
                problem resolution, and minimize disputes.
            </p>
        </div>
        <img
            className={css.templatesImage}
            src={templatesImage}
            alt="SLAs Banner"
        />
    </div>
)

export default LandingBanner
