<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Map Marker Cluster</title>
        <script src="https://maps.googleapis.com/maps/api/js?key=API_KEY" type="text/javascript"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js" integrity="sha512-K1qjQ+NcF2TYO/eI3M6v8EiNYZfA95pQumfvcVrTHtwQVDG+aHRqLi/ETn2uB+1JqwYqVG3LIvdm9lj6imS/pQ==" crossorigin="anonymous"></script>
        <script type="text/javascript" src="js/map_marker_cluster_base.js"></script>
        <script type="text/javascript" src="js/map_imp.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" integrity="sha512-dTfge/zgoMYpP7QbHy4gWMEGsbsdZeCXz7irItjcC3sPUFtf0kuFbDz/ixG7ArTxmDjLXDmezHubeNikyKGVyQ==" crossorigin="anonymous">
        <link href="css/maps.css" rel="stylesheet" type="text/css" /> 
    </head>
    <body>
        <div style="font-size: 28px; ">
            Map Mark Cluster - Example
        </div>
        <div style="height: 568px;width: 100%">
            <div id="map-container" style="width: 100%; height: 100%; position: relative; overflow: hidden; transform: translateZ(0px); background-color: rgb(229, 227, 223);">
            </div>
        </div>    
        <div class="usermappoint" id="userthumbtemplate" style="display:none">
            <div class="usermapthumb">
                <div class="clustercount"></div>
                <img src="img/marco.png" alt="" class="userthumbbg">
                <div class="picture_wrapper">
                    <img src="" alt="thumb image" class="usermapthumbimage">
                </div>
            </div>
        </div>
        <div class="modal fade" id="usersmaPpopup" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="z-index: 999999;">
            <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header" style=" ">
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="color:#fff;"><span aria-hidden="true">&times;</span></button>
                  <h4 class="modal-title" id="myModalLabel">Resultados</h4>
                </div>
                <div class="modal-body">
                  ...
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal" style="">Cerrar</button>
                    <div style="clear: both"></div>
                </div>
              </div>
            </div>
          </div>
        <script>
            function initialize() {
                init_map();
            }
            google.maps.event.addDomListener(window, 'load', initialize);
        </script>
    </body>
</html>
