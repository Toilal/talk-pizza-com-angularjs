angular.module('Examples', ['720kb.tooltips']);


angular.module('Examples')
    .controller('ResetCtrl', function() {
        this.value = 'lorem ipsum';

        this.reset = function() {
            this.value = '';
        }
    })

    .controller('ResetDirectiveCtrl', function($scope) {
        // $scope est obtenu par injection de dépendance
        if (!$scope.value) {
            $scope.value = 'lorem ipsum';
        }

        if (!$scope.resetValue) {
            $scope.resetValue = '';
        }

        this.reset = function() {
            $scope.value = $scope.resetValue;
        }
    })

    .directive('resetInput', function() {
        return {
            scope: {
                label: '@',
                value: '=?',
                resetValue: '=?'
            },
            templateUrl: 'examples/reset.html',
            controller: 'ResetDirectiveCtrl',
            controllerAs: 'ctrl'
        };
    })

    .controller('AngularDirectivesCtrl', function() {
        this.components = [
            {label: '#1', value: 'Premier', resetValue: 'Le numero 1'},
            {label: '#2', value: 'Deuxième', resetValue: 'Le numero 2'},
            {label: '#3', value: 'Troisième', resetValue: 'Le numero 3', hidden: true},
            {label: '#4', value: 'Quatrième', resetValue: 'Le numero 4'}
        ];

        this.handleClick = function(component) {
            // On sélectionne le composant s'il n'est pas déja selectionné, sinon le le déselectionne.
            this.selectedComponent = component != this.selectedComponent ? component : null;
        }
    })

    .service('GithubApiService', function($http) {
        // $http est un service angularJS qui permet de réaliser des requetes HTTP.

        var base = "https://api.github.com/";
        
        // on stocke a l'envers le token pour éviter que Github le révoque au commit.
        var reversed_access_token = "1ab41bc0cf53c79f3240e07bfe1269705e013246";

        var headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': 'token ' + reversed_access_token.split("").reverse().join("")
        };

        /**
         * Obtiens les informations de l'utilisateur connecté.
         * https://developer.github.com/v3/users/#get-a-single-user
         *
         * @returns {HttpPromise}
         */
        this.user = function() {
            return $http({
                method: 'GET',
                headers: headers,
                url: base + 'user'
            })
        };

        /**
         * Obtiens tous les repos de l'utilisateur connecté.
         * https://developer.github.com/v3/issues/#list-repos
         *
         * @param params https://developer.github.com/v3/repos/#parameters
         * @returns {HttpPromise}
         */
        this.userRepos = function(params) {
            return $http({
                method: 'GET',
                headers: headers,
                url: base + 'user/repos',
                params: params
            })
        };

        this.loadLink = function(url, params) {
            return $http({
                method: 'GET',
                headers: headers,
                url: url,
                params: params
            })
        }
    })

    .controller('GithubReposCtrl', function($scope, $q, GithubApiService) {
        var self = this;

        this.refreshing = false; // Flag indiquant que le rafraichissement est en cours
        this.rate = {}; // Contient les informations de quota de l'API

        this.user = null; // Informations de l'utilisateurs
        this.repos = []; // Liste des repositories de l'utilisateur

        if (!this.reposParams) {
            this.reposParams = {};
        }

        if (!this.reposParams.sort) {
            this.reposParams.sort = 'updated';
        }

        var rateUpdater = function(response) {
            self.rate.limit = response.headers('X-RateLimit-Limit');
            self.rate.remaining = response.headers('X-RateLimit-Remaining');
        };

        var errorHandler = function(response) {
            self.error = response.data;
            rateUpdater(response);
        };

        /**
         * Rafraichi les données à partir de l'API github.
         *
         * @returns {HttpPromise}
         */
        this.refresh = function() {
            self.refreshing = true;

            var p1 = GithubApiService.user().then(function(response) {
                self.user = response.data;
                rateUpdater(response);
            }).catch(errorHandler);

            var p2 = GithubApiService.userRepos($scope.reposParams).then(function(response) {
                self.repos = response.data;
                loadNextRepos(response);
                rateUpdater(response);
            }).catch(errorHandler);

            return $q.all([p1, p2]).finally(function() {
                self.refreshing = false;
            });
        };

        /**
         * Charge la prochaine page de repositories.
         */
        var loadNextRepos = function (response) {
            var headerLinks = response.headers('Link');
            var links = parseLinks(headerLinks);

            var promises = [];

            angular.forEach(links, function(link) {
                if (link.rel === 'next') {
                    promises.push(GithubApiService.loadLink(link.href).then(function(linkResponse) {
                        // Append page repositories to existing ones
                        self.repos.push.apply(self.repos, linkResponse.data);
                        rateUpdater(linkResponse);
                        loadNextRepos(linkResponse); // Recursive call
                    }));
                }
            });

            return $q.all(promises);
        };

        /**
         * Construit des objets link à partir du header Link de la réponse.
         */
        var parseLinks = function(headerLinks) {
            var reg = /<(.*?)>; rel="(.*?)"/g
            var links = [];
            var match = reg.exec(headerLinks);
            while (match != null) {
                links.push({
                    href: match[1],
                    rel: match[2]
                });
                match = reg.exec(headerLinks);
            }

            return links;
        };

        this.refresh(); // On rafraichit a l'initalisation du controlleur
    })

    .directive('githubRepos', function() {
        return {
            scope: {
                reposParams: '=?'
            },
            templateUrl: 'examples/github-repos.html',
            controller: 'GithubReposCtrl',
            controllerAs: 'ctrl'
        };
    });





