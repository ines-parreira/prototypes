import {Components} from 'rest_api/help_center_api/client.generated'

export const analyseCsvResponse: Components.Schemas.AnalyseCsvResponseSuccessDto =
    {
        status: 'SUCCESS',
        num_rows: 273,
        columns: [
            {
                name: 'article_id',
                samples: [
                    'fejtVwpqMZ',
                    't7A7iUJHdL',
                    'kef2yrwz3l',
                    'le71oayg59',
                    'lzqky10vp0',
                ],
            },
            {
                name: 'title',
                samples: [
                    'What is Gorgias?',
                    'Customer data privacy',
                    'Get Connected',
                    'Navigating Gorgias',
                    'Onboarding Guide',
                ],
            },
            {
                name: 'description',
                samples: [
                    'Elev io is an in app help center that allows your customers to browse help articles on any page of your website and contact support By connecting Elev io to Gorgias Your customers can start chat co...',
                    'When Gorgias automatically suggests merge Sometimes a customer will reach out with two different email addresses and you will need to merge the two different profiles. Gorgias automatically suggest...',
                    'Zapier is an easy way for non-technical users to create integrations between web applications. No coding required. You can use Zapier to create a ticket in Gorgias when an action or event happens o...',
                    "G Suite Gmail Good news If you're using a support inbox provided by Gmail or G Suite you can add it in just a few clicks It comes with a few benefits emails are sent from your own Gmail account and...",
                    'This article describes how to use the chat configuration page customize the chat UI.',
                ],
            },
            {
                name: 'text',
                samples: [
                    "Gorgias is a customer support platform built for e-commerce companies! Connect all of your customer service channels: email , chat , phone , Messenger , Facebook , Instagram , SMS and manage all of them from inside one Gorgias dashboard. Respond to customers in seconds with back-office data from Shopify , Magento , BigCommerce , ReCharge and others. Here's a quick video introduction:. You can find more on our YouTube channel here too. Sounds like just the thing that you've been looking for? Take it for a spin with a 7-day free trial! Simply type in your email address into the bar on our website here. If you still have some questions before you make any sort of commitments, then please feel free to reach out to us at support@gorgias.com or via our live chat and we'll be there to talk 😊",
                    'Your clients may enter sensitive information like credit card numbers or social security numbers into their messages. When these messages come into Gorgias, this sensitive information is automatically obfuscated/scrambled so your agents don\'t have access to it. How it works. Before a new message is stored in our database, it is scanned for records that fit the format of sensitive numbers; if any credit card numbers or social security numbers are detected, they are automatically obfuscated or stripped before being stored in the database and displayed to agents and users. Your clients\' sensitive numbers are never stored by Gorgias. Numbers that are between 13 and 19 digits long are considered for obfuscation. This is the length of most major credit card numbers. The Luhn algorithm is then used to validate the credit card number. The number is obfuscated only when it passes validation. The last four digits of the card number are preserved; the rest are replaced with a special character (*). For example, if an incoming ticket contains the text: "My credit card number is 4532 0151 1283 0366.". It is stored in Gorgias as: "My credit card number is **** **** **** 0366.". Tickets that contain a string with valid social security numbers are also obfuscated. If an incoming ticket contains the text: "I need help. My social security number is 123-45-6789.". It is stored in Gorgias as: "I need help. My social security number is ***-**-****.". This obfuscation satisfies Requirement 3 of the Payment Card Industry’s Data Security Standard (PCI DSS) , "Protecting stored cardholder data". Gorgias performs these privacy checks automatically with no work required on your part, so you can be assured that your users\' sensitive data remains hidden!',
                    'Now that you know how to navigate your helpdesk and email integrations you are going to want to also connect your Shopify store and possibly Chat and Social Media accounts. Head on over to "Settings" and then "Integrations" to get these setup. Take a look at the video below for more information on how and why for each of these integrations. VIDEO Shopify. By integrating Shopify you are able to access all of your customers order data and take Shopify actions utilizing the sidebar and macros within your support tickets. For more details on setting up this integration and to learn more about how it functions take a look at this article. Chat. Utilizing the chat integration is a great way to engage your customers on a proactive manner and to provide a quick and easy way for them to get in touch with you. For more information check out the articles here. Social Media. Using Gorgias to manage your social media comments and Messenger requests is not only efficient but will also allow you to access the customers Shopify data, and see their ticket history across all communication channels. To learn more about this integration check out these articles here.',
                    'As you are just getting started in Gorgias you are going to need to know where to find the different tools, features, and settings you will be utilizing. Take a look at the quick video below that will navigate you through the helpdesk. VIDEO Primary View. By default, when you first login to Gorgias you will land on the "Tickets" page. The view will be in will be the first view in the list. If you click the 3 vertical dots to the right of "Tickets" in the top left corner you will be able to access your primary menu; Tickets, Customers, Statistics, Settings. On every page in your helpdesk you will also be able to access Gorgias Customer Support and the agent resource menu. To connect with the Gorgias Customer Support team, use the chat bubble icon on the bottom right. To access the Agent Resource Menu, click on your name on the bottom left. In this menu you will find: Log out, Keyboard Shortcuts, Your Profile, Help Center, Chat Availability Status, and What\'s New.',
                    "If you are just getting started with Gorgias, this will be your step by step guide on how to get up and running in no time. Setting Up Your First Integrations. Once you have signed up for an account you are going to want to start getting your main communication channels integrated. Start with your email, social media accounts, and Shopify store. Take a look at the video below where we show you exactly how to do that. Now that you have those integrated, let's take a look at the email and social media integrations and the different settings you can customize. Email Integration. In the email integration that you have set up, you can now import the last 100 emails received and also set up your signature. Take a look at the short clip below to see it in action! Facebook Integration. The Facebook integration allows you to manage your messages, comments, and Instagram comments as tickets. (We will dive into exactly what that looks like later.) Take a look at the graphics below that shows the different settings within the Facebook integration and what they do. Creating Macros and Tags. Now that you have your initial integrations set up you can start setting up your macros and tags. Macros in Gorgias are similar to what is commonly referred to as 'canned responses'. Macros, are templates, or premade responses that allow you to quickly respond to commonly asked questions. In Gorgias, a macro also has the ability to include various actions, auto fill customer specific data, and more. Tags in Gorgias are a way to label your tickets. As we get into rules, views, and statistics I will show you the many ways tags can be utilized. When you go into your tags list you will see a handful of tags that are most commonly used by our customers. Tags. In the image below you will see where to access all of your tags, the two places where you can create them, and also how to add them to a ticket. Creating a tag in a ticket Macros. Take a look at the quick video below to see how to access your macros, create and edit macros, and the different data and actions that can be utilized in them. Setting Up Views. Views are an excellent way to organize and prioritize tickets in your helpdesk. The video below shows how views work. It's important to note that views do not function in the same way as folders do. You are not actually moving tickets from one view to another. Instead, think of it as filters that will be applied to your entire database of tickets. Also, when you add a new social media or email integration a new view for those will automatically be populated.. Additional Integrations. Now that you have the basics of your helpdesk setup, you may have additional integrations you want to add. Below you will find links to some of our most commonly utilized integrations. For instructions on all of our integrations, click here. Make sure to also check out our HTTP Integrations article for some of our custom integrations. (Please note that certain custom integrations require manual work on our end and are only available to Pro Plans or higher and you must be on an active plan and not still in trial.) Aircall Chat HelpDocs Recharge Klaviyo Team Work. With Gorgias you can have an unlimited amount of team members no matter what plan you are on. Only an admin can add or remove team members. Take a look at the graphic below that shows you how to add your team members. You can set the role of agent or admin. Only Admin will have access to Billing, Rules, Integrations, Team Members, and can edit/delete tags. Adding Team Members. Zendesk Migration. If you are migrating from Zendesk click here for a step by step tutorial. Please note that Zendesk Migration is for Pro Plan subscribers or higher and must have an active subscription (cannot still be in free trial). You are all set now! If you have any questions please email us at support@gorgias.io or click on the chat bubble in the bottom right corner of your help desk to chat with us.",
                ],
            },
            {
                name: 'body',
                samples: [
                    '<p><a href="https://www.gorgias.com/" target="_blank">Gorgias</a> is a customer support platform built for e-commerce companies!</p><p>Connect all of your customer service channels:&#160;<a href="https://docs.gorgias.com/search/email" target="_blank">email</a>, <a href="https://docs.gorgias.com/search/chat" target="_blank">chat</a>, <a href="https://docs.gorgias.com/search/phone" target="_blank">phone</a>, <a href="https://docs.gorgias.com/search/messenger" target="_blank">Messenger</a>, <a href="https://docs.gorgias.com/search/facebook" target="_blank">Facebook</a>, <a href="https://docs.gorgias.com/search/instagram">Instagram</a>, <a href="https://docs.gorgias.com/search/sms" target="_blank">SMS</a> and manage all of them from inside one Gorgias dashboard.</p><p>Respond to customers in seconds with back-office data from <a href="https://docs.gorgias.com/search/shopify">Shopify</a>, <a href="https://docs.gorgias.com/search/magento" target="_blank">Magento</a>, <a href="https://docs.gorgias.com/search/bigcommerce" target="_blank">BigCommerce</a>, <a href="https://docs.gorgias.com/search/recharge" target="_blank">ReCharge</a> and others.</p><p>Here&#39;s a quick video introduction:&#160;</p><div class="hd--embed" data-provider="YouTube"><iframe style="width: 500px; height: 281px;" src="//www.youtube.com/embed/9h8Vz4RFD8E" frameborder="0" allowfullscreen=""></iframe></div><p>You can find more on our <a href="https://www.youtube.com/channel/UCbnRDEiWYYafw6Vx1Za5PNQ" target="_blank">YouTube channel</a> here too.</p><p></p><p>Sounds like just the thing that you&#39;ve been looking for? Take it for a spin with a 7-day free trial! Simply type in your email address into the bar on our website <a href="https://www.gorgias.com/" target="_blank">here</a>.</p><p></p><p>If you still have some questions before you make any sort of commitments, then please feel free to reach out to us at support@gorgias.com or via our live chat and we&#39;ll be there to talk &#128522;</p>',
                    '<p>Your clients may enter sensitive information like credit card numbers or social security numbers into their messages. When these messages come into Gorgias, this sensitive information is automatically obfuscated/scrambled so your agents don&#39;t have access to it.&#160;</p><h4><span style="color:#ff9090" data-hd-color="#ff9090"><strong>How </strong></span><span style="color:#ff9090" data-hd-color="#ff9090"><strong>it works</strong></span></h4><p>Before a new message is stored in our database, it is scanned for records that fit the format of sensitive numbers; if any credit card numbers or social security numbers are detected, they are automatically obfuscated or stripped before being stored in the database and displayed to agents and users. Your clients&#39; sensitive numbers are never stored by Gorgias.&#160;</p><p>Numbers that are between 13 and 19 digits long are considered for obfuscation. This is the length of most major credit card numbers. The <a href="https://en.wikipedia.org/wiki/Luhn_algorithm" target="_blank">Luhn algorithm</a><em>&#160;</em>is then used to validate the credit card number. The number is obfuscated only when it passes validation.&#160;The last four digits of the card number are preserved; the rest are replaced with a special character (*).</p><p>For example, if an incoming ticket contains the text:</p><ul><li><strong>&#34;My credit card number is 4532 0151 1283 0366.&#34;</strong></li></ul><p>It is stored in Gorgias as:</p><ul><li><strong>&#34;My credit card number is **** **** **** 0366.&#34;</strong></li></ul><p>Tickets that contain a string with valid social security numbers are also obfuscated.&#160;</p><p>If an incoming ticket contains the text:</p><ul><li><strong>&#34;I need help. My social security number is 123-45-6789.&#34;</strong></li></ul><p>It is stored in Gorgias as:</p><ul><li><strong>&#34;I need help. My social security number is ***-**-****.&#34;</strong></li></ul><div class="note-callout">This obfuscation satisfies <strong>Requirement 3</strong> of the <strong>Payment Card Industry&#8217;s Data Security Standard (PCI DSS)</strong>, <strong>&#34;Protecting stored cardholder data&#34;</strong>.</div><p>Gorgias performs these privacy checks automatically with no work required on your part, so you can be assured that your users&#39; sensitive data remains hidden!</p>',
                    '<p>Now that you know how to navigate your helpdesk and email integrations you are going to want to also connect your Shopify store and possibly Chat and Social Media accounts. Head on over to "Settings" and then "Integrations" to get these setup. Take a look at the video below for more information on how and why for each of these integrations. </p><p>VIDEO</p><p></p><h5>Shopify</h5><p>By integrating Shopify you are able to access all of your customers order data and take Shopify actions utilizing the sidebar and macros within your support tickets. For more details on setting up this integration and to learn more about how it functions take a look at this article.</p><h5>Chat</h5><p>Utilizing the chat integration is a great way to engage your customers on a proactive manner and to provide a quick and easy way for them to get in touch with you. For more information check out the articles here.</p><h5>Social Media</h5><p>Using Gorgias to manage your social media comments and Messenger requests is not only efficient but will also allow you to access the customers Shopify data, and see their ticket history across all communication channels. To learn more about this integration check out these articles here. </p>',
                    '<p>As you are just getting started in Gorgias you are going to need to know where to find the different tools, features, and settings you will be utilizing. Take a look at the quick video below that will navigate you through the helpdesk. </p><p></p><p>VIDEO</p><p></p><h4>Primary View</h4><p>By default, when you first login to Gorgias you will land on the "Tickets" page. The view will be in will be the first view in the list. If you click the 3 vertical dots to the right of "Tickets" in the top left corner you will be able to access your primary menu; Tickets, Customers, Statistics, Settings.</p><p></p><figure><img src="https://files.helpdocs.io/eQ5bRgGfSN/articles/le71oayg59/1544130032255/screen-shot-2018-12-06-at-3-59-01-pm.png"></figure><p>On every page in your helpdesk you will also be able to access Gorgias Customer Support and the agent resource menu. </p><p>To connect with the Gorgias Customer Support team, use the chat bubble icon on the bottom right. </p><p>To access the Agent Resource Menu, click on your name on the bottom left. In this menu you will find: Log out, Keyboard Shortcuts, Your Profile, Help Center, Chat Availability Status, and What\'s New.</p><p></p><figure><img src="https://files.helpdocs.io/eQ5bRgGfSN/articles/le71oayg59/1544130603821/screen-shot-2018-12-06-at-4-09-14-pm.png"></figure><p></p>',
                    '<p>If you are just getting started with Gorgias, this will be your step by step guide on how to get up and running in no time.&nbsp;</p>\n<h3>Setting Up Your First Integrations</h3>\n<p>Once you have signed up for an account you are going to want to start getting your main communication channels integrated. Start with your email, social media accounts, and Shopify store. Take a look at the video below where we show you exactly how to do that.&nbsp;</p>\n<p></p>\n<p>Now that you have those integrated, let\'s take a look at the email and social media integrations and the different settings you can customize.</p>\n<h4>Email Integration</h4>\n<p>In the email integration that you have set up, you can now import the last 100 emails received and also set up your <a href="https://docs.gorgias.io/faq/signatures" target="_blank">signature</a>. Take a look at the short clip below to see it in action!</p>\n<p></p>\n<h4>Facebook Integration</h4>\n<p>The Facebook integration allows you to manage your messages, comments, and Instagram comments as tickets. (We will dive into exactly what that looks like later.) Take a look at the graphics below that shows the different settings within the Facebook integration and what they do.<br></p><figure><img src="https://files.helpdocs.io/eQ5bRgGfSN/articles/lzqky10vp0/1531419446749/image.png" data-image="1531419446749"></figure>\n<h3>Creating Macros and Tags</h3>\n<p>Now that you have your initial integrations set up you can start setting up your macros and tags. Macros in Gorgias are similar to what is commonly referred to as \'canned responses\'.&nbsp; Macros, are templates, or premade responses that allow you to quickly respond to commonly asked questions.&nbsp; &nbsp;In Gorgias, a macro also has the ability to include various actions, auto fill customer specific data, and more. Tags in Gorgias are a way to label your tickets. As we get into rules, views, and statistics I will show you the many ways tags can be utilized. When you go into your tags list you will see a handful of tags that are most commonly used by our customers.&nbsp;</p>\n<h4>&nbsp;Tags</h4>\n<p>In the image below you will see where to access all of your tags, the two places where you can create them, and also how to add them to a ticket.&nbsp;</p>\n<figure><img src="https://files.helpdocs.io/eQ5bRgGfSN/articles/lzqky10vp0/1531414029330/image.png" data-image="1531414029330"></figure>\n<p>Creating a tag in a ticket</p>\n<figure><img src="https://files.helpdocs.io/eQ5bRgGfSN/articles/lzqky10vp0/1531414082998/image.png" data-image="1531414082998"></figure>\n<h4><br>Macros<br></h4>\n<p>Take a look at the quick video below to see how to access your macros, create and edit macros, and the different data and actions that can be utilized in them.&nbsp;</p>\n<figure><iframe style="width: 500px; height: 281px;" src="//www.youtube.com/embed/hX27Bx9xWAM" frameborder="0" allowfullscreen=""></iframe></figure>\n<p></p>\n<h3>Setting Up Views</h3>\n<p>Views are an excellent way to organize and prioritize tickets in your helpdesk. The video below shows how views work. It\'s important to note that views do not function in the same way as folders do. You are not actually moving tickets from one view to another. Instead, think of it as filters that will be applied to your entire database of tickets. Also, when you add a new social media or email integration a new view for those will automatically be populated.</p>\n<figure><iframe width="500" height="281" src="//www.youtube.com/embed/E4t0mTFjNss" frameborder="0" allowfullscreen=""></iframe></figure>\n<h3></h3>\n<h3>Additional Integrations</h3>\n<p>Now that you have the basics of your helpdesk setup, you may have additional integrations you want to add. Below you will find links to some of our most commonly utilized integrations. For instructions on all of our integrations, <a href="https://docs.gorgias.io/integrations" target="_blank">click here</a>. Make sure to also check out our <a href="https://docs.gorgias.io/integrations/http-integrations" target="_blank">HTTP Integrations</a> article for some of our custom integrations. (Please note that certain custom integrations require manual work on our end and are only available to Pro Plans or higher and you must be on an active plan and not still in trial.)</p>\n<p><a href="https://docs.gorgias.io/integrations/aircall" target="_blank">Aircall</a>&nbsp;</p>\n<p><a href="https://docs.gorgias.io/integrations/chat" target="_blank">Chat</a></p>\n<p><a href="https://docs.gorgias.io/integrations/helpdocs" target="_blank">HelpDocs</a></p>\n<p><a href="https://docs.gorgias.io/integrations/klaviyo" target="_blank">Recharge</a></p>\n<p><a href="https://docs.gorgias.io/integrations/klaviyo" target="_blank">Klaviyo</a></p>\n<h3>Team Work</h3>\n<p>With Gorgias you can have an unlimited amount of team members no matter what plan you are on. Only an admin can add or remove team members. Take a look at the graphic below that shows you how to add your team members. You can set the role of agent or admin. Only Admin will have access to Billing, Rules, Integrations, Team Members, and can edit/delete tags.</p>\n<h5>Adding Team Members</h5>\n<p></p>\n<h3>Zendesk Migration</h3>\n<p>If you are migrating from Zendesk <a href="https://docs.gorgias.io/general/switching-from-zendesk" target="_blank">click here</a> for a step by step tutorial. Please note that Zendesk Migration is for Pro Plan subscribers or higher and must have an active subscription (cannot still be in free trial).</p>\n<p></p>\n<p>You are all set now! If you have any questions please email us at support@gorgias.io or click on the chat bubble in the bottom right corner of your help desk to chat with us.</p>',
                ],
            },
            {
                name: 'tags',
                samples: [
                    'how to;use case;rules;views;automation',
                    'integration',
                    'how to;signature',
                    'views',
                    'requester;customer data;how to',
                ],
            },
            {name: 'is_published', samples: ['true', 'false']},
            {name: 'is_private', samples: ['false', 'true']},
            {name: 'show_toc', samples: ['false', 'true']},
            {name: 'is_featured', samples: ['false', 'true']},
            {name: 'editor_type', samples: ['wysiwyg']},
            {
                name: 'user_id',
                samples: [
                    'crC5ECobX8',
                    'jd76euh8zd',
                    'stbrm3gewi',
                    'spht9orrbm',
                    'nphckr9e8d',
                ],
            },
            {
                name: 'author_name',
                samples: [
                    'Alex Plugaru',
                    'Chloe Kesler',
                    'Yohan Loyer',
                    'Amy Elenius',
                    'Thomas Trinelle',
                ],
            },
            {
                name: 'url',
                samples: [
                    'https://docs.gorgias.com/what-is-gorgias-help-desk/what-is-gorgias-helpdesk',
                    'https://docs.gorgias.com/what-is-gorgias-help-desk/obfuscating-credit-card-and-social-security-numbers-from-tickets',
                    'https://docs.gorgias.com/general/get-connected',
                    'https://docs.gorgias.com/general/navigating-gorgias',
                    'https://docs.gorgias.com/general/onboarding-guide',
                ],
            },
            {
                name: 'relative_url',
                samples: [
                    '/what-is-gorgias-help-desk/what-is-gorgias-helpdesk',
                    '/what-is-gorgias-help-desk/obfuscating-credit-card-and-social-security-numbers-from-tickets',
                    '/general/get-connected',
                    '/general/navigating-gorgias',
                    '/general/onboarding-guide',
                ],
            },
            {
                name: 'category_id',
                samples: [
                    'zjy73qb3q5',
                    'dQU8uedpLQ',
                    'v6w22r6jce',
                    '27j0j8r4cr',
                    'NtpsrYXTA6',
                ],
            },
            {
                name: 'category_title',
                samples: [
                    'What is Gorgias?',
                    'Getting Started',
                    'Statistics and Reporting',
                    'Rules',
                    'Integrations',
                ],
            },
            {
                name: 'category_url',
                samples: [
                    'https://docs.gorgias.com/what-is-gorgias-help-desk',
                    'https://docs.gorgias.com/general',
                    'https://docs.gorgias.com/statistics',
                    'https://docs.gorgias.com/rules',
                    'https://docs.gorgias.com/integrations',
                ],
            },
            {
                name: 'category_relative_url',
                samples: [
                    '/what-is-gorgias-help-desk',
                    '/general',
                    '/statistics',
                    '/rules',
                    '/integrations',
                ],
            },
            {name: 'is_stale', samples: ['false']},
            {name: 'stale_reason', samples: ['Article updated']},
            {name: 'stale_source', samples: ['API']},
            {
                name: 'stale_triggered_at',
                samples: [
                    '2021-07-06T21:19:26Z',
                    '2021-07-06T21:44:52Z',
                    '2021-04-26T10:09:32Z',
                    '2021-06-08T10:15:54Z',
                    '2021-08-03T13:09:24Z',
                ],
            },
            {name: 'permission_groups', samples: []},
            {name: 'permission_groups_names', samples: []},
            {
                name: 'updated_at',
                samples: [
                    '2021-07-06T21:19:26Z',
                    '2021-07-06T21:44:52Z',
                    '2021-04-26T10:09:32Z',
                    '2021-06-08T10:15:54Z',
                    '2021-08-03T13:09:24Z',
                ],
            },
            {
                name: 'created_at',
                samples: [
                    '2017-06-08T22:47:59Z',
                    '2017-07-05T17:08:46Z',
                    '2018-12-06T21:30:47Z',
                    '2018-12-06T20:51:41Z',
                    '2018-06-21T20:52:11Z',
                ],
            },
        ],
    }
