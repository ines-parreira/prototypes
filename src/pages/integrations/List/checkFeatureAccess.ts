export function checkBigCommerceAccess(domain: string) {
    return (
        // allow access feature for specified domains and for preview envs
        domain
            ? [
                  // staging + ecom&devrel team
                  'acme',
                  'test-martin',
                  'sf-bicycle',
                  'manuel-testing',
                  'alexandru-daineanu-test-store',
                  'maximstore',
                  'iustina-store-test',
                  'ionut-zamfir',
                  'nicolas-store',
                  'lisa-t-test',
                  'pilarhelpdesk',
                  'catalinm-test',
                  // BigCommerce QA
                  'as7testing',
                  // beta program users
                  'solostove',
                  'liftsupportsdepot',
                  'mollymutt',
                  'dance4me',
                  'yatesjewelers',
                  'roamrogue',
                  'iagperformance',
                  'northsidegeneralstore',
                  'bakehouse',
                  'swym-bigcommerce-dev',
                  'true-north-apparel',
              ].includes(domain) || domain.includes('.preview')
            : false
    )
}
