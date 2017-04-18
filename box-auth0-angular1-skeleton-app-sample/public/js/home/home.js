angular.module('appAuth.home', ['ngMaterial', 'ngFileUpload'])
  .controller('HomeCtrl', ['$scope', '$http', '$location', '$timeout', 'Upload', 'authenticationService', 'boxApiService', '$mdDialog', '$sce', 'APP_CONFIG',
    function HomeController($scope, $http, $location, $timeout, Upload, authenticate, boxApi, $mdDialog, $sce, APP_CONFIG) {
      $scope.rootFolder = '0';
      $scope.profile = JSON.parse(localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_PROFILE_STORAGE_KEY)) || {};
      $scope.persistentBoxClient = boxApi.persistentBoxClient();
      $scope.persistentBoxClientOptionsOnly = boxApi.persistentBoxClientOptionsOnly();
      $scope.items = [];
      $scope.folders = [];
      $scope.files = [];

      function showError(response) {
        if (response instanceof Error) {
          console.log('Error', response.message);
        } else {
          console.log(response.data);
          console.log(response.status);
          console.log(response.headers);
          console.log(response.config);
        }
      }

      function getItems() {
        $scope.$emit(APP_CONFIG.EVENTS.START_LOADING);
        $scope.persistentBoxClient.folders.get({ id: $scope.rootFolder, fields: "item_collection,name" })
          .then(function (response) {
            var rootFolder = response.data;
            console.log(rootFolder);
            $scope.items = rootFolder.item_collection.entries;
            separateItemsAndRetrieveExtension(rootFolder.item_collection.entries);
            $scope.$emit(APP_CONFIG.EVENTS.FINISH_LOADING);
          })
          .catch(function (response) {
            alert('root folder get failed');
            showError(response);
          });
      }

      function separateItemsAndRetrieveExtension(items) {
        angular.forEach(items, function (item) {
          if (item.type === "file") {
            var splitItem = item.name.split('.');
            var fileExtension = (splitItem.length > 1) ? splitItem[1] : null;
            if (fileExtension !== null) {
              item.fileExtension = fileExtension;
            }
            $scope.files.push(item);
          } else if (item.type === "folder") {
            $scope.folders.push(item);
          }
        });
        console.log($scope.files);
      }

      function previewFile(fileId) {
        $scope.persistentBoxClient.files.getEmbedLink({ fileId: fileId, fields: "name" })
          .then(function (response) {
            var previewLink = response.data.expiring_embed_link.url;
            var fileName = response.data.name;
            console.log(previewLink);
            openPreviewModal(previewLink, fileName);
          }).catch(function (response) {
            alert('preview file failed');
            showError(response);
          });
      }

      function openPreviewModal(previewLink, fileName) {
        $mdDialog.show({
          locals: {
            previewLink: $sce.trustAsResourceUrl(previewLink),
            fileName: fileName
          },
          controller: DialogController,
          templateUrl: './js/components/previewModal/previewModal.html',
          parent: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true // Only for -xs, -sm breakpoints.
        });
      }

      function DialogController($scope, $mdDialog, previewLink, fileName) {
        $scope.previewLink = previewLink;
        $scope.fileName = fileName;

        $scope.cancel = function () {
          $mdDialog.cancel();
        };
      }

      function createNewFolder(ev) {
        // $scope.persistentBoxClient.folders.get({ id: $scope.rootFolder, fields: "item_collection,name" })
        var confirm = $mdDialog.prompt()
          .title('Please name your folder.')
          .placeholder('Folder name')
          .ariaLabel('Folder name')
          .clickOutsideToClose(true)
          .targetEvent(ev)
          .ok('Create')
          .cancel('Cancel');

        $mdDialog.show(confirm).then(function (result) {
          if (!result) {
            $scope.status = "Folder name is required.";
          } else if (result) {
            $scope.persistentBoxClient.folders.create({ parent: { id: $scope.rootFolder }, name: result })
              .then(function (response) {
                console.log(response.data);
                var folder = response.data;
                $scope.folders.push(folder);
                $scope.status = "Created folder: " + folder.name;
              })
              .catch(function (err) {
                $scope.status = "Couldn't create folder.";
              });
          }
        }, function () {
          $scope.status = 'No new folder created.';
        })
          .finally(function () {
            $timeout(function () {
              $scope.status = '';
            }, 3000);
          });
      }

      function uploadFile() {
        $mdDialog.show({
          locals: {
            persistentBoxClientOptionsOnly: $scope.persistentBoxClientOptionsOnly,
            files: $scope.files
          },
          controller: UploadDialogController,
          templateUrl: './js/components/upload/upload.html',
          parent: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true // Only for -xs, -sm breakpoints.
        })
          .then(function (result) {
            console.log("OK");
            console.log(result);
            console.log($scope.files);
          }, function (cancelled) {
            console.log("Cancel...");
            console.log(cancelled);
            console.log($scope.files);
          });
      }

      function UploadDialogController($scope, $mdDialog, persistentBoxClientOptionsOnly, files) {
        $scope.upload = function (uploadFiles) {
          var uploadPromises = [];
          angular.forEach(uploadFiles, function (file) {
            uploadPromises.push(persistentBoxClientOptionsOnly.files.upload({ body: file }));
          });

          Promise.all(uploadPromises)
            .then(function (options) {
              console.log(options);
              angular.forEach(options, function (option) {
                Upload.upload({
                  url: option.url,
                  data: { file: option.body, parent_id: '0' },
                  headers: option.headers
                })
                  .then(function (resp) {
                    $timeout(function () {
                      console.log(resp.data);
                      angular.forEach(resp.data.entries, function (entry) {
                        files.push(entry);
                      });
                      $mdDialog.hide();
                    });
                  });
              });
            });
        }
      }

      $scope.deleteFile = function (id) {
        $scope.persistentBoxClient.files.delete(id)
          .then(function () {
            $scope.files.filter(function (file, index) {
              if (file.id === id) {
                $scope.files.splice(index, 1);
              }
            });
            $scope.$applyAsync();
          })
      }

      $scope.deleteFolder = function (id) {
        $scope.persistentBoxClient.folders.delete(id)
          .then(function () {
            $scope.folders.filter(function (folder, index) {
              if (folder.id === id) {
                $scope.folders.splice(index, 1);
              }
            });
            $scope.$applyAsync();
          })
      }

      $scope.uploadFile = uploadFile;

      $scope.previewFile = function (fileId) {
        previewFile(fileId);
      }

      $scope.createNewFolder = createNewFolder;

      getItems();
      console.log($scope.folders);
    }]);
