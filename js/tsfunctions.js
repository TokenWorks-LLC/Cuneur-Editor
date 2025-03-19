function sparqlDataToSimpleData(response) {
    // Convert long JSON data from from SPARQL endpoint to short form
    let data = response.results.bindings;
    let columns = response.head.vars
    var convertedData = [];
    for (var i = 0 ; i < data.length ; i++) {
	  var convertedRow = {};
	  for (var key in data[i]) {
	      convertedRow[key] = data[i][key]['value'];
	    }
	    convertedData.push(convertedRow);
    }
    return {data: convertedData, columns: columns};
}

function getTSDropDown(tsconf){
  var post_url = tsconf["endpoint"];
  var post_data = "query=" + encodeURIComponent(tsconf["queries"]["tabletsdropdown"]) + '&format=json'
 
  $.post(post_url, post_data, function(response) {
    var simpleData = sparqlDataToSimpleData(response);
    console.log(simpleData)
    generateTSDropDownContents(simpleData,tsconf)
  }); 
}


function getTS3DModels(tsconf){
  qid=$('#images').val();
  var post_url = tsconf["endpoint"];
  var post_data = "query=" + encodeURIComponent(tsconf["queries"]["3dmodeldropdown"].replace("%%docid%%","<"+qid+"> ")) + '&format=json'
 
  $.post(post_url, post_data, function(response) {
    var simpleData = sparqlDataToSimpleData(response);
    console.log(simpleData)
    generateTS3DModelContents(simpleData)
  }); 
}

function loadVariantsTS(tsconf){
  qid=$('#images').val();
  var post_url = tsconf["endpoint"]
  var post_data = "query=" + encodeURIComponent(tsconf["queries"]["loadvariants"].replace("%%docid%%","<"+qid+"> ")) + '&format=json'
  getTS3DModels(tsconf);
  $.post(post_url, post_data, function(response) {
    var simpleData = sparqlDataToSimpleData(response);
    console.log(simpleData)
    varurls=processVariants(simpleData)
    loadVariants(varurls)
  }); 
}


function processVariants(simpleData){
  variantoptions=""
  varurls=[]
  for(url of simpleData["data"]){
    if("images" in url && url["images"]!=""){
      imgs=url["images"].split("||")
      for(img of imgs){
        img=img.trim()
        variantoptions+="<option value=\""+img.substring(0,img.lastIndexOf("_"))+"\">"+url["documentLabel"]+" "+img.substring(img.lastIndexOf("_"),img.length)+"</option>"
        varurls.push({"label":url["documentLabel"],"url":img.substring(0,img.lastIndexOf("_"))})
      }
    }
  }
  document.getElementById("imageside").innerHTML=variantoptions
  return varurls
}

function generateTS3DModelContents(simpleData){
  document.getElementById("3dimages").innerHTML=""
  options=""
  for(data of simpleData["data"]){
    if("document" in data && "documentLabel" in data && "3dmodel" in data){
      options+="<option value=\""+data["3dmodel"]+"\" selected=\"selected\">"
      if(data["document"] in editstats){
        options+=data["documentLabel"]+" ("+editstats[data["document"]]+")</option>"
      }else{
        options+=data["documentLabel"]+"</option>"
      } 
    }
  }
  console.log("3D Model Options: "+options)
  document.getElementById("3dimages").innerHTML=options
  setup3dhop()
  /*$('#3dimages').selectize({
    sortField: 'text',
    maxOptions: 5000
  });*/
}

function generateTSDropDownContents(simpleData,tsconf){
  options=""
  for(data of simpleData["data"]){
    if("document" in data){
      options+="<option value=\""+data["document"]+"\" selected=\"selected\">"
      if(typeof(editstats)!=='undefined' && editstats!=null && data["document"] in editstats){
        options+=data["documentLabel"]+" ("+editstats[data["document"]]+")</option>"
      }else{
        options+=data["documentLabel"]+"</option>"
      } 
    }
  }
  document.getElementById("images").innerHTML=options
  $('#images').selectize({
    sortField: 'text',
    maxOptions: 5000
  });    
  /*$('#3dimages').selectize({
    sortField: 'text',
    maxOptions: 5000
  });*/
  loadVariantsTS(tsconf)
}

function getTSTablets(tsconf){
    var post_url = tsconf["endpoint"];
    var post_data = "query=" + encodeURIComponent(tsconf["queries"]["tabletsquery"]) + '&format=json'
   
    $.post(post_url, post_data, function(response) {
	    var simpleData = sparqlDataToSimpleData(response);
      console.log(simpleData)
      createTSOverViewTable(simpleData,tsconf["id"])
    });
    //thetable="<table><thead><th>"
}

function createTSOverViewTable(fgresults,tsid){
  tablecontent=""
var periodss=Array.from(new Set(Object.values(periods)))
genress=periodss
console.log(genress)
for(url of fgresults["data"]){
    tablecontent+="<li data-groups='["
    var added=false
    if(url in periods){
      tablecontent+="\""+periods[url]+"\", "
      added=true
    }
    if(url in languages){
      if("genre" in languages[url]){
        tablecontent+="\""+languages[url]["genre"]+"\", "
        added=true
      }
      if("language" in languages[url]){
        tablecontent+="\""+languages[url]["language"]+"\", "
        added=true
      }
      if("material" in languages[url]){
        tablecontent+="\""+languages[url]["material"]+"\", "
        added=true
      }
    }
    if(added){
        tablecontent=tablecontent.substring(0,tablecontent.length-2)
    }
    tablecontent+="]' style=\"width:25%;background-color:white;border-radius:25px;\"><figure class=\"col-4@sm picture-item\" data-title=\""+url["documentLabel"]+"\"><div class=\"aspect aspect--16x9\"><div class=\"aspect__inner\"><a target=\"_blank\" href=\"annotatorts.html?ts="+tsid+"&tabletid="+url["document"]+"\">"
    if("images" in url && url["images"]!=""){
        imgs=url["images"].split("||")
        for(img of imgs){
          img=img.trim()
          if(img.includes("Front") || img.includes("front") ){
            tablecontent+="<img width=\"300\" height=\"200\" onerror=\"this.onerror=null; this.src='assets/images/placeholder.png'\" src=\""+img.replace("_Front","").replace("full/full","full/pct:10")+"\" loading=\"lazy\" alt=\""+url["documentLabel"]+"\"/>"
          }
        }
    }else{
      tablecontent+="<img width=\"300\" height=\"200\" onerror=\"this.onerror=null; this.src='assets/images/placeholder.png'\" src=\"assets/images/placeholder.png\" loading=\"lazy\" alt=\""+url["documentLabel"]+"\"/>"
    }
    tablecontent+="</a>"
    tablecontent+="</div></div><figcaption style=\"color:black\" class=\"picture-item__title\"><a target=\"_blank\" href=\"annotatorts.html?ts="+tsid+"&tabletid="+url["document"]+"\" style=\"font-weight:bold;color:black\">"+url["documentLabel"]+"</a>"
    if(url in hs2CDLI){
      tablecontent+=" (<a href=\"https://cdli.ucla.edu/search/search_results.php?SearchMode=Text&ObjectID="+hs2CDLI[url]+"\">"+hs2CDLI[url]+"</a>) "
    }
    if(url in transliterations){
      tablecontent+=" <b>(T)</b>"
    }
    if(typeof(editstats)!=='undefined' && editstats!=null && url in editstats){
      tablecontent+=" <b>("+editstats[url]+")</b>"
    }
    tablecontent+="<br/>"
    if(url in languages){
      if("genre" in languages[url]){
        tablecontent+="<b>"+languages[url]["genre"]+"</b><br/>"
      }
    }
    if(url in periods){
      tablecontent+="<b>"+periods[url]+"</b> "
    }
    tablecontent+="<br/></figcaption></figure></li>"
}
$('#tabcontent').html(tablecontent)
//window.onload = function () {
categories="<li class=\"selected\" data-target=\"all\">All</li>"
console.log(genress)
for(genre of genress){
   if(genre!=""){
      categories+="<li style=\"border:2px solid black\" data-target=\""+genre+"\">"+genre+"</li>"
   }   
}
$('#shuffle-categories').html(categories)
var Shuffle = window.Shuffle;
var element = document.querySelector('.shuffle-container');
shuffleInstance = new Shuffle(element, {
  itemSelector: 'li'
}); 
$('.shuffle-filter li').on('click',function(e){
  $('#tabletsearch').val("")
  e.preventDefault();
  $('.shuffle-filter li').removeClass('selected');
  $(this).addClass('selected'); 
  var keyword = $(this).attr('data-target');
  console.log(keyword)
  shuffleInstance.filter(keyword);
});

}