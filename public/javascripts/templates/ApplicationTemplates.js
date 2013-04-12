app.templates.application = '<div class="application-inner"> \
                              <a href="#"> <img class = "delete" src="img/ui_icons/delete.png" /> </a>\
                              <span class="url"> <%= application.url %> </span> \
                              <a href="http://<%= application.url %>"> <img class="grid-img" src="img/app_icons/<%= img %>-square.png" \
                              onerror="this.src=\'<%= img_default %>\'" /> </a>\
                            </div>';

app.templates.grid = '<!-- <div id="grid"> -->\
                          <!-- <tr> --> \
                          <!-- </tr> --> \
                          <!-- </div> -->'

app.templates.grid_row = '<div class="row"><div class="cf row-wrapper"></div></div>';
