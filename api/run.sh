    #! /bin/sh
    
    ## set defult paths
    MAINPATH=D:\Apps\zappfm
    APPPATH=D:\Apps\apps\status handlerss  ### set the default ZAU app path. this should mount with docker HOST
    LOGPATH=D:\Apps\apps\status handlerss\logs ### set the defautl log path. this should mount with docker HOST
    
    cd D:\Apps\zappfm
    
    ### run the ZAF with params
    ./app --mainpath $MAINPATH --apppath $APPPATH --logpath $LOGPATH --restport 9090 --wsport 12365 --profport 8892
        