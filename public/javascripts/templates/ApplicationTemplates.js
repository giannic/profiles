app.templates.application = '<a class="url" href="http://<%= application.url %>"> <%= application.url %> </a>';

app.templates.grid = '<!-- <div id="grid"> -->\
                          <!-- <tr> --> \
                          <!-- </tr> --> \
                          <!-- </div> -->'

app.templates.grid_row = '<div class="row"><div class="cf row-wrapper"></div></div>';
  // "<table class=\"table table-striped\" id=\"user-table\">\n  <thead>\n    <tr>\n      <% _.each(headers, function(header) { %>\n      <th   <% if (selected === header) { %>class='selected'<% } %> data-by='<%= header %>'><%= header.capitalize() %></th>\n      <% }) %>\n    </tr>\n  </thead>\n  <tbody        id=\"editor-table\">\n  </tbody>\n</table>\n";
app.templates.grid_img = '<img class="grid-img" src="<%= img %>"/>'
