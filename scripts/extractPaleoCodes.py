"""
This script extract IIIF links from image annotation on IIIF resources and stores them on the webspace
"""

import os
import json
from svgpathtools import svg2paths, wsvg
from svgpathtools import svg2paths2

def sideStringFromURI(uri):
    result=[]
    if "back" in uri:
        return "back"
    if "front" in uri:
        return "front"
    if "right" in uri:
        return "right"
    if "left" in uri:
        return "left"
    if "top" in uri:
        return "top"
    if "bottom" in uri:
        return "bottom"
    return ""


result={}
resultSignName={}

with open('../js/data/charlistmap.js', 'r') as myfile:
    data=myfile.read()

# parse file
charlistmap = json.loads(data.replace("var charlistmap=",""))

with open('../js/data/cuneifymap.js', 'r') as myfile:
    data=myfile.read()

# parse file
cuneifymap = json.loads(data.replace("var cuneifymap=",""))

with open('../js/data/newurls2.js', 'r') as myfile:
    data=myfile.read()

# parse file
hs2IIIF = json.loads(data.replace("var hs2IIIF=",""))

for filename in os.listdir("result"):
    #print(sys.argv[1]+"/"+filename)
    if filename==".gitkeep" or filename.startswith("."):
        continue
    with open("result/"+filename) as json_file:
        jsondata=json.load(json_file)
    print(filename)
    for annotation in jsondata:
        translit=None
        translitrep=None
        paleocode=None
        line=None
        charindex=None
        for annoobj in jsondata[annotation]["body"]:
            if annoobj["purpose"]=="Line":
                line=annoobj["value"]
            if annoobj["purpose"]=="Charindex":
                charindex=annoobj["value"]
            if annoobj["purpose"]=="Transliteration":
                translit=annoobj["value"]
                translitrep=translit.replace("!","").replace("?","").replace(";","").replace("#","").replace("{","").replace("}","").replace("j","g").lower()
            if annoobj["purpose"]=="PaleoCode":
                paleocode=annoobj["value"]
        charclass=""
        if translit!=None:
            if translit not in result:
                result[translit]={}
            try:
                if translitrep in cuneifymap:
                    if len(cuneifymap[str(translitrep)])>1:
                        for chara in cuneifymap[str(translitrep)]:
                            cc="U+"+str(hex(ord(chara))).replace("0x","")
                            #print(str(chara)+" "+str(cc))
                            if cc.upper() in charlistmap and "signName" in charlistmap[cc.upper()] and charlistmap[cc.upper()]["signName"]!="":
                                charclass+=str(charlistmap[cc.upper()]["signName"]).replace(" ","_").replace(",","_").encode("ascii", "ignore").decode()+"+"
                            else:
                                charclass+=cc+"+"
                        print(charclass)                      
                    else:
                        charclass="other"
                        chara=cuneifymap[str(translitrep)]
                        cc="U+"+str(hex(ord(chara))).replace("0x","")
                        #print(str(chara)+" "+str(cc))
                        if cc.upper() in charlistmap and "signName" in charlistmap[cc.upper()] and charlistmap[cc.upper()]["signName"]!="":
                            charclass=str(charlistmap[cc.upper()]["signName"]).replace(" ","_").replace(",","_").encode("ascii", "ignore").decode()
                        else:
                            charclass="other"
                    if charclass.endswith("+"):
                        charclass=charclass[0:-1]
                    print("CharClass: "+str(translit)+" "+str(chara)+" "+str(cc)+" "+str(charclass))
                    if charclass not in resultSignName:
                        resultSignName[charclass]={}
                else:
                    print(translit)
                    print(translitrep+" not in cuneifymap")

            except Exception as e:
                print(e)
        if paleocode!=None and translit!=None and paleocode!="" and translit!="":
            if paleocode in result[translit]:
                result[translit][paleocode]=result[translit][paleocode]+1
            else:
                result[translit][paleocode]=1
        if "target" in jsondata[annotation] and "source" in jsondata[annotation]["target"]:
            targeturl=jsondata[annotation]["target"]["source"]
            targetsvg=jsondata[annotation]["target"]["selector"]["value"]
            if "svg" in targetsvg:
                f = open("temp.svg", 'w')
                f.write(jsondata[annotation]["target"]["selector"]["value"])
                f.close()
                path=svg2paths2("temp.svg")
                bb=path[0][0].bbox()
                coords=[]
                coords.append(int(bb[0]))
                coords.append(int(bb[1]))
                coords.append(int(bb[2]))
                coords.append(int(bb[3]))
            else:
                coords=jsondata[annotation]["target"]["selector"]["value"].replace("xywh","").replace("pixel:","").replace("=","").split(",")
            if translit in result and "images" not in result[translit]:
                result[translit]["images"]=[]
            if translit in result and filename in hs2IIIF:
                if isinstance(hs2IIIF[filename], list):
                    for fname in hs2IIIF[filename]:
                        #print(fname)
                        result[translit]["images"].append({"url":fname.replace("full/full",str(int(float(coords[0])))+","+str(int(float(coords[2])))+","+str(int(float(coords[1])-float(coords[0])))+","+str(int(float(coords[3])-float(coords[2])))+"/full"),"line":line,"charindex":charindex,"side":sideStringFromURI(fname),"filename":filename})
                else:
                    result[translit]["images"].append({"url":hs2IIIF[filename].replace("full/full",str(int(float(coords[0])))+","+str(int(float(coords[2])))+","+str(int(float(coords[1])-float(coords[0])))+","+str(int(float(coords[3])-float(coords[2])))+"/full"),"line":line,"charindex":charindex,"side":sideStringFromURI(filename),"filename":filename})
            if charclass in resultSignName and "images" not in resultSignName[charclass]:
                resultSignName[charclass]["images"]=[]
            if charclass in resultSignName and filename in hs2IIIF:
                if isinstance(hs2IIIF[filename], list):
                    for fname in hs2IIIF[filename]:
                        #print(fname)
                        resultSignName[charclass]["images"].append({"url":fname.replace("full/full",str(int(float(coords[0])))+","+str(int(float(coords[2])))+","+str(int(float(coords[1])-float(coords[0])))+","+str(int(float(coords[3])-float(coords[2])))+"/full"),"line":line,"charindex":charindex,"side":sideStringFromURI(fname),"filename":filename})
                else:
                    resultSignName[charclass]["images"].append({"url":hs2IIIF[filename].replace("full/full",str(int(float(coords[0])))+","+str(int(float(coords[2])))+","+str(int(float(coords[1])-float(coords[0])))+","+str(int(float(coords[3])-float(coords[2])))+"/full"),"line":line,"charindex":charindex,"side":sideStringFromURI(filename),"filename":filename})

jsonString = json.dumps(result,sort_keys=True)
jsonFile = open("../public/js/paleocodes.js", "w")
jsonFile.write("var paleocodemap="+jsonString)
jsonFile.close()

jsonString2 = json.dumps(resultSignName,sort_keys=True)
jsonFile2 = open("../public/js/paleocodesSign.js", "w")
jsonFile2.write("var paleocodemapSigns="+jsonString2)
jsonFile2.close()
