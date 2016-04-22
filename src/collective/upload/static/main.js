$(document).ready(function() {
  // Handler for .ready() called.
  config_upload_form = function() {
    'use strict';

    //we have to check if the fileupload element existing

    if ($('#fileupload')[0] !== undefined) {
      var files_re = new RegExp('(\\.|\/)(' + jupload.config['extensions'] + ')$', 'i');
      // Initialize the jQuery File Upload widget:
      $('#fileupload').fileupload({
        'sequentialUploads': true,
        'singleFileUploads': true
      });

      // Enable iframe cross-domain access via redirect option:
      $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
          /\/[^\/]*$/,
          '/cors/result.html?%s'
        )
      );

      $('#fileupload').fileupload('option', {
        url: '',
        maxFileSize: jupload.config['max_file_size'],
        acceptFileTypes: files_re,
        process: [{
          action: 'load',
          fileTypes: files_re,
          maxFileSize: jupload.config['max_file_size']
        }, {
          action: 'resize',
          maxWidth: jupload.config['resize_max_width'],
          maxHeight: jupload.config['resize_max_height']
        }, {
          action: 'save'
        }],
        start_i18n: jupload.messages['START_MSG'],
        cancel_i18n: jupload.messages['CANCEL_MSG'],
        delete_i18n: jupload.messages['DELETE_MSG'],
        description_i18n: jupload.messages['DESCRIPTION_MSG'],
        error_i18n: jupload.messages['ERROR_MSG']
      });
      // Upload server status check for browsers with CORS support:
      if ($.support.cors) {
        $.ajax({
          url: './',
          type: 'HEAD'
        }).fail(function() {
          $('<span class="alert alert-error"/>')
            .text('Upload server currently unavailable - ' +
              new Date())
            .appendTo('#fileupload');
        });
      }

      // main settings:
      // var files_re = new RegExp('(\\.|\/)('+jupload.config['extensions']+')$', 'i');
      // $('#fileupload').fileupload('option', {
      //     maxFileSize: jupload.config['max_file_size'],
      //     acceptFileTypes: files_re,
      //     resizeMaxWidth: jupload.config['resize_max_width'],
      //     resizeMaxHeight: jupload.config['resize_max_height']
      // });
      // // Upload server status check for browsers with CORS support:
      // if ($.support.cors) {
      //     $.ajax({
      //         url:'',
      //         type: 'HEAD'
      //     }).fail(function () {
      //         $('<span class="alert alert-error"/>')
      //             .text('Upload server currently unavailable - ' +
      //                     new Date())
      //             .appendTo('#fileupload');
      //     });
      // }

      // //in the latest version we have a method formData who actually is
      // // doing this...=)
      $('#fileupload').bind('fileuploadsubmit', function(e, data) {
        var inputs;
        if (data.context) {
          inputs = data.context.find(':input');
        } else {
          inputs = data.form.find(':input');
        }
        if (inputs.filter('[required][value=""]').first().focus().length) {
          return false;
        }
        data.formData = inputs.serializeArray();
      });

      $(document).bind('drop', function(e) {
        var url = $(e.originalEvent.dataTransfer.getData('text/html')).filter('img').attr('src');
        if (url) {
          $.getImageData({
            url: url,
            server: 'http://localhost:8080/Plone/@@jsonimageserializer?callback=?',
            success: function(img) {
              var canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              if (canvas.getContext && canvas.toBlob) {
                canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                canvas.toBlob(function(blob) {
                  $('#fileupload').fileupload('add', {
                    files: [blob]
                  });
                }, "image/jpeg");
              }
            },
            error: function(xhr, text_status) {
              // Handle your error here
            }
          });
        }
        e.preventDefault();
      });

    }

  };
  config_upload_form();

  //overlay
  $('#plone-contentmenu-factories #multiple-files').prepOverlay({
    subtype: 'ajax',
    filter: common_content_filter,
    config: {
      onLoad: function(arg) {
        config_upload_form();
      }
    }
  });
});
