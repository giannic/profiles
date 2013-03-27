root.app.templates.application = 'this is an app';

root.app.templates.grid = '<!-- <div id="grid"> -->\
                          <!-- <tr> --> \
                          <!-- </tr> --> \
                          <!-- </div> -->'

  // "<table class=\"table table-striped\" id=\"user-table\">\n  <thead>\n    <tr>\n      <% _.each(headers, function(header) { %>\n      <th   <% if (selected === header) { %>class='selected'<% } %> data-by='<%= header %>'><%= header.capitalize() %></th>\n      <% }) %>\n    </tr>\n  </thead>\n  <tbody        id=\"editor-table\">\n  </tbody>\n</table>\n";

