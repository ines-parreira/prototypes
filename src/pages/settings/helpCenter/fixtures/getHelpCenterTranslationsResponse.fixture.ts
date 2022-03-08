import {Components} from 'rest_api/help_center_api/client.generated'

export const getHelpCenterTranslationsResponseFixture: Components.Schemas.HelpCenterTranslationsListPageDto =
    {
        data: [
            {
                created_datetime: '2022-02-04T14:20:23.469Z',
                updated_datetime: '2022-02-22T15:23:55.843Z',
                deleted_datetime: null,
                help_center_id: 1,
                banner_text: 'Hi, This banner text is somewhat, very custom',
                banner_image_url:
                    'https://i.picsum.photos/id/36/1440/316.jpg?hmac=yA9HAWLxyHZGQz-6Ywx2IlE2lETzlJOIoQLL0t6-9mU',
                seo_meta: {title: null, description: null},
                contact_info: {
                    email: {
                        deactivated_datetime: null,
                        email: 'yolo@yolo.com',
                        description: 'yolo',
                    },
                    phone: {
                        deactivated_datetime: '2022-02-04T14:20:23.000Z',
                        description: '',
                        phone_numbers: [],
                    },
                    chat: {
                        deactivated_datetime: '2022-02-04T14:20:23.000Z',
                        description: '',
                    },
                },
                chat_application_id: null,
                extra_html: {
                    extra_head_deactivated_datetime: null,
                    custom_header_deactivated_datetime:
                        '2022-02-22T15:23:55.838Z',
                    custom_footer_deactivated_datetime:
                        '2022-02-08T08:57:33.936Z',
                    extra_head:
                        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Festive&display=swap" rel="stylesheet">\n<style>\n:root {\n  --primary-font-family: Festive, inter !important;\n}\n</style>',
                    custom_footer: 'fdsfds\nd\nsf\n\ns\n',
                    custom_header:
                        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<style>\n\n.sidebar {\n  margin: 0;\n  padding: 0;\n  width: 200px;\n  background-color: #f1f1f1;\n  position: fixed;\n  height: 100%;\n  overflow: auto;\n}\n\n.sidebar a {\n  display: block;\n  color: #161616;\n  padding: 16px;\n  font-size: 16px;\n  font-weight: 600;\n  font-family: Inter;\n  text-decoration: none;\n}\n \n.sidebar a.active {\n  background-color: #04AA6D;\n  color: white;\n}\n\n.sidebar a:hover:not(.active) {\n  background-color: #555;\n  color: white;\n}\n\n.sidebar img {\n  display: block;\n}\n\n.css-1ng858j-ContentContainer {\n  margin-left: 200px;\n  padding: 1px 16px;\n}\n\nfooter {\n  margin-left: 200px;\n}\n\n\n@media screen and (max-width: 700px) {\n  .sidebar {\n    width: 100%;\n    height: auto;\n    position: relative;\n  }\n  .sidebar a {float: left;}\n  div.content {margin-left: 0;}\n}\n\n@media screen and (max-width: 400px) {\n  .sidebar a {\n    text-align: center;\n    float: none;\n  }\n}\n</style>\n<div class="sidebar">\n  <img src="https://imgur.com/euXO5sp.jpg">\n  <a href="https://www.gorgias.com/">🛒 Back to shop</a>\n  <a href="mailto:someone@yoursite.com">📭 Email Us</a>\n</div>',
                },
                locale: 'en-US',
            },
            {
                created_datetime: '2022-02-04T14:20:23.469Z',
                updated_datetime: '2022-02-04T14:20:23.469Z',
                deleted_datetime: null,
                help_center_id: 1,
                banner_text: 'Bonjour, comment puis-je vous aider ?',
                banner_image_url: null,
                seo_meta: {title: null, description: null},
                contact_info: {
                    email: {
                        deactivated_datetime: '2022-02-04T14:20:23.000Z',
                        email: '',
                        description: '',
                    },
                    phone: {
                        deactivated_datetime: '2022-02-04T14:20:23.000Z',
                        description: '',
                        phone_numbers: [],
                    },
                    chat: {
                        deactivated_datetime: '2022-02-04T14:20:23.000Z',
                        description: '',
                    },
                },
                chat_application_id: null,
                extra_html: {
                    extra_head_deactivated_datetime: '2022-02-04T14:20:23.000Z',
                    custom_header_deactivated_datetime:
                        '2022-02-04T14:20:23.000Z',
                    custom_footer_deactivated_datetime:
                        '2022-02-04T14:20:23.000Z',
                    extra_head: '',
                    custom_footer: '',
                    custom_header: '',
                },
                locale: 'fr-FR',
            },
        ],
        object: 'list',
        meta: {
            page: 1,
            per_page: 20,
            current_page: '/help-centers/1/translations?page=1&per_page=20',
            item_count: 2,
            nb_pages: 1,
        },
    }
