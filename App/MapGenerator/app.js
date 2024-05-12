jQuery(document).ready(function($){
    var selected = "empty";
    var fieldOpen = "<div class='field'>";
    var fieldClose = "</div>";
    CreateMap(5, 8);

    $(".selectable").on("click", function(){
        $(".selectable").removeClass("selectable-selected");
        $(this).addClass("selectable-selected");
        selected = $(this).children(":first").attr("data-type");
    });

    $("#map").on("click", ".field", function(){
        ReplaceField(this)
    });

    $("#map").on("mouseenter", ".field", function(){
        if($("body:active").length > 0){ //mouseDown
            ReplaceField(this)
        }
    });

    $("#map").on("mouseleave", ".field", function(){
        if($("body:active").length > 0){ //mouseDown
            ReplaceField(this)
        }
    });

    $("#export-btn").on("click", function(){
        let fileContent = "";
        let rowCount = 0;
        let fieldCount = 0;
        $(".row").each(function(i, row){
            rowCount += 1;
            $(row).children(".field").each(function(y, field){
                fieldCount += 1;
                let dataFileLetter = $(field).children().attr("data-file-letter");
                if(dataFileLetter === "e"){
                    fileContent += " ";
                }else{
                    fileContent += dataFileLetter;
                }
            });
            fileContent += ";\r\n";
        });
        let colCount = fieldCount / rowCount;
        fileContent = colCount + ";\r\n" + rowCount + ";\r\n" + fileContent;
        let fileName = $("#file-name").val();
        let blob = new Blob([fileContent],
        { type: "text/plain;charset=utf-8" });
        saveAs(blob, fileName + ".txt");
    });

    $("#import-btn").on("click", function(){
        $('#upload-menu-background').removeClass("hide");
    });

    $("#upload-menu-background").mousedown(function(e){
        if(e.target != this) return;
        $("#upload-menu-background").addClass("hide");
    });

    $('#file-input').change(function(){
        var fr = new FileReader(); 
        fr.onload = function(){         
            LoadMapFromString(fr.result);
            let fileName = fr.fileName;
            UpdateFileName(fileName.substr(0, fileName.indexOf('.')));
            $("#upload-menu-background").addClass("hide");
            $('#file-input').val(null);
        }        
        fr.readAsText(this.files[0]); 
        fr.fileName = this.files[0].name; 
    });

    function UpdateFileName(newFileName){
        $('#file-name').val(newFileName);
    }

    function LoadMapFromString(mapAsString){
        let mapAsLines = mapAsString.split("\n");
        let width = mapAsLines[0].substr(0, mapAsLines[0].indexOf(';'));
        let height = mapAsLines[1].substr(0, mapAsLines[1].indexOf(';'));
        let map = [];
        for(let i = 0; i < height; i++){
            let line = mapAsLines[i+2].substr(0, mapAsLines[i+2].indexOf(';')).split('');
            for(let y = 0; y < line.length; y++){
                line[y] = GetDataTypeFromLetter(line[y]);
            }
            map[i] = line;
        }
        CreateMap(width, height, map);
    }

    function GetDataTypeFromLetter(letter){
        if(letter == " "){
            letter = "e";
        }
        return $('div[data-file-letter="' + letter + '"]').first().attr("data-type");
    }

    $("#map").on("click", "#rotate", function(){
        let contentAsArray = GetCurrentContentAsArray();
        let height = contentAsArray.length;
        let width = contentAsArray[0].length;
        let newContentAsArray = [];
        for(let x = width-1; x >= 0; x--){
            let row = [];
            for(let y = 0; y < height; y++){
                row.push(contentAsArray[y][x])
            }
            newContentAsArray.push(row)
        }
        height = newContentAsArray.length;
        width = newContentAsArray[0].length;
        CreateMap(width, height, newContentAsArray);
    });
    $("#map").on("click", ".map-size-editor", function(){
        let direction = $(this).attr("data-direction");
        let type = $(this).attr("data-type");
        let position = $(this).attr("data-position");
        let contentAsArray = GetCurrentContentAsArray();
        let height = contentAsArray.length;
        let width = contentAsArray[0].length;
        switch(direction + ", " + type){
            case "horizontal, +":
                for(let y = 0; y < height; y++){
                    contentAsArray[y].splice(position, 0, "empty")
                }
                break;
            case "horizontal, -":
                for(let y = 0; y < height; y++){
                    contentAsArray[y].splice(position, 1)
                }
                break;
            case "vertical, +":
                newRow = [];
                for(let x = 0; x < width; x++){
                    newRow.push("empty") 
                }
                contentAsArray.splice(position, 0, newRow);
                break;
            case "vertical, -":
                contentAsArray.splice(position, 1)
                break;
        }
        height = contentAsArray.length;
        width = contentAsArray[0].length;
        CreateMap(width, height, contentAsArray)
    });

    function GetCurrentContentAsArray(){
        contentAsArray = [];
        $(".row").each(function(y, rowHtml){
                rowArray = [];
            $(rowHtml).children(".field").each(function(x, field){
                rowArray.push($(field).children().attr("data-type"));
            });
            contentAsArray.push(rowArray);
        });        
        return contentAsArray;
    }

    function ReplaceField(oldField){
        $(oldField).children(":first").replaceWith($("." + selected).first().clone());
    }

    function CreateMap(width, height, contentAsArray){
        if(contentAsArray == null){
            contentAsArray = [];
            let row = [];
            for(let x = 0; x < width; x++){
                row.push("empty");
            }
            for(let y = 0; y < height; y++){
                contentAsArray.push(row);
            }
        }
        let content = "";
        //rotate Button
        content += "<img id='rotate' src='images/rotate.png'>"
        //edit signs top
        content += "<div id='map-edit-top'>";
            for(let i = 0; i < width; i++){
                content += "<div class='map-size-editor' data-type='+' data-direction='horizontal' data-position='" + i + "'>+</div>";
                content += "<div class='map-size-editor' data-type='-' data-direction='horizontal' data-position='" + i + "'>-</div>";
            }
            content += "<div class='map-size-editor' data-type='+' data-direction='horizontal' data-position='" + width + "'>+</div>";
        content += "</div>";
        content += "<div id='map-flexbox'>"
            //edit signs left
            content += "<div id='map-edit-left'>";
                for(let i = 0; i < height; i++){
                    content += "<div class='map-size-editor' data-type='+' data-direction='vertical' data-position='" + i + "'>+</div>";
                    content += "<div class='map-size-editor' data-type='-' data-direction='vertical' data-position='" + i + "'>-</div>";
                }
                content += "<div class='map-size-editor' data-type='+' data-direction='vertical' data-position='" + height + "'>+</div>";
            content += "</div>";
            //map
            content += "<div>";
                for(let y = 0; y < height; y++){
                    let fields = "";
                    for(let x = 0; x < width; x++){
                        fields += fieldOpen + $("." + contentAsArray[y][x]).first().prop('outerHTML') + fieldClose;
                    }
                    content += "<div class='row'>" + fields + "</div>";
                }
            content += "</div>";
        content += "</div>";
        $("#map").html(content);
    }
});