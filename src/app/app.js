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
        'oi.select'
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
            },
            jobs: {
                url: '/user/jobs',
                handler: {
                    templateUrl: 'common/templates/user-jobs.html',
                    controller: 'UserJobsCtrl as ctrl'
                }
            },
            job_manage: {
                url: '/user/job/:id',
                resolve: function (obj) {
                    return '/user/job/' + obj.id;
                },
                handler: {
                    templateUrl: 'common/templates/user-job.html',
                    controller: 'UserJobsManageCtrl as ctrl'
                }
            },
            job_comments: {
                url: '/user/job/:id/comments',
                resolve: function (obj) {
                    return '/user/job/' + obj.id + '/comments';
                },
                handler: {
                    templateUrl: 'common/templates/user-job-comments.html',
                    controller: 'UserJobsCommentsCtrl as ctrl'
                }
            },
            job_candidates: {
                url: '/user/job/:id/candidates',
                resolve: function (obj) {
                    return '/user/job/' + obj.id + '/candidates';
                },
                handler: {
                    templateUrl: 'common/templates/user-job-candidates.html',
                    controller: 'UserJobsCandidatesCtrl as ctrl'
                }
            },
            job_candidate: {
                url: '/user/job/:job_id/candidate/:job_user_id',
                resolve: function (job_id, job_user_id) {
                    return '/user/job/' + job_id + '/candidate/' + job_user_id;
                },
                handler: {
                    templateUrl: 'common/templates/user-job-candidate.html',
                    controller: 'UserJobsCandidateCtrl as ctrl'
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
        company: {
            register: {
                url: '/company/register',
                handler: {
                    templateUrl: 'common/templates/register-company-user.html',
                    controller: 'RegisterCompanyCtrl as ctrl'
                }
            }
        }
    })
    .run(['$rootScope', 'justRoutes', 'justFlowService', function ($rootScope, routes, flow) {
        $rootScope.routes = routes;
        $rootScope.next = function (url) {
            flow.next(url);
        };
    }])
    .config(function ($routeProvider, $locationProvider, justRoutes) {
        angular.forEach(justRoutes, function (comp) {
            angular.forEach(comp, function (route) {
                $routeProvider.when(route.url, route.handler);
            });
        });

        /*    $locationProvider.html5Mode(true);
         $locationProvider.hashPrefix('!'); */
    })
    .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('just-arrived')
            .setStorageType('sessionStorage');
    }])
    .config(function (uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyAQ-Iu3YFs_qXky2rAZNicY5gh6ampBq-M',
            v: '3.20',
            libraries: 'weather,geometry,visualization'
        });
    });
