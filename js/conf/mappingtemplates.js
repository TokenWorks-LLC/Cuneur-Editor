var textmappings={
    "maicubeda":{"label":"MaiCuBeDa",
    "config":{
        "Lemma":{"inputtype":"text","regex":"","handler":null,"uri":curnamespace+"Lemma","category":["all"]},
        "CitationForm":{"inputtype":"text","regex":"","handler":null,"uri":curnamespace+"CitationForm","category":["all"]},
        "MainSense":{"inputtype":"text","regex":"","handler":null,"uri":curnamespace+"Sense","category":["all"]}
    }
    }
}

var imagemappings={
    "maicubeda":{
        "label":"MaiCuBeDa",
        "config":{"PaleoCode":{"inputtype":"text","regex":"","handler":null,"paleocodage":true,"uri":curnamespace+"PaleoCode","category":["sign"]},
        "TabletSide":{"inputtype":"select","regex":"","handler":null,"uri":curnamespace+"TabletSide","data":{"selected":"selected","front":"front","back":"back","left":"left","right":"right","top":"top","bottom":"bottom","category":["sign","wedge"]}},
        "SignRotation":{"inputtype":"select","regex":"","handler":null,"uri":curnamespace+"SignRotation","data":{"0°":"0°","45°":"45°","90°":"90°","135°":"135°","180°":"180°","225°":"225°","270°":"270°","315°":"315°","360°":"360°"},"category":["sign"]},
        "Percentage Visible":{"inputtype":"slider","regex":"","handler":null,"uri":curnamespace+"PercentageVisible","data":{"Undefined":"Undefined","<25%":"<25%","<50%":"<50%","<75%":"<75%","<100%":"<100%"},"category":["sign"]},
        "Transliteration":{"inputtype":"text","regex":"","handler":null,"uri":curnamespace+"Transliteration","category":["sign"]},
        "Column":{"inputtype":"number","regex":"","handler":null,"uri":curnamespace+"Column","category":["sign","wedge"]},
        "Line":{"inputtype":"number","regex":"","handler":null,"uri":curnamespace+"Line","category":["sign","wedge"]},
        "Charindex":{"inputtype":"number","regex":"","handler":null,"uri":curnamespace+"Charindex","category":["sign","wedge"]},
        "Wedgeindex":{"inputtype":"number","regex":"","handler":null,"uri":curnamespace+"Wedgeindex","category":["wedge"]},
        "Wedgetype":{"inputtype":"select","regex":"","handler":null,"uri":curnamespace+"Wedgetype","data":{"undefined":"undefined","a":"Paleocode: A","b":"Paleocode: B","c":"Paleocode: C","d":"Paleocode D","e":"Paleocode E","f":"Paleocode F","w":"Paleocode: W","x":"Paleocode: X","y":"Paleocode: Y"},"category":["wedge"]},
        "Wordindex":{"inputtype":"number","regex":"","handler":null,"uri":curnamespace+"Wordindex","category":["sign","wedge"]}
        }
    }
}