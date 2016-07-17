/**
 * @ngdoc object
 * @name just
 * @description
 *
 * The main module just for the Just Arrived application.
 */
angular.module('just', [
    'templates-app',
    'ngRoute',
    'ngResource',
    'ngSanitize',
    'just.constant',
    'just.common',
    'just.service',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'LocalStorageModule',
    'beauby.jsonApiDataStore',
    'just.translate',
    'slick',
    'uiGmapgoogle-maps',
    'AxelSoft',
    'oi.select',
    'monospaced.elastic',
    'angular-google-analytics',
    'ngCookies'
])
    .constant('justRoutes', {
        global: {
            start: {
                url: '/',
                handler: {
                    templateUrl: 'common/templates/start.html',
                    controller: 'StartCtrl as ctrl'
                }
            },
            terms: {
                url: '/terms',
                handler: {
                    templateUrl: 'common/templates/terms.html'
                }
            },
            select_language: {
                url: '/select-language',
                handler: {
                    templateUrl: 'common/templates/select-language.html',
                    controller: 'LanguageCtrl as ctrl'
                }
            },
            menu: {
                url: '/menu',
                handler: {
                    templateUrl: 'common/templates/menu.html'
                }
            },
            faq: {
                url: '/faq',
                handler: {
                    templateUrl: 'common/templates/faq.html',
                    controller: 'FAQCtrl as ctrl'
                }
            },
            warning: {
                url: '/warning',
                handler: {
                    templateUrl: 'common/templates/warning.html',
                    controller: 'WarningCtrl as ctrl'
                }
            },
            forgot_password: {
                url: '/forgot_password',
                handler: {
                    templateUrl: 'common/templates/forgot-password.html',
                    controller: 'ForgotPasswordCtrl as ctrl'
                }
            },
            reset_password_confirm: {
                url: '/reset_password/:token',
                resolve: function (token) {
                    return '/reset_password/' + token;
                },
                handler: {
                    templateUrl: 'common/templates/reset-password.html',
                    controller: 'ResetPasswordCtrl as ctrl'
                }
            },
            confirmation: {
                url: '/confirmation',
                handler: {
                    templateUrl: 'common/templates/confirmation.html',
                    controller: 'ConfirmationCtrl as ctrl'
                }
            },
            promo: {
                url: '/promo',
                handler: {
                    templateUrl: 'common/templates/promo.html',
                }
            },
            chat: {
                url: '/chat/:chat_id',
                resolve: function (id) {
                    return '/chat/' + id;
                },
                handler: {
                    templateUrl: 'common/templates/chat.html',
                    controller: 'ChatCtrl as ctrl'
                }
            },
            cookies: {
                url: '/cookies_about',
                handler: {
                    templateUrl: 'common/templates/cookies_about.html'
                }
            }
        },
        user: {
            select: {
                url: '/user/select',
                handler: {
                    templateUrl: 'common/templates/select-login.html'
                }
            },
            selectCompany: {
                url: '/user/select-company',
                handler: {
                    templateUrl: 'common/templates/select-login-company.html'
                }
            },
            register: {
                url: "/user/register",
                handler: {
                    templateUrl: 'common/templates/register.html',
                    controller: 'RegisterCtrl as ctrl'
                }
            },
            signin: {
                url: '/user/signin',
                handler: {
                    templateUrl: 'common/templates/signin.html',
                    controller: 'SigninCtrl as ctrl'
                }
            },
            signed_in: {
                url: '/user/welcome',
                handler: {}
            },
            user: {
                url: '/user',
                handler: {
                    templateUrl: 'common/templates/user.html',
                    controller: 'UserCtrl as ctrl'
                }
            }
        },
        job: {
            create: {
                url: '/job/create',
                handler: {
                    templateUrl: 'common/templates/new-job.html',
                    controller: 'CreateJobCtrl as ctrl'
                }
            },
            approve: {
                url: '/job/approve',
                handler: {
                    templateUrl: 'common/templates/approve-job.html',
                    controller: 'ApproveJobCtrl as ctrl'
                }
            },
            approved: {
                url: '/job/approved',
                handler: {
                    templateUrl: 'common/templates/approved-job.html'
                }
            },
            update: {
                url: '/jobs/:id',
                resolve: function (obj) {
                    return '/jobs/' + obj.id;
                },
                handler: {
                    templateUrl: 'common/templates/create-job.html',
                    controller: 'EditJobCtrl as ctrl'
                }
            },
            get: {
                url: '/jobs/:id',
                resolve: function (obj) {
                    return '/jobs/' + obj.id;
                },
                handler: {
                    templateUrl: 'common/templates/view-job.html',
                    controller: 'ViewJobCtrl as ctrl'
                }

            },
            list: {
                url: '/jobs',
                handler: {
                    templateUrl: 'common/templates/list-jobs.html',
                    controller: 'ListJobCtrl as ctrl'
                }
            },
            accept: {
                url: '/job/accept',
                handler: {
                    templateUrl: 'common/templates/accepted-job.html',
                    controller: 'AcceptedJobCtrl as ctrl'
                }
            }
        },
        contact: {
            form: {
                url: '/contact/new',
                handler: {
                    templateUrl: 'common/templates/contact.html',
                    controller: 'ContactCtrl as ctrl'
                }
            },
            completed: {
                url: '/contact/completed',
                handler: {
                    templateUrl: 'common/templates/contact-completed.html',
                    controller: 'ContactCtrl as ctrl'
                }
            }
        },
        arriver: {
            jobs: {
                url: '/arriver/jobs',
                handler: {
                    templateUrl: 'common/templates/arriver-jobs.html',
                    controller: 'ArriverJobsCtrl as ctrl'
                }
            },
            job_manage: {
                url: '/arriver/job/:id',
                resolve: function (obj) {
                    return '/arriver/job/' + obj.id;
                },
                handler: {
                    templateUrl: 'common/templates/arriver-job.html',
                    controller: 'ArriverJobsManageCtrl as ctrl'
                }
            },
            job_comments: {
                url: '/arriver/job/:id/comments',
                resolve: function (obj) {
                    return '/arriver/job/' + obj.id + '/comments';
                },
                handler: {
                    templateUrl: 'common/templates/arriver-job-comments.html',
                    controller: 'ArriverJobsCommentsCtrl as ctrl'
                }
            }
        },
        company: {
            register: {
                url: '/company/register',
                handler: {
                    templateUrl: 'common/templates/register-company-user.html',
                    controller: 'RegisterCompanyCtrl as ctrl'
                }
            },
            jobs: {
                url: '/company/jobs',
                handler: {
                    templateUrl: 'common/templates/company-jobs.html',
                    controller: 'CompanyJobsCtrl as ctrl'
                }
            },
            job_manage: {
                url: '/company/job/:id',
                resolve: function (obj) {
                    return '/company/job/' + obj.id;
                },
                handler: {
                    templateUrl: 'common/templates/company-job.html',
                    controller: 'CompanyJobsManageCtrl as ctrl'
                }
            },
            job_comments: {
                url: '/company/job/:id/comments',
                resolve: function (obj) {
                    return '/company/job/' + obj.id + '/comments';
                },
                handler: {
                    templateUrl: 'common/templates/company-job-comments.html',
                    controller: 'CompanyJobsCommentsCtrl as ctrl'
                }
            },
            job_candidates: {
                url: '/company/job/:id/candidates',
                resolve: function (obj) {
                    return '/company/job/' + obj.id + '/candidates';
                },
                handler: {
                    templateUrl: 'common/templates/company-job-candidates.html',
                    controller: 'CompanyJobsCandidatesCtrl as ctrl'
                }
            },
            job_candidate: {
                url: '/company/job/:job_id/candidate/:job_user_id',
                resolve: function (job_id, job_user_id) {
                    return '/company/job/' + job_id + '/candidate/' + job_user_id;
                },
                handler: {
                    templateUrl: 'common/templates/company-job-candidate.html',
                    controller: 'CompanyJobsCandidateCtrl as ctrl'
                }
            }
        }
    })
    .run(['$rootScope', 'justRoutes', 'justFlowService', '$location', '$translate', 'customSelectDefaults', 'Analytics',
        function ($rootScope, routes, flow, $location, $translate, customSelectDefaults, Analytics) {
            $rootScope.$on('$locationChangeStart', function (event, next, current) {
                $rootScope.$$childHead.ctrl.isStartPage = false;
                $rootScope.$$childHead.ctrl.isBackUrl = false;
            });
            $rootScope.routes = routes;
            $rootScope.next = function (url) {
                flow.next(url);
            };
            $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
                // If we have queryString on currentURL , then we will add it to the next url
                if (oldUrl.indexOf('?') >= 0) {
                    // this can be optimized if we want to check first for queryString in the new url,
                    // then append only new params, but that's additional feature.
                    newUrl += '?' + oldUrl.split('?')[1];
                }
            });

            $translate('common.new_company').then(function (addText) {
                customSelectDefaults.addText = addText;
            });
            $translate('common.select_company').then(function (selectText) {
                customSelectDefaults.displayText = selectText;
            });
        }])
    .config(function ($routeProvider, $locationProvider, justRoutes, settings) {
        angular.forEach(justRoutes, function (comp) {
            angular.forEach(comp, function (route) {
                $routeProvider.when(route.url, route.handler);
            });
        });
        $routeProvider.otherwise({
            templateUrl: 'common/templates/error-404.html'
        });

        /*    $locationProvider.html5Mode(true);
         $locationProvider.hashPrefix('!'); */
    })
    .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('just-arrived')
            .setStorageType('localStorage');
    }])
    .config(['uiGmapGoogleMapApiProvider', 'settings', function (uiGmapGoogleMapApiProvider, settings) {
        uiGmapGoogleMapApiProvider.configure({
            key: settings.google_map_api_key,
            v: '3.20',
            libraries: 'weather,geometry,visualization'
        });
    }])
    .config(['$compileProvider', 'settings', function ($compileProvider, settings) {
        $compileProvider.debugInfoEnabled(settings.debug_enable);
    }])
    .config(['msdElasticConfig', function (msdElasticConfig) {
        msdElasticConfig.append = '\n';
    }])
    .config(['AnalyticsProvider', 'settings', function (AnalyticsProvider, settings) {
        if (settings.google_analytic_key) {
            if (settings.google_analytic_key !== '') {
                AnalyticsProvider.setAccount(settings.google_analytic_key);
            }
        }
    }]);
