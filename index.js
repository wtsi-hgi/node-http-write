// httpWrite
// Raw HTTP response writer with basic templating

// MIT License
// Copyright (c) 2014 Genome Research Limited

module.exports = (function() {
  var stdout = process.stdout,
      eol    = '\r\n';

  // HTTP status codes
  var httpStatus = require('./httpStatus.json');

  // Header management
  var headersSent      = false,
      AlreadySentError = new Error('Headers already sent');

  var html = {'Content-Type': 'text/html'};

  return {
    // Simple templating engine
    template: (function() {
      var templates = {
        '_error': '<html><head><title>{{status}} {{response}}</title></head>' +
                  '<body><h1>{{response}}</h1><p>{{body}}</p></body></html>'
      };

      var engine = function(id, data) {
        var output = templates[id] || 'No such template';

        // Merge keys
        for (key in data) {
          if (data.hasOwnProperty(key)) {
            var findKey = new RegExp('{{' + key + '}}', 'g');
            output = output.replace(findKey, data[key]);
          }
        }

        return output;
      };

      // Create a new template
      engine.create = function(/* [id,] template */) {
        switch (arguments.length) {
          case 1:
            // Add multiple templates by hash
            for (id in arguments[0]) {
              if (arguments[0].hasOwnProperty(id)) {
                templates[id] = arguments[0][id];
              }
            }
            break;

          case 2:
            // Add single template by ID
            templates[arguments[0]] = arguments[1];
            break;

          default:
            break;
        }
      };

      return engine;
    })(),

    // Write HTTP headers
    headers: function(status, headerData) {
      if (!headersSent) {
        // Write HTTP status
        stdout.write('Status: ' + status + ' ' +
                     (httpStatus[status] || 'Unknown Status') + eol);

        // Write header data
        for (header in headerData) {
          if (headerData.hasOwnProperty(header)) {
            stdout.write(header + ': ' + headerData[header] + eol);
          }
        }

        stdout.write(eol);
        headersSent = true;

      } else {
        throw AlreadySentError;
      }
    },
    
    // Write HTTP response
    body: function(/* [template,] data */) {
      var output;

      if (!headersSent) {
        // Default header
        this.headers(200, html);
      }

      switch (arguments.length) {
        case 1:
          // Write raw data
          output = arguments[0];
          break;

        case 2:
          // Write template
          output = this.template(arguments[0], arguments[1]);
          break;

        default:
          break;
      }

      stdout.write(output);
    },

    // Write standard error response
    error: function(status, body) {
      if (!headersSent) {
        this.headers(status, html);
        this.body('_error', {
          status:   status,
          response: httpStatus[status] || 'Unknown Status',
          body:     body
        });

        process.exit(status);
      
      } else {
        throw AlreadySentError;
      }
    }
  };
})();
