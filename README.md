# httpWrite

Say you've taken leave of your wits and, rather than running your
Node.js application as an upstream server -- what Node.js does so well
-- you run it as a CGI script. Well, in which case, you'll want this, so
you can write out the HTTP response to `stdout` somewhat more easily!

## Installation

Install from NPM:

    npm install node-http-write

Then, to include in your software:

```js
var httpWrite = require('node-http-write');
```

# Documentation

## Templating

httpWrite provides a *very* basic (find-and-replace) templating engine,
to make your life slightly easier.

### `httpWrite.template.create([id,] template)`

Create a new template, either as an ID-template pair, or a hash of the
same. Both the ID and template must be strings. Template tags are
encoded within double curly braces.

For example:

```js
httpWrite.template.create('pageHeader', '<html><head><title>{{title}}</head>');
httpWrite.template.create({
  'pageBody':   '<body><p>Hello, {{name}}!</p></body>',
  'pageFooter': '</html>'
});
```

n.b., There is one predefined template, `_error`, which is used by the
HTTP error writing function (see below). This can be overridden, if
desired, with the following template tags:

* `{{status}}` HTTP status code (e.g., 404)
* `{{response}}` HTTP status message (e.g., Not Found)
* `{{body}}` Error text

### `httpWrite.template(id, data)`

Return the template given by `id`, merged with the key-value pairs
provided in `data` (where keys correspond to template tags). This
probably won't be used by you directly -- as it's called internally by
the main HTTP writer -- but can be useful if you want to create a new
template based on another (i.e., by specifying no `data`).

For example, using the definitions from above:

```js
var foo = httpWrite.template('pageBody', {name: 'John Doe'});
// foo is now "<body><p>Hello, John Doe!</p></body>"
```

## `httpWrite.headers(status, headerData)`

Write the HTTP headers, starting with the status code, then any further
headers specified as key-value pairs in `headerData`.

For example:

```js
httpWrite.headers(200, {'Content-Type': 'application/json'});
```

...will write:

```http
Status: 200 OK
Content-Type: application/json

```

Note that you can only write the HTTP headers once. If you attempt to
call it again, an exception will be thrown and the parent server should
takeover with a *500 Internal Server Error*.

n.b., You can omit the header writing explicitly; in which case, a
default *200 OK* header, in `text/html`, will be written.

## `httpWrite.body([template,] data)`

If you supply one argument (a string) to this function, that string will
simply be written.

If you supply two arguments, the `data` hash will be applied to the
`template` ID (as above) and the result will be written.

For example:

```js
// Output "Hello World!"
httpWrite.body('Hello World!');

// Output 'pageHeader' template with respective values
httpWrite.body('pageHeader', {title: 'An Example'});
```

n.b., If you haven't explicitly written any headers at this point, a
default *200 OK* header, in `text/html`, will be written.

# MIT License

Copyright (c) 2014 Genome Research Limited

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
