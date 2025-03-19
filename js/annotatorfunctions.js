visible = true

var osdargs

var TextMapWidget = function(args) {

 var addTag=function(evt) {
	var removeindex=-1
	for(bod in args.annotation.underlying.body){
		if(args.annotation.underlying.body[bod].purpose==evt.target.id){
			removeindex=bod
		}
	}
    if(removeindex==-1){
        args.annotation.underlying.body.push({
            type: 'TextualBody',
            purpose: evt.target.id,
            //dimensions: viewer.world.getItemAt(0).getContentSize(), 
            value: evt.srcElement.value
        });
    }else{
        args.annotation.underlying.body[removeindex].value=evt.srcElement.value
        args.annotation.underlying.body[removeindex].dimensions=viewer.world.getItemAt(0).getContentSize()
    }
  }


// 4. This part renders the UI elements
 var createTextField=function(key,value,div,category,mappings,args) {
    //console.log(key+" - "+value)
	var tr=document.createElement('tr')
  tr.style="color:black;background-color:white"
	var td1=document.createElement('td')
  td1.style="color:black;background-color:white"
  if(!readOnlyVar && "paleocodage" in mappings[key]){
	var td2=document.createElement('td')
    td2.style="color:black;background-color:white"
  }else{
	var td2=document.createElement('td')
    td2.colSpan=2
    td2.style="color:black;background-color:white"
  }
	tr.appendChild(td1)
	tr.appendChild(td2)
  var label = document.createElement('label');
  label.style="color:black;background-color:white"
  if(!readOnlyVar){
	  var input = document.createElement('input');
  }else{
    var input = document.createElement('span');
    input.style="color:black;background-color:white"
  }
  inputdatalist=null
  console.log(mappings[key])
  if(!readOnlyVar && "inputtype" in mappings[key] && mappings[key]["inputtype"]=="select"){
    input = document.createElement('select');
    input.addEventListener('change',addTag);
    input.style="width:90%"
  }else if(!readOnlyVar && "inputtype" in mappings[key] && mappings[key]["inputtype"]=="slider"){
      input.type="range"
      input.style="width:90%"
      input.steps=Object.keys(mappings[key]["data"]).length
      input.setAttribute("list",key+"_values")
      inputdatalist=document.createElement("datalist")
      inputdatalist.id=key+"_values"
  }else if(!readOnlyVar && "inputtype" in mappings[key]){
		input.type=mappings[key]["inputtype"]
        input.style="width:90%"
        if(mappings[key]["inputtype"]=="number"){
		    input.min=1
        }
	}else if(!readOnlyVar){
		input.type="text"	
	}
  if(!readOnlyVar && "data" in mappings[key] && mappings[key]["inputtype"]=="select"){
    var selvalue=null
    for(bod in args.annotation.underlying.body){
		if(args.annotation.underlying.body[bod].purpose==key){
			  selvalue=args.annotation.underlying.body[bod].value
		}
	}
    for(keyy in mappings[key]["data"]){
      //console.log(keyy)
      option=document.createElement("option")
      option.value=keyy
      option.text=mappings[key]["data"][keyy]
      if(selvalue!=null && keyy==selvalue){
        option.selected="selected"
      }
      input.appendChild(option)
    }
  }else if(!readOnlyVar && "data" in mappings[key] && mappings[key]["inputtype"]=="slider"){
    for(bod in args.annotation.underlying.body){
        if(args.annotation.underlying.body[bod].purpose==key){
            input.value=args.annotation.underlying.body[bod].value
        }
    } 
    for(keyy in mappings[key]["data"]){
        //console.log(keyy)
        option=document.createElement("option")
        option.value=keyy
        option.text=mappings[key]["data"][keyy]
        inputdatalist.appendChild(option)
    }
  }else{
    for(bod in args.annotation.underlying.body){
		  if(args.annotation.underlying.body[bod].purpose==key){
        if(!readOnlyVar){
          input.value=args.annotation.underlying.body[bod].value
        }else{
          input.innerHTML=args.annotation.underlying.body[bod].value
        }		  
      }
	  }
    if(!readOnlyVar){
	    input.addEventListener('keyup',addTag)
    }
  }

	input.id=key
	label.innerHTML=key+": "
	td1.appendChild(label)
	td2.appendChild(input)
    if(inputdatalist!=null){
        td2.appendChild(inputdatalist)
    }
  if(!readOnlyVar && "paleocodage" in mappings[key]){
    var td3=document.createElement('td')
    tr.appendChild(td3)
    var canvas=document.createElement('canvas')
    td3.appendChild(canvas)
    canvas.id="myCanvas"
    canvas.width=150
    canvas.height=75
    canvas.style="border:1px solid #d3d3d3;"
    input.addEventListener('keyup',function(event){
        paintCharacter(event.target.id)        
        //selectionStart=$('#PaleoCode').prop('selectionStart')
        //selectionEnd=$('#PaleoCode').prop('selectionEnd')
        //strokeParser(document.getElementById('PaleoCode').value)
    });
    input.addEventListener('blur',function(event){
        paintCharacter(event.target.id)        
        //selectionStart=$('#PaleoCode').prop('selectionStart')
        //selectionEnd=$('#PaleoCode').prop('selectionEnd')
        //strokeParser(document.getElementById('PaleoCode').value)
    });
    input.addEventListener("click",function(){
        paintCharacter(event.target.id)
    });
    input.addEventListener("select",function(){
        paintCharacter(event.target.id)
    });
    input.addEventListener("load",function(){
        paintCharacter(event.target.id)
    });
  }
    return tr;
  }

  var recreateAnnoTable=function(args,table,category,mappings){
    for(map in mappings){
        console.log(mappings[map])
        console.log(category)
        if("category" in mappings[map] && mappings[map]["category"].includes(category)){
            var curval="";
            for(body of args.annotation.bodies){
                if(body.purpose==map){
                    curval=body.value
                    break;
                }
            }
            var button1 = createTextField(map,curval,table,category,mappings,args);	
            table.appendChild(button1);
        }
    }
}



  osdargs=args
  var container = document.createElement('div');
  container.id="osdannocontainer"
  container.className = 'colorselector-widget';
  idspan=document.createElement('span')
  idlink=document.createElement('a')
  idlink.setAttribute('href',location.protocol + '//' + location.host + location.pathname+"?tabletid="+$('#images option:selected').val()+"&side="+$('#imageside option:selected').text()+"&annotations="+args.annotation.id)
  idspan.appendChild(idlink)
  idlink.innerHTML=args.annotation.id
  container.appendChild(idspan)
  annotypespan=document.createElement('span')
  fieldset=document.createElement("fieldset")
  fieldset.id="annotypeselectosd"
  fieldset.innerHTML="Annotation type: <input type=\"radio\" id=\"signanno\" checked=\"checked\" name=\"group-annotype\" value=\"sign\"></input>Sign <input type=\"radio\" id=\"wedgeanno\" name=\"group-annotype\" value=\"wedge\">Wedge"
  fieldset.addEventListener('change',function(event){
      console.log("Fieldsetchanged")
      document.getElementById('osdannotable').innerHTML=""
      console.log(osdargs)
      console.log(imagemappings[curimagemapping])
      recreateAnnoTable(osdargs,document.getElementById('osdannotable'),document.querySelector('input[name="group-annotype"]:checked').value,imagemappings[curimagemapping])
  });
  annotypespan.appendChild(fieldset)
  container.appendChild(annotypespan)
    var div=document.createElement('table')
    div.id="osdannotable"
    div.style="color:black;background-color:white;border-bottom:1px solid black;"
    div.width="100%"
    container.appendChild(div)
  console.log("THE MAPPINGS")
  console.log(imagemappings[curimagemapping])
  recreateAnnoTable(args,div,"sign",imagemappings[curimagemapping])
  return container;
}

var TextMapWidget2 = function(args) {

  var addTag = function(evt) {
    console.log("onKeyUp")
	console.log(evt.srcElement.value)
	console.log(args)
	var removeindex=-1
	for(bod in args.annotation.underlying.body){
		if(args.annotation.underlying.body[bod].purpose==evt.target.id){
			removeindex=bod
		}
	}
  if(removeindex==-1){
	  args.annotation.underlying.body.push({
        type: 'TextualBody',
        purpose: evt.target.id,
        //dimensions: viewer.world.getItemAt(0).getContentSize(), 
        value: evt.srcElement.value
    });
  }else{
    args.annotation.underlying.body[removeindex].value=evt.srcElement.value
    args.annotation.underlying.body[removeindex].dimensions=viewer.world.getItemAt(0).getContentSize()
  }
	console.log(args)
	console.log({
        type: 'TextualBody',
        purpose: evt.target.id,
        //dimensions: viewer.world.getItemAt(0).getContentSize(), 
        value: evt.srcElement.value
    })
  }

  // 4. This part renders the UI elements
  var createTextField = function(key,value) {
    console.log(key+" - "+value)
    var div=document.createElement('table')
    div.style="color:black;background-color:white;border-bottom:1px solid black;"
	div.width="100%"
	var tr=document.createElement('tr')
  tr.style="color:black;background-color:white"
	var td1=document.createElement('td')
  td1.style="color:black;background-color:white"
	var td2=document.createElement('td')
  td2.style="color:black;background-color:white"
	div.appendChild(tr)
	tr.appendChild(td1)
	tr.appendChild(td2)
  var label = document.createElement('label');
  label.style="color:black;background-color:white"
  if(!readOnlyVar){
	  var input = document.createElement('input');
  }else{
    var input = document.createElement('span');
    input.style="color:black;background-color:white"
  }

	console.log(textmappings[curtextmapping][key])
  if(!readOnlyVar && "inputtype" in textmappings[curtextmapping][key] && textmappings[curtextmapping][key]["inputtype"]=="select"){
    input = document.createElement('select');
    input.addEventListener('change',addTag)
    if(!readOnlyVar && "data" in textmappings[curtextmapping][key]){
        var selvalue=null
        for(bod in args.annotation.underlying.body){
            if(args.annotation.underlying.body[bod].purpose==key){
                selvalue=args.annotation.underlying.body[bod].value
            }
        }
        for(keyy in textmappings[curtextmapping][key]["data"]){
        //console.log(keyy)
        option=document.createElement("option")
        option.value=keyy
        option.text=textmappings[curtextmapping][key]["data"][keyy]
        if(selvalue!=null && keyy==selvalue){
            option.selected="selected"
        }
        input.appendChild(option)
        }
    }
  }else if(!readOnlyVar && "inputtype" in textmappings[curtextmapping][key]){
		input.type=textmappings[curtextmapping][key]["inputtype"]
		input.min=1
	}else if(!readOnlyVar){
		input.type="text"	
	}
  if(!readOnlyVar && "data" in textmappings[curtextmapping][key] && textmappings[curtextmapping][key]["inputtype"]=="select"){
        var selvalue=null
        for(bod in args.annotation.underlying.body){
            if(args.annotation.underlying.body[bod].purpose==key){
                selvalue=args.annotation.underlying.body[bod].value
            }
        }
        for(keyy in textmappings[curtextmapping][key]["data"]){
        //console.log(keyy)
        option=document.createElement("option")
        option.value=keyy
        option.text=textmappings[curtextmapping][key]["data"][keyy]
        if(selvalue!=null && keyy==selvalue){
            option.selected="selected"
        }
        input.appendChild(option)
        }
  }else{
    for(bod in args.annotation.underlying.body){
		  if(args.annotation.underlying.body[bod].purpose==key){
        if(!readOnlyVar){
          input.value=args.annotation.underlying.body[bod].value
        }else{
          input.innerHTML=args.annotation.underlying.body[bod].value
        }		  
      }
	  }
    if(!readOnlyVar){
	    input.addEventListener('keyup',addTag)
    }
  }
	input.id=key
	label.innerHTML=key+": "
	td1.appendChild(label)
	td2.appendChild(input)
  if(!readOnlyVar && "paleocodage" in textmappings[curtextmapping][key]){
    var td3=document.createElement('td')
    tr.appendChild(td3)
    var canvas=document.createElement('canvas')
    td3.appendChild(canvas)
    canvas.id="myCanvas"
    canvas.width=150
    canvas.height=75
    canvas.style="border:1px solid #d3d3d3;"
    input.addEventListener('keyup',function(event){
        paintCharacter(event.target.id)        
        //selectionStart=$('#PaleoCode').prop('selectionStart')
        //selectionEnd=$('#PaleoCode').prop('selectionEnd')
        //strokeParser(document.getElementById('PaleoCode').value)
    });
    input.addEventListener('blur',function(event){
        paintCharacter(event.target.id)        
        //selectionStart=$('#PaleoCode').prop('selectionStart')
        //selectionEnd=$('#PaleoCode').prop('selectionEnd')
        //strokeParser(document.getElementById('PaleoCode').value)
    });
    input.addEventListener("click",function(){
        paintCharacter(event.target.id)
    });
    input.addEventListener("select",function(){
        paintCharacter(event.target.id)
    });
  }
    return div;
  }

  var container = document.createElement('div');
  container.className = 'colorselector-widget2';
  idspan=document.createElement('span')
  idlink=document.createElement('a')
  idlink.setAttribute('href',location.protocol + '//' + location.host + location.pathname+"?tabletid="+$('#images option:selected').val()+"&side="+$('#imageside option:selected').text()+"&annotations="+args.annotation.id)
  idspan.appendChild(idlink)
  idlink.innerHTML=args.annotation.id
  container.appendChild(idspan)
  for(map in textmappings[curtextmapping]){
    var curval="";
    for(body of args.annotation.bodies){
		if(body.purpose==map){
			curval=body.value
			break;
		}
	}
	var button1 = createTextField(map,curval);	
	container.appendChild(button1);
  }

  return container;
}

var lastItemBeforeFatCross=null
function arrangeFatCross(){
        try{
        viewer.destroy()
        anno.destroy()
    }catch(e){
        console.log(e)
    }
    $('#my-toolbar-container').html('<span style="text-align:right;position:absolute;right:0px"><button id="leftimage2" style="border-radius: 0 3px 3px 0;" onclick="loadLeftRendering()">&lt;&lt;</button><button id="rightimage2" onclick="loadRightRendering()" style="border-radius:3px 0 0 3px;">&gt;&gt;</button>Line:<input type="number" id="highlightline" value="-1" onChange="highlightIndexedChars(true)"/><button id="showIndexedChars" onClick="highlightIndexedChars(false)">Indexview</button><button id="fatcrossview" onclick="arrangeFatCross()">FC View</button><button onclick="showHideAnno()">Toggle</button><button id="saveInGit" onclick="commitData()">Save</button></span><span id="saveannotationsmessage" style="position:absolute;text-align:center;margin-top:40px;margin-right:80px;right:0px;"></span><br/>')
    modtsources=[{"type":"image","url":"mocktransparent.png"},{"type":"image","url":tsources[1]["url"]},{"type":"image","url":"mocktransparent.png"},{"type":"image","url":"mocktransparent.png"},{"type":"image","url":tsources[0]["url"]},{"type":"image","url":tsources[2]["url"]},{"type":"image","url":tsources[4]["url"]},{"type":"image","url":tsources[5]["url"]},{"type":"image","url":"mocktransparent.png"},{"type":"image","url":tsources[3]["url"]},{"type":"image","url":"mocktransparent.png"},{"type":"image","url":"mocktransparent.png"}]
    viewer = OpenSeadragon({
      id: "openseadragon",
      prefixUrl: "openseadragon/images/",
      degrees: 0,
      autoHideControls: true,
      showRotationControl: true,
      showFlipControl: true,
      //sequenceMode: true,
      showReferenceStrip:true,
      toolbar: "my-toolbar-container",
      gestureSettingsTouch: {
        pinchRotate: true
      },
    collectionMode:       true,
    collectionRows:       3, 
    collectionTileSize:   1024,
    collectionTileMargin: 1,
    collectionLayout:     'vertical',
      tileSources: modtsources
    });
    console.log("Arrange FatCross")
    console.log(viewer.tileSources)
    document.getElementById('fatcrossview').onclick=function(){dearrangeFatCross()}
}

function dearrangeFatCross(){
    reinitOSD()
    viewer.goToPage(document.getElementById('imageside').selectedIndex)
    document.getElementById('fatcrossview').onclick=function(){arrangeFatCross()}
}

function showHideAnno() {
    visible = !visible
    anno.setVisible(visible)
}

approvaltags = []

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function addTag(){
  mytag=$('#comment').val()
  approvaltags.push(mytag)
  if(mytag=="")
    return
  $('#mytags').append("<span style=\"background-color:yellow;color:black;border-radius: 25px;border:1px solid black \">"+mytag+"</span>")
  $('#comment').val("")
}

function sync2D3D() {
    console.log($('#images option:selected').val() + " " + $('#3dimages option:selected').text())
    if ($('#images option:selected').val() in threedimageToIndex) {
        console.log($('#images option:selected').val() + " - " + threedimageToIndex[$('#images option:selected').val()])
        document.getElementById('3dimages').selectedIndex = threedimageToIndex[$('#images option:selected').val()]
    }
}

function rescale(X, A, B, C, D) {
    //console.log("Input: " + X)
    retval = (((X - A).toFixed(2) / (B - A)) * (D - C)) + C
    //console.log("Scale factor: " + ((B - A) * (D - C)))
    //console.log("Rescaled: " + retval)
    return retval
}

function format3DHopPopup(result,ann){
    purposemap={}
    for(bod in result[ann]["body"]){
      purposemap[result[ann]["body"][bod]["purpose"]]=result[ann]["body"][bod]["value"]
    } 
    var cindex=""
    var lindex=""
    transliteration="Unknown"
    if("Charindex" in purposemap){
        cindex="Charindex "+purposemap["Charindex"]
    }
    if("Line" in purposemap){
        lindex="Line "+purposemap["Line"]
    }
    if("Transliteration" in purposemap){
        transliteration=purposemap["Transliteration"]
    }
    title=transliteration+" ["+lindex+" "+cindex+"]&nbsp;&nbsp;&nbsp;&nbsp;<br>"
    res=""
    usedpurp=["Transliteration","Line","Charindex"]
    for(purp in purposemap){
        if(!(purp in usedpurp)){
            res+=purp+": "+purposemap[purp]+"<br>"
        }
    }
    return [title,res]
}

function convert2DAnnoTo3D(res,spots,zvalue,yshift){
  result=res
  console.log(result)
  annos3d=result
  console.log(annos3d)
  annotations=[]
  spotcounter=1
  for(ann in result){
    if(!("target" in result[ann])){
      continue;
    }
    spots[""+ann+""]={}
    curspot=spots[""+ann+""]
    curspot["color"]=[0.0, 0.25, 1.0]
    curspot["mesh"]="Cube"
    curspot["transform"]={}
    curspot["transform"]["matrix"]=[]
    spotcounter+=1
    ptext=format3DHopPopup(result,ann)
    curspot["title"]=ptext[0]
    curspot["info"]=ptext[1]
    coords=result[ann]["target"]["selector"]["value"].replace('<svg><polygon','').replace('points=\"','').replace("\"></polygon></svg>","").replaceAll(","," ").trim()
    coordarray=coords.split(" ")
    res=[]
    for(i=0;i<coordarray.length-1;i+=2){
      res.push([parseFloat(coordarray[i]),parseFloat(coordarray[i+1])])
    }
    bbox=turf.bbox(turf.lineToPolygon(turf.lineString(res)))
    dims=[]
    if("dimensions" in result[ann]["body"][0]){
      dims=result[ann]["body"][0]["dimensions"]
    }else if("dimensions" in result[ann]["target"]){
      dims=result[ann]["target"]["dimensions"]
    }
    if(spotcounter==0){
      curspot["transform"]["matrix"]=SglMat4.mul(SglMat4.translation([-9.087315,24.171282,zvalue]), SglMat4.scaling([0.1, 0.1, 0.07]))
    }else if(dims!=[]){
      console.log("DIMS: "+dims)
      xcoordre=rescale(bbox[0],0,dims["x"],models3D[$("#3dimages").text()]["bbox"]["min"][0],models3D[$("#3dimages").text()]["bbox"]["max"][0])
      ycoordre=rescale(bbox[1],0,dims["y"],models3D[$("#3dimages").text()]["bbox"]["min"][1],models3D[$("#3dimages").text()]["bbox"]["max"][1])
      xcoordex=rescale(bbox[2],0,dims["x"],models3D[$("#3dimages").text()]["bbox"]["min"][0],models3D[$("#3dimages").text()]["bbox"]["max"][0])
      ycoordex=rescale(bbox[3],0,dims["y"],models3D[$("#3dimages").text()]["bbox"]["min"][1],models3D[$("#3dimages").text()]["bbox"]["max"][1])
      xlength=models3D[$("#3dimages").text()]["bbox"]["max"][0]-models3D[$("#3dimages").text()]["bbox"]["min"][0]
      ylength=models3D[$("#3dimages").text()]["bbox"]["max"][1]-models3D[$("#3dimages").text()]["bbox"]["min"][1]
      zlength=models3D[$("#3dimages").text()]["bbox"]["max"][2]-models3D[$("#3dimages").text()]["bbox"]["min"][2]
      if(zvalue>0){
        zvalue=models3D[$("#3dimages").text()]["bbox"]["max"][2]-2
      }else if(zvalue<0){
        zvalue=models3D[$("#3dimages").text()]["bbox"]["min"][2]+2
      }
      annos3d[ann]["target"]["source"]=$("#3dimages").val()
      annos3d[ann]["target"]["selector"]["type"]="WKTSelector"
      annos3d[ann]["target"]["selector"]["value"]="POLYGON Z(("+xcoordre+" "+ycoordre+" 0.0,"+xcoordex+" "+ycoordex+" 0.0,"+xcoordre+" "+ycoordex+" 0.0,"+xcoordre+" "+ycoordre+" "+zvalue+","+xcoordex+" "+ycoordre+" "+zvalue+","+xcoordex+" "+ycoordex+" "+zvalue+","+xcoordre+" "+ycoordex+" "+zvalue+"))"
      xlengthanno=xcoordex-xcoordre
      ylengthanno=ycoordex-ycoordre
      console.log("XLengthanno: "+xlengthanno)
      console.log("YLengthanno: "+ylengthanno)
      xlengthscale=xlengthanno/50
      ylengthscale=ylengthanno/50
      if(isNaN(xlengthscale) || xlengthscale<=0){
        xlengthscale=0.1
      }
      if(isNaN(ylengthscale) || ylengthscale<=0){
        ylengthscale=0.1
      }
      if(yshift){
        ydiff=ylength-ycoordre
        console.log(ydiff)
        ycoordre=ydiff-6
      }
      console.log("Coordinates: "+[(xcoordre+xlengthanno/2),(ycoordre+ylengthanno/2),zvalue])
      console.log("Scale: "+[xlengthscale, ylengthscale, 0.07])
      console.log("Scale: "+[(xcoordre+xlengthanno/2)*xlengthscale, (ycoordre+ylengthanno/2)*ylengthscale, 0.07])
      if(xlengthscale!=0.1)
        curspot["transform"]["matrix"]=SglMat4.mul(SglMat4.translation([(xcoordre+xlengthanno/2),(ycoordre+ylengthanno/2),zvalue]),SglMat4.scaling([xlengthscale, ylengthscale, 0.07])) 
      else
        curspot["transform"]["matrix"]=SglMat4.mul(SglMat4.translation([(xcoordre+xlengthanno/2),(ycoordre+ylengthanno/2),zvalue]),SglMat4.scaling([xlengthscale, ylengthscale, 0.07]))
      console.log("Curspot: "+JSON.stringify(curspot))
    }else if("bbox" in models3D[$("#3dimages").text()]){
      xcoord=bbox[0]/25
      ycoord=bbox[1]/25
      zcoord=bbox[2]/25       
      xlength=models3D[$("#3dimages").text()]["bbox"]["max"][0]-models3D[$("#3dimages").text()]["bbox"]["min"][0]
      ylength=models3D[$("#3dimages").text()]["bbox"]["max"][1]-models3D[$("#3dimages").text()]["bbox"]["min"][1]
      zlength=models3D[$("#3dimages").text()]["bbox"]["max"][2]-models3D[$("#3dimages").text()]["bbox"]["min"][2]
      if(xcoord>=(xlength/2)){
        xcoord-=(xlength/2)
        xcoord+=4
      }else{
        xcoord=models3D[$("#3dimages").text()]["bbox"]["min"][0]+xcoord
        xcoord+=4
      }
      ydiff=ylength-ycoord
      ycoord=ydiff-2
      curspot["transform"]["matrix"]=SglMat4.mul(SglMat4.translation([xcoord,ycoord,4.9]),SglMat4.scaling([0.1, 0.1, 0.07]))
    }else{
      curspot["transform"]["matrix"]=SglMat4.mul(SglMat4.translation([(bbox[0]/25)-10,(bbox[1]/25),4.9]),SglMat4.scaling([0.1, 0.1, 0.07]))
    }
  }
  return spots
}

function getEXIFData(imageid, targetid) {
    var img2 = document.getElementById(imageid);
    //console.log("EXIF click")
    EXIF.getData(img2, function() {
        var allMetaData = EXIF.getAllTags(this);
        console.log(allMetaData)
        var allMetaDataSpan = document.getElementById(targetid);
        allMetaDataSpan.innerHTML = JSON.stringify(allMetaData, null, "\t");
        var htmltip = "<ul>"
        for (tag in allMetaData) {
            htmltip += "<li>" + tag + " - " + allMetaData[tag] + "</li>"
        }
        htmltip += "</ul>"
        $("#metadata").tooltip({
            content: htmltip
        });
    });
}

var inconsistencyhighlight=false

function highlightAnnotationsByTransliterationInconsistency(){
    side=-1
    //console.log(curanno)
    if(!inconsistencyhighlight){
        for(annoo in curanno){
            //console.log(anno)
            annno=curanno[annoo]
            curline=-1
            curcolumn=-1
            curchar=-1
            transliteration=""
            for(content of annno.body){
                if(content.purpose=="Line"){
                    curline=content.value
                }
                if(content.purpose=="Charindex"){
                    curchar=content.value
                }
                if(content.purpose=="Column"){
                    curcolumn=content.value
                }
                if(content.purpose=="TabletSide"){
                    side=content.value
                }
                if(content.purpose=="Transliteration"){
                    transliteration=content.value
                }
            }
            if(side==-1 || side=="selected"){
            pagename=$('#imageside option:selected').text()
            if(pagename.includes("front")){
                side="front"
            }else if(pagename.includes("back")){
                side="back"
            }else if(pagename.includes("right")){
                side="right"
            }else if(pagename.includes("left")){
                side="left"
            }else if(pagename.includes("bottom")){
                side="bottom"
            }else{
                side="top"
            }
            }
            if(curcolumn!=-1 && curcolumn!=""){
                indextranslit=$('#'+side+"_"+curcolumn+"_"+curline+"_"+curchar).text().trim().replace("{","").replace("}","").replace("#","")
            }else{
                indextranslit=$('#'+side+"_"+curline+"_"+curchar).text().trim().replace("{","").replace("}","").replace("#","")
            }
            //console.log(indextranslit+" - "+transliteration)
            if(transliteration!=indextranslit && side+"_"+curline+"_"+curchar in curcharindex){
                //console.log(curcharindex)
                var element = document.querySelector('.a9s-annotation[data-id="' + curcharindex[side+"_"+curline+"_"+curchar]["id"] + '"]').children
                //console.log(element)
                element[1].classList.add("indexhighlight");            
            }

        }
        inconsistencyhighlight=true
    }else{
        removeHighlights()
        inconsistencyhighlight=false
    }
    
}

function highlightAnnotationsByIndex(columnindex,lineindex,charindex,annotations) {
    for(anno of annotations){
        console.log(anno)
        curanno=anno
        curline=-1
        curcolumn=-1
        curchar=-1
        for(content of anno.body){
            if(content.purpose=="Line"){
                curline=content.value
            }
            if(content.purpose=="Charindex"){
                curchar=content.value
            }
            if(content.purpose=="Column"){
                curcolumn=content.value
            }
        }
        if((columnindex==null || typeof(columnindex)=='undefined') && lineindex==curline && (charindex==null || typeof(charindex)=='undefined')){
            highlightAnnotationById(anno.id)
        }else if((columnindex==null || typeof(columnindex)=='undefined') && lineindex==curline && charindex==curchar){
            highlightAnnotationById(anno.id)
        }else if(columnindex==curcolumn && lineindex==curline && charindex==curchar){
            highlightAnnotationById(anno.id)
        }
    }
}


function highlightAnnotationById(indchar){
    var element = document.querySelector('.a9s-annotation[data-id="' + indchar + '"]').children
    console.log(element)
    if (!indexedhiglighted) {
        element[1].classList.add("indexhighlight");
    } else {
        element[1].classList.remove("indexhighlight");
    }
}

function removeHighlights(){
    for (indchar of indexedcharids) {
        var element = document.querySelector('.a9s-annotation[data-id="' + indchar + '"]').children
        element[1].classList.remove("indexhighlight");
    }
    if(indexedhiglighted)
        indexedhiglighted = !indexedhiglighted
}

function highlightIndexedChars(line) {
    console.log(indexedcharids)
    console.log(indexedhiglighted)
    idtohighlight=-1
    if(line){
        idtohighlight=$('#highlightline').val()
        removeHighlights()
    }
    console.log(indexedcharids)
    for (indchar of indexedcharids) {
        line=-1
        var element = document.querySelector('.a9s-annotation[data-id="' + indchar + '"]').children
        console.log(element)
        console.log(indchar)
        console.log(curanno)
        for(ann in curanno){
            if(indchar==curanno[""+ann]["id"] && idtohighlight!=-1){
                console.log(ann)
                console.log("IdToHiglight: "+idtohighlight)
                if("body" in curanno[""+ann]){
                    for (bod of curanno[""+ann]["body"]) {
                        if ("purpose" in bod && bod["purpose"] == "Line") {
                            line = bod["value"]
                        }
                    }
                }
                console.log("Found Line: "+line)
            }
        }
        try{
            line=parseInt(""+line)
        }catch(e){
            line=-1
        }
        if(idtohighlight==-1 || idtohighlight==line){
            console.log(element)
            if (!indexedhiglighted) {
                element[1].classList.add("indexhighlight");
            } else {
                element[1].classList.remove("indexhighlight");
            }
        }
    }
    indexedhiglighted = !indexedhiglighted
}


var semantictagsconfig={
    dataSources: [  
		{ source: 'WikidataLexeme', name: 'Wikidata Lexeme', wordformmode:false, normpattern:/[\[\],\.#!\?\}\{]/g, targetpattern:""},
        { source: 'WikidataLexeme', name: 'WD Lexeme Wordform', wordformmode:true, normpattern:/[\[\],\.#!\?\}\{]/g, targetpattern:""},
        'Wikidata'
    ],
    language: 'sux',
    availableLanguages: [
         'sux', 'akk','hit','en', 'de', 'fa'
    ],
    limit: 10
    }


function loadRecogito(htmlid,newtrans,annos){
    console.log("Init Recogito: "+htmlid)
    try{
        r.destroy()
    }catch(error){
        console.log(error)
    }
    document.getElementById(htmlid).innerHTML=newtrans.replaceAll("<span>&nbsp;</span>","<span>$</span>")
    console.log(document.getElementById(htmlid).innerHTML)
    r = Recogito.init({
        content: document.getElementById(htmlid), // ID or DOM element
        locale: 'auto',
      	widgets: [
            TextMapWidget2,
            { widget: 'TAG', vocabulary:combined},
            recogito.SemanticTags(semantictagsconfig),
            { widget: 'COMMENT' }
        ]
    });
    curtextanno=annos
    console.log(curtextanno)
    if(annos!=null){
        r.setAnnotations(annos)
    }
    else{
        curtextanno={}
    }
    document.getElementById(htmlid).innerHTML=document.getElementById(htmlid).innerHTML.replaceAll("<span>$</span>","<span>&nbsp;</span>")
    console.log(document.getElementById(htmlid).innerHTML)
    $('span.imagelink').mouseover(function() {
        console.log("Selecting annotation")
        myid = $(this).attr("id")
        console.log(myid)
        if (myid in curcharindex) {
            console.log(curcharindex[myid])
            anno.disableEditor = true
            anno.selectAnnotation(curcharindex[myid])
        }
    });
    $('span.imagelink').mouseout(function() {
        if (translitwasclicked) {
            translitwasclicked = false
        } else {
            anno.cancelSelected();
            anno.disableEditor = false
        }
    });
    $('span.imagelink').contextmenu(function() {
        if (anno.disableEditor) {
            anno.disableEditor = false
        } else {
            anno.disableEditor = true
        }
    });
}

function annotationFileFromImageName(curname){
    curnameparts=curname.split("_")
    tabletname=curnameparts[0]+"_"+curnameparts[1]
    tabletside=curnameparts[curnameparts.length-1]
    return tabletname+"_"+tabletside
}

function reinitOSD(){
    try{
        viewer.destroy()
        anno.destroy()
    }catch(e){
        console.log(e)
    }
        $('#my-toolbar-container').html('<span style="text-align:right;position:absolute;right:0px"><button id="leftimage2" style="border-radius: 0 3px 3px 0;" onclick="loadLeftRendering()">&lt;&lt;</button><button id="rightimage2" onclick="loadRightRendering()" style="border-radius:3px 0 0 3px;">&gt;&gt;</button>Line:<input type="number" id="highlightline" value="-1" onChange="highlightIndexedChars(true)"/><button id="showIndexedChars" onClick="highlightIndexedChars(false)">Indexview</button><button id="fatcrossview" onclick="arrangeFatCross()">FC View</button><button onclick="showHideAnno()">Toggle</button><button id="saveInGit" onclick="commitData()">Save</button></span><span id="saveannotationsmessage" style="position:absolute;text-align:center;margin-top:40px;margin-right:80px;right:0px;"></span><br/>')
    viewer = OpenSeadragon({
      id: "openseadragon",
      prefixUrl: "openseadragon/images/",
      degrees: 0,
      autoHideControls: true,
      showRotationControl: true,
      showFlipControl: true,
      sequenceMode: true,
      showReferenceStrip:true,
      toolbar: "my-toolbar-container",
      gestureSettingsTouch: {
        pinchRotate: true
      },
      tileSources: tsources
    });
    addTransliterationOverlay(viewer.isFullPage())
    var annoconfig={
        widgets:[  
        TextMapWidget,'COMMENT',{ widget: 'TAG', 
        vocabulary: mlVocabulary
        }/*,recogito.SemanticTags({
            dataSources: [  
                'Wikidata', 
                'VIAF'
            ],
            availableLanguages: [
                'en', 'de', 'fa'
            ],
            limit: 10
        })*/
    ]}
    anno = OpenSeadragon.Annotorious(viewer,annoconfig);
    getCurrentUser().then(function(user){
        anno.setAuthInfo({
        id: user["id"],
        displayName: user["username"]
        });
    });
    //annotations = OpenSeadragon.Annotations({ viewer });
    Annotorious.BetterPolygon(anno);
    Annotorious.SelectorPack(anno);
    Annotorious.Toolbar(anno, document.getElementById('my-toolbar-container'));
    //Annotorious.SequenceMode(anno, viewer, {annolist});
    viewer.addHandler('page', (page,userdata) => {
        initAnnotationsForPage(page)
    });
}

var param2=""
function reinit(param) {
    param = $('#imageside option:selected').val()
    param2 = $('#imageside option:selected').text()
    $('#highlightline').val("-1")
    $('#referencelink').html("Reference")
    $('#referencelink').attr("href", location.protocol + '//' + location.host + location.pathname+"?tabletid="+$('#images option:selected').val()+"&side="+$('#imageside option:selected').text())
    $('#saveannotationsmessage').html("Loaded annotations for "+$('#imageside option:selected').text())
     $('#transliterationdialogmessage').html("Loaded transliteration for "+$('#imageside option:selected').text())
    atftext=transliterations[$('#images option:selected').val()]
    myatftext="&P134316 = TMH NF 1-2, 004 \n#atf: lang sux \n"+atftext
    try{
        valresult=validateATF(myatftext)
    }catch(e){
        
    }
    $('#transliterationdialogmessage').html("ATF Validation Status: "+valresult)
    console.log("SET TRANSLITERATION.....")
    newtrans=""
    if($('#images option:selected').val() in transliterations){
        console.log(transliterations[$('#images option:selected').val()])
        newtrans=formatTransliteration(transliterations[$('#images option:selected').val()].replaceAll("\n", "<br>")).replaceAll("<span>&nbsp;</span><span>&nbsp;</span>","<span>&nbsp;</span>")
        console.log(newtrans)
        document.getElementById('transliterationtextarea').innerHTML=newtrans
    }
    if (!($("#images option:selected").val() in transliterations)) {
        newtrans="No translation available for text " + $('#images option:selected').val()
        document.getElementById('transliterationtextarea').innerHTML=newtrans
    }
    $.getJSON(gitlabhost + "/api/v4/projects/" + repositoryid + "/repository/files/resulttextanno%2F" + encodeURIComponent($('#images option:selected').val() + ".json") + "/raw?ref=" + branch + "&access_token=" + gitlabtoken, function(result) {
        curtextanno=result
        annotations = []
        for (ann in result) {
            annotations.push(result[ann])
        }
        loadRecogito("transliterationtextarea",newtrans,annotations)
    }).fail(function(jqXHR, textStatus, errorThrown) {
        loadRecogito("transliterationtextarea",newtrans,null)
    })
    //$('#translationtextarea').html(formatTranslation(transliterations[$('#images option:selected').val()].replaceAll("\n", "<br>")))
    /*$(function() {
        $(document).tooltip({
            track: true
        });
    });*/
    $('.imagelink').css({
        "backgroundColor": "#f7f7f9",
        "color": "#bd4147",
        "border": "0px"
    })
    reinitOSD()
    manageApprovals()
    curanno = {}
    curcharindex = {}
    $('#annocomplete').html("Unknown")
    $('#indexingcomplete').html("Unknown")
    viewer.goToPage(document.getElementById('imageside').selectedIndex)
}

function reIndexImageAnnotation(ann,page){
  line = -1
  charindex = -1
  colindex = -1
  side=-1
  console.log(ann)
  for (bod of ann["body"]) {
      if ("purpose" in bod && bod["purpose"] == "Line") {
          line = bod["value"]
      } else if ("purpose" in bod && bod["purpose"] == "Charindex") {
          charindex = bod["value"]
      } else if ("purpose" in bod && bod["purpose"] == "Column") {
          colindex = bod["value"]
      } else if ("purpose" in bod && bod["purpose"] == "TabletSide") {
          side = bod["value"]
      }
  }
  annindex=ann["id"]
  if (charindex != -1 && charindex != "" && line != -1 && line != "") {
      indexedcharids.push(annindex)
      indexedchars += 1
      if(side==-1 || side=="selected"){
          console.log(page)
          console.log(annolist)
          console.log(Object.keys(annolist))
          pagename=Object.keys(annolist)[page]
          if(pagename.includes("front")){
            side="front"
          }else if(pagename.includes("back")){
            side="back"
          }else if(pagename.includes("right")){
            side="right"
          }else if(pagename.includes("left")){
            side="left"
          }else if(pagename.includes("bottom")){
            side="bottom"
          }else{
            side="top"
          }
      }
      //console.log("COLINDEX!!! " + colindex)
      if (colindex != -1 && colindex!="") {
          curimgindex[annindex] = side.substring(side.lastIndexOf('_') + 1) + "_column_" + colindex + "_" + line + "_" + charindex
          curcharindex[side.substring(side.lastIndexOf('_') + 1) + "_column_" + colindex + "_" + line + "_" + charindex] = ann
      } else {
          curimgindex[annindex] = side.substring(side.lastIndexOf('_') + 1) + "_" + line + "_" + charindex
          curcharindex[side.substring(side.lastIndexOf('_') + 1) + "_" + line + "_" + charindex] = ann
      }
  }
}


function loadVariants(givensources=null) {
    console.log($('#images option:selected').val())
    //console.log(transliterations)
    toappend = ""
    if ($('#images option:selected').val() in periods) {
        toappend += periods[$('#images option:selected').val()] + " " //$('#period').html(periods[$('#images option:selected').val()])
    }
    if ($('#images option:selected').val() in languages) {
        toappend += languages[$('#images option:selected').val()]["language"] + " " + languages[$('#images option:selected').val()]["genre"]
        if (languages[$('#images option:selected').val()]["subgenre"] != "") {
            toappend += "<br/>" + languages[$('#images option:selected').val()]["subgenre"]
        }
        if (languages[$('#images option:selected').val()]["provenience"] != "") {
            toappend += "<br/>Provenience: " + languages[$('#images option:selected').val()]["provenience"]
        }
    }
    if ($('#images option:selected').val() in transliterations) {
        console.log($('#images option:selected').val())
        console.log(transliterations[$('#images option:selected').val()])
        //$('#transliterationtextarea').html(transliterations[$('#images option:selected').val()])
        if (transliterations[$('#images option:selected').val()] == "" || transliterations[$('#images option:selected').val()] == "@Tablet") {
            //$('#transliterationtextarea').html("No transliteration available for text " + $('#images option:selected').val())
            if ($('#images option:selected').val() in hs2CDLI) {
                $('#textid').html("" + $('#images option:selected').val() + " - <a target=\"_blank\" href=\"https://cdli.ucla.edu/search/search_results.php?SearchMode=Text&ObjectID=" + hs2CDLI[$('#images option:selected').val()] + "\">" + hs2CDLI[$('#images option:selected').val()] + "</a>")
                $('#cdlilink').html("<a target=\"_blank\" href=\"https://cdli.ucla.edu/search/search_results.php?SearchMode=Text&ObjectID=" + hs2CDLI[$('#images option:selected').val()] + "\">" + hs2CDLI[$('#images option:selected').val()] + "</a>")
            } else {
                $('#textid').html("" + $('#images option:selected').val() + "")
            }
        } else {
            if ($('#images option:selected').val() in hs2CDLI) {
                $('#textid').html("" + $('#images option:selected').val() + " - <a target=\"_blank\" href=\"https://cdli.ucla.edu/search/search_results.php?SearchMode=Text&ObjectID=" + hs2CDLI[$('#images option:selected').val()] + "\">" + hs2CDLI[$('#images option:selected').val()] + "</a>")
                $('#cdlilink').html("<a target=\"_blank\" href=\"https://cdli.ucla.edu/search/search_results.php?SearchMode=Text&ObjectID=" + hs2CDLI[$('#images option:selected').val()] + "\">" + hs2CDLI[$('#images option:selected').val()] + "</a>")
            } else {
                $('#textid').html("" + $('#images option:selected').val() + "")
            }
        }
    } else {
        $('#textid').html("" + $('#images option:selected').val() + "")
        $('#transliterationtextarea').html("No transliteration available for text " + $('#images option:selected').val())
    }
    if(givensources!=null){
        sources=[]
        for(sour of givensources){
            sources.push({"url":sour})
        }
        //sources=givensources
    }else if("variants" in renderingurls[$('#images option:selected').val()]){
        sources=renderingurls[$('#images option:selected').val()]["variants"]
    }  
    console.log("GIVEN SOURCES: "+givensources)
    console.log("SOURCES: "+sources)
    tsources=[]
    annolist={}
    jQuery.ajaxSetup({async:false});
    i=0
    for(src of sources){
      tsources.push({"type":"image","url":src["url"]})
      annolist[src["label"]+".json"]=[]
      $.getJSON(gitlabhost+"/api/v4/projects/"+repositoryid+"/repository/files/result%2F"+encodeURIComponent(src["label"]+".json")+"/raw?ref="+branch+"&access_token="+gitlabtoken, function(result){
        console.log(result)
        indexedchars = 0
        indexedhiglighted = false
        indexedcharids = []
        annotations = []
        for (ann in result) {
            line = -1
            charindex = -1
            colindex = -1
            side=-1
            for (bod of result[ann]["body"]) {
                if ("purpose" in bod && bod["purpose"] == "Line") {
                    line = bod["value"]
                } else if ("purpose" in bod && bod["purpose"] == "Charindex") {
                    charindex = bod["value"]
                } else if ("purpose" in bod && bod["purpose"] == "Column") {
                    colindex = bod["value"]
                } else if ("purpose" in bod && bod["purpose"] == "TabletSide") {
                    side = bod["value"]
                }
            }
            if (charindex != -1 && charindex != "" && line != -1 && line != "") {
                indexedcharids.push(ann)
                indexedchars += 1
                if(side==-1 || side=="selected"){
                    side = param2.replace(".png", "")
                    side=side.substring(side.lastIndexOf('_') + 1)
                }
                if (colindex != -1 && colindex!="") {
                    curimgindex[ann] = side + "_column_" + colindex + "_" + line + "_" + charindex
                    curcharindex[side + "_column_" + colindex + "_" + line + "_" + charindex] = ann
                } else {
                    curimgindex[ann] = side + "_" + line + "_" + charindex
                    curcharindex[side + "_" + line + "_" + charindex] = ann
                }
            }
            annotations.push(result[ann])
        }
        console.log(curcharindex)
        curanno = result
        annolist[src["label"]+".json"]=annotations
        anno.setAnnotations(annotations);
        if ($('#imageside option:selected').text() + ".json" in translitcount) {
            if (annotations.length > 0 && translitcount[$('#imageside option:selected').text() + ".json"] > 0) {
                $('#annocomplete').html((annotations.length / translitcount[$('#imageside option:selected').text() + ".json"] * 100).toFixed(2) + "% (" + annotations.length + "/" + translitcount[$('#imageside option:selected').text() + ".json"] + ")")
            } else {
                $('#annocomplete').html("0% (0/" + translitcount[$('#imageside option:selected').text() + ".json"] + ")")
            }
        } else {
            $('#annocomplete').html("Unknown")
        }
        $('#indexingcomplete').html((indexedchars / translitcount[$('#imageside option:selected').text() + ".json"] * 100).toFixed(2) + "% (" + indexedchars + "/" + translitcount[$('#imageside option:selected').text() + ".json"] + ")")
      }).fail(function(jqXHR, textStatus, errorThrown) { console.log("ajax error")})
    }
    jQuery.ajaxSetup({async:true});
    console.log(annolist)
    imgside = ""
    for (obj of renderingurls[$('#images option:selected').val()]["variants"]) {
        /*if (obj["label"].includes("front")) {
            imgside += "<option value=\"" + obj["url"] + "\" selected=\"selected\">" + obj["label"] + "</option>"
        } else {*/
            imgside += "<option value=\"" + obj["url"] + "\">" + obj["label"] + "</option>"
        //}
    }
    $('#imageside').html(imgside)
    $('#period').html(toappend)
    reinit("abc");
}

function formatTranslation(transliteration) {
    result = ""
    termmap = {
        "@obverse": "front",
        "@reverse": "back",
        "@left": "left",
        "@right": "right",
        "@top": "top",
        "@bottom": "bottom"
    }
    linecounter = 0
    charcounter = 0
    currentside = ""
    currentcolumn = ""
    curterm = ""
    for (line of transliteration.split("<br>")) {
        if (line.trim().startsWith("@")) {
            if (line.trim() in termmap) {
                currentside = termmap[line.trim()]
                curterm = line.trim()
            } else {
                currentside = line.trim()
                cuterm = currentside
            }
            linecounter = 0
            charcounter = 0
            result += line.trim() + "<br/>"
        } else if (line.trim().startsWith("column") || line.trim().startsWith("@column")) {
            currentside = currentside.replace(currentcolumn, "")
            currentcolumn = line.trim().replace(" ", "_")
            currentside = currentside + "_" + currentcolumn
            currentside = currentside.replace("__", "_")
            linecounter = 0
            charcounter = 0
            result += line.trim() + "<br/>"
        } else if (line.trim().match(/^\d/)) {
            linecounter += 1
            charcounter = 0
            newline = line.trim()
            splitted = line.trim().split(" ")
            for (word of splitted) {
                word = word.replace("{", "-{").replace("}", "}-").trim()
                if (word.slice(-1) == "-") {
                    word = word.substring(0, word.length - 1)
                }
                word = word.replace("--", "-")
                lasttranslation = ""
                if (word.includes("-") || word.includes(".")) {
                    indexcounter=0
                    for (char of word.split(/[-\.]/)) {
                        if (char != "") {
                            indexcounter+=char.length
                            //console.log(curterm)
                           // console.log(currentside + "_" + linecounter + "_" + charcounter)
                            if (($("#images option:selected").text() in character_postags) && curterm in character_postags[$("#images option:selected").text()] && currentside + "_" + linecounter + "_" + charcounter in character_postags[$("#images option:selected").text()][curterm]) {
                                titleobj = character_postags[$("#images option:selected").text()][curterm][currentside + "_" + linecounter + "_" + charcounter]
                            }
                            if (typeof titleobj !== 'undefined' && titleobj["translation"] != lasttranslation) {
                                //console.log(titleobj)
                                result += "<span name=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" id=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" class=\"imagelink\" title=\"" + titleobj["word"] + " "
                                if (titleobj["translation"] != "_") {
                                    result += "[" + titleobj["translation"] + "] (" + titleobj["pos"] + ")\">"
                                    if (titleobj["translation"].includes("[") && !titleobj["translation"].includes("[1]")) {
                                        result += titleobj["translation"].substring(titleobj["translation"].indexOf("[") + 1, titleobj["translation"].indexOf("]")) + "</span>"
                                    } else {
                                        result += titleobj["translation"].replace("[1]", "") + "</span>"
                                    }
                                    lasttranslation = titleobj["translation"]
                                } else {
                                    result += "(" + titleobj["pos"] + ")\">"
                                    if (titleobj["translation"].includes("[") && !titleobj["translation"].includes("[1]")) {
                                        result += titleobj["translation"].substring(titleobj["translation"].indexOf("[") + 1, titleobj["translation"].indexOf("]")) + "</span>"
                                    } else {
                                        result += titleobj["translation"].replace("[1]", "") + "</span>"
                                    }
                                    lasttranslation = titleobj["translation"]
                                }
                            } else {
                                result += "<span name=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" id=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" class=\"imagelink\">" + char + "</span>"
                            }
                            if (!char.endsWith("}")) {
                                result += "&nbsp;"
                            }
                            charcounter += 1
                        }
                    }
                } else {
                    if (($("#images option:selected").text() in character_postags) && curterm in character_postags[$("#images option:selected").text()] && currentside + "_" + linecounter + "_" + charcounter in character_postags[$("#images option:selected").text()][curterm]) {
                        titleobj = character_postags[$("#images option:selected").text()][curterm][currentside + "_" + linecounter + "_" + charcounter]
                    }
                    /*console.log(character_postags)
                    console.log($("#images option:selected").text())
                    console.log(curterm)
                    console.log(currentside + "_" + linecounter + "_" + charcounter)*/
                    if (typeof titleobj !== 'undefined' && titleobj["translation"] != lasttranslation) {
                        //console.log(titleobj)
                        result += "<span name=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" id=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" class=\"imagelink\" title=\"" + titleobj["word"] + " "
                        if (titleobj["translation"] != "_") {
                            result += "[" + titleobj["translation"] + "] (" + titleobj["pos"] + ")\">" + titleobj["translation"] + "</span>&nbsp;"
                            lasttranslation = titleobj["translation"]
                        } else {
                            result += "(" + titleobj["pos"] + ")\">" + titleobj["translation"] + "</span>&nbsp;"
                            lasttranslation = titleobj["translation"]
                        }
                    } else {
                        result += "<span name=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" id=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" class=\"imagelink\">" + word + "</span>&nbsp;"
                    }
                    charcounter += 1
                }
            }
            result += "<br/>"
        } else {
            result += line + "<br/>"
        }
    }
    return result
}

function formatTransliteration(transliteration) {
    result = ""
    termmap = {
        "@obverse": "front",
        "@reverse": "back",
        "@left": "left",
        "@right": "right",
        "@top": "top",
        "@bottom": "bottom"
    }
    linecounter = 0
    charcounter = 0
    currentside = ""
    currentcolumn = ""
    curterm = ""
    for (line of transliteration.split("<br>")) {
        if (line.trim().startsWith("@")) {
            if (line.trim() in termmap) {
                currentside = termmap[line.trim()]
                curterm = line.trim()
            } else {
                currentside = line.trim()
                cuterm = currentside
            }
            linecounter = 0
            charcounter = 0
            result += line.trim() + "<br/>"
        } else if (line.trim().startsWith("column") || line.trim().startsWith("@column")) {
            currentside = currentside.replace(currentcolumn, "")
            currentcolumn = line.trim().replace(" ", "_")
            currentside = currentside + "_" + currentcolumn
            currentside = currentside.replace("__", "_")
            linecounter = 0
            charcounter = 0
            result += line.trim() + "<br/>"
        } else if (line.trim().match(/^\d/)) {
            linecounter += 1
            charcounter = 0
            newline = line.trim()
            splitted = line.trim().split(" ")
            for (word of splitted) {
                if (result.endsWith("-")) {
                    result = result.substring(0, result.length - 1) + "<span>&nbsp;</span>"
                }
                word = word.replace("{", "-{").replace("}", "}-").trim()
                if (word.slice(-1) == "-") {
                    word = word.substring(0, word.length - 1)
                }
                word = word.replace("--", "__-")
                if ((word.includes("-") || word.includes(".")) && !word.match(/^[0-9]+\s*\.$/)) {
                    wordsplitted = word.split(/[-\.]+/)            
                    wordlen = wordsplitted.length
                    wordlencounter = 0
                    /*console.log(word)
                    console.log("WORDSPLIT: ")
                    console.log(wordsplitted)*/
                    indexcounter=0
                    for (char of wordsplitted) {
                        indexcounter+=char.length            
                        if (char != "") {
                            //console.log(curterm)
                            //console.log(currentside + "_" + linecounter + "_" + charcounter)
                            if (($("#images option:selected").text() in character_postags) && curterm in character_postags[$("#images option:selected").text()] && currentside + "_" + linecounter + "_" + charcounter in character_postags[$("#images option:selected").text()][curterm]) {
                                titleobj = character_postags[$("#images option:selected").text()][curterm][currentside + "_" + linecounter + "_" + charcounter]
                            }
                            if (typeof titleobj !== 'undefined') {
                                //console.log(titleobj)
                                result += "<span name=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" id=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" class=\"imagelink\" title=\"" + titleobj["word"] + " "
                                if (titleobj["translation"] != "_") {
                                    result += "[" + titleobj["translation"] + "] (" + titleobj["pos"] + ")\">" + char + "</span>"
                                } else {
                                    result += "(" + titleobj["pos"] + ")\">" + char + "</span>"
                                }
                            } else {
                                result += "<span name=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" id=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" class=\"imagelink\">" + char + "</span>"
                            }
                            charcounter += 1
                            wordlencounter += 1
                            //console.log(word + " - " + wordsplitted[wordlencounter])
                            if (wordlencounter >= wordlen || typeof(wordsplitted[wordlencounter]) == "undefined") {
                                result += "<span>&nbsp;</span>"
                            } else if (wordlencounter < wordlen && char.endsWith("__")) {
                                if(word.charAt(indexcounter)=="-"  || word.charAt(indexcounter)=="."){
                                    result += word.charAt(indexcounter)
                                } 
                                if(word.charAt(indexcounter+1)=="-" || word.charAt(indexcounter+1)=="."){
                                    result += word.charAt(indexcounter+1)
                                }                              
                            } else if (wordlencounter < wordlen && char.slice(-1) != "}" && wordsplitted[wordlencounter].charAt(0) != "{") {
                                if(word.charAt(indexcounter)=="-" || word.charAt(indexcounter)=="."){
                                    result += word.charAt(indexcounter)
                                }
                                if(word.charAt(indexcounter+1)=="-" || word.charAt(indexcounter+1)=="."){
                                    result += word.charAt(indexcounter+1)
                                }
                            }
                            indexcounter+=1
                        }
                    }
                    result += "<span>&nbsp;</span>"
                } else {
                    //if (($("#images option:selected").text() in character_postags) && curterm in character_postags[$("#images option:selected").text()] && currentside + "_" + linecounter + "_" + charcounter in character_postags[$("#images option:selected").text()][curterm]) {
                    //    titleobj = character_postags[$("#images option:selected").text()][curterm][currentside + "_" + linecounter + "_" + charcounter]
                    //}
                    /*console.log(character_postags)
                    console.log($("#images option:selected").text())
                    console.log(curterm)
                    console.log(currentside + "_" + linecounter + "_" + charcounter)*/
                    if (typeof titleobj !== 'undefined') {
                        //console.log(titleobj)
                        result += "<span name=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" id=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" class=\"imagelink\" title=\"" + titleobj["word"] + " "
                        if (titleobj["translation"] != "_") {
                            result += "[" + titleobj["translation"] + "] (" + titleobj["pos"] + ")\">" + word + "</span><span>&nbsp;</span>"
                        } else {
                            result += "(" + titleobj["pos"] + ")\">" + word + "</span><span>&nbsp;</span>"
                        }
                    } else {
                        result += "<span name=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" id=\"" + currentside + "_" + linecounter + "_" + charcounter + "\" class=\"imagelink\">" + word + "</span><span>&nbsp;</span>"
                    }
                    charcounter += 1
                }
            }
            result += "<br/>"
        } else {
            result += line + "<br/>"
        }
    }
    result = result.replaceAll("-<br/>", "<br/>")
    result = result.replaceAll("__", "").replaceAll("__", "")
    return result
}

function manageApprovals() {
    tabletnumber = $('#images option:selected').val()
    side = $('#imageside option:selected').text().replace(".png", "").replace(tabletnumber + "_", "")
    if (!(tabletnumber in approvals)) {
        approvals[tabletnumber] = {}
    }
    if (!(side in approvals[tabletnumber])) {
        approvals[tabletnumber][side] = {}
    }
    if ("tags" in approvals[tabletnumber][side]) {
        approvaltags = approvals[tabletnumber][side]["tags"]
        taghtml = ""
        for (tag in approvaltags) {
            taghtml += "<span style=\"background-color:yellow;color:black;border-radius: 25px;border:1px solid black \">" + approvaltags[tag] + "</span>"
        }
        $('#mytags').html(taghtml)
    }
    if ("positioningcorrect" in approvals[tabletnumber][side]) {
        $('#positioningcorrect').val(approvals[tabletnumber][side]["positioningcorrect"]).change();
    }
    if ("transliterationcorrect" in approvals[tabletnumber][side]) {
        $('#transliterationcorrect').val(approvals[tabletnumber][side]["transliterationcorrect"]).change();
    }
    if ("indexingcorrect" in approvals[tabletnumber][side]) {
        $('#indexingcorrect').val(approvals[tabletnumber][side]["indexingcorrect"]).change();
    }
    if ("annotationscorrect" in approvals[tabletnumber][side]) {
        $('#annotationscorrect').val(approvals[tabletnumber][side]["annotationscorrect"]).change();
    }
    if ("annotationscomplete" in approvals[tabletnumber][side]) {
        $('#annotationscomplete').val(approvals[tabletnumber][side]["annotationscomplete"]).change();
    }
}
