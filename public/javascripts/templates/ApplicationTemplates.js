app.templates.application = '<div class="application-inner"> \
                              <a href="#"> <img class = "delete" src="img/ui_icons/delete.png" /> </a>\
                              <a class="url" href="http://<%= application.url %>"> <%= application.url %> </a> \
                              <img class="grid-img" src="img/app_icons/<%= img %>-square.png"/>\
                            </div>';

app.templates.grid = '<!-- <div id="grid"> -->\
                          <!-- <tr> --> \
                          <!-- </tr> --> \
                          <!-- </div> -->'

app.templates.grid_row = '<div class="row"><div class="cf row-wrapper"></div></div>';
