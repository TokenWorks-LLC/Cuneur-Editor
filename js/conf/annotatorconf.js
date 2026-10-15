var curnamespace="http://purl.org/cuneiform/"


var curimagemapping="maicubeda"
var curtextmapping="maicubeda"

var combined=[
{"label":"Noun (N)","uri":"http://purl.org/olia/Sumerian.owl#Noun"},
{"label":"Verb (V)","uri":"http://purl.org/olia/Sumerian.owl#Verb"},
{"label":"Adjective (AJ)","uri":"http://purl.org/olia/Sumerian.owl#Adjective"},
{"label":"Adverb (AV)","uri":"http://purl.org/olia/Sumerian.owl#Adverb"},
{"label":"Number (NU)","uri":"http://purl.org/olia/Sumerian.owl#Number"},
{"label":"Preposition (PRP)","uri":"http://purl.org/olia/Sumerian.owl#Preposition"},
{"label":"Demonstrative Pronoun (DP)","uri":"http://purl.org/olia/Sumerian.owl#DemonstrativePronoun"},
{"label":"Independent Pronoun (IP)","uri":"http://purl.org/olia/Sumerian.owl#IndependentPronoun"},
{"label":"Possessive Pronoun (IP)","uri":"http://purl.org/olia/Sumerian.owl#PossessivePronoun"},
{"label":"Interrogative Pronoun (QP)","uri":"http://purl.org/olia/Sumerian.owl#InterrogativePronoun"},
{"label":"Reflexive Pronoun (RP)","uri":"http://purl.org/olia/Sumerian.owl#ReflexivePronoun"},
{"label":"Indefinite Pronoun (XP)","uri":"http://purl.org/olia/Sumerian.owl#IndefinitePronoun"},
{"label":"Relative Pronoun (RP)","uri":"http://purl.org/olia/Sumerian.owl#RelativePronoun"},
{"label":"Determinative Pronoun (DET)","uri":"http://purl.org/olia/Sumerian.owl#DeterminativePronoun"},
{"label":"Conjunction (CNJ)","uri":"http://purl.org/olia/Sumerian.owl#Conjunction"},
{"label":"Interjection (J)","uri":"http://purl.org/olia/Sumerian.owl#Interjection"},
{"label":"Modal (MOD)","uri":"http://purl.org/olia/Sumerian.owl#ModalParticle"},
{"label":"Subjunction (SBJ)","uri":"http://purl.org/olia/Sumerian.owl#Subjunction"},
{"label":"Named Entity (NE)","uri":"http://purl.org/olia/Sumerian.owl#NamedEntity"},
{"label":"Agricultural Name (AG)","uri":"http://purl.org/olia/Sumerian.owl#AgriculturalName"},
{"label":"Celestial Name (CN)","uri":"http://purl.org/olia/Sumerian.owl#CelestialName"},
{"label":"Divine Name (DN)","uri":"http://purl.org/olia/Sumerian.owl#DivineName"},
{"label":"Ethnos Name (EN)","uri":"http://purl.org/olia/Sumerian.owl#EthnosName"},
{"label":"Field Name (FN)","uri":"http://purl.org/olia/Sumerian.owl#FieldName"},
{"label":"Geographical Name (GN)","uri":"http://purl.org/olia/Sumerian.owl#GeographicalName"},
{"label":"Line Name (LN)","uri":"http://purl.org/olia/Sumerian.owl#LineName"},
{"label":"Month Name (MN)","uri":"http://purl.org/olia/Sumerian.owl#MonthName"},
{"label":"Object Name (ON)","uri":"http://purl.org/olia/Sumerian.owl#ObjectName"},
{"label":"Person Name (PN)","uri":"http://purl.org/olia/Sumerian.owl#PersonName"},
{"label":"Quarter Name (QN)","uri":"http://purl.org/olia/Sumerian.owl#QuarterName"},
{"label":"Royal Name (RN)","uri":"http://purl.org/olia/Sumerian.owl#RoyalName"},
{"label":"Settlement Name (SN)","uri":"http://purl.org/olia/Sumerian.owl#SettlementName"},
{"label":"Temple Name (TN)","uri":"http://purl.org/olia/Sumerian.owl#TempleName"},
{"label":"Watercourse Name (WN)","uri":"http://purl.org/olia/Sumerian.owl#WatercourseName"},
{"label":"Year Name (YN)","uri":"http://purl.org/olia/Sumerian.owl#YearName"},
{"label":"plural","uri":"http://purl.org/olia/Sumerian.owl#Plural"},
{"label":"singular","uri":"http://purl.org/olia/Sumerian.owl#Singular"},
{"label":"possessive case (POSS)","uri":"http://purl.org/olia/Sumerian.owl#Possessive"},
{"label":"Broken","uri":curnamespace+"Broken"},
{"label":"Character","uri":curnamespace+"Character"},
{"label":"Line","uri":curnamespace+"Line"},
{"label":"Image","uri":curnamespace+"Image"},
{"label":"Word","uri":curnamespace+"Word"},
{"label":"Seal","uri":curnamespace+"Seal"},
{"label":"Phrase","uri":curnamespace+"Phrase"},
{"label":"Erased","uri":curnamespace+"Erased"},
{"label":"StrikeOut","uri":curnamespace+"StrikeOut"},
{"label":"Wordstart","uri":curnamespace+"Wordstart"},
{"label":"Wordend","uri":curnamespace+"Wordend"},
{"label":"InWord","uri":curnamespace+"InWord"},
{"label":"Wedge","uri":curnamespace+"Wedge"},
{"label":"UnknownIfWord","uri":curnamespace+"UnknownIfWord"}
]

var postaggingVocabulary=[
{"label":"Noun (N)","uri":"http://purl.org/olia/Sumerian.owl#Noun"},
{"label":"Verb (V)","uri":"http://purl.org/olia/Sumerian.owl#Verb"},
{"label":"Adjective (AJ)","uri":"http://purl.org/olia/Sumerian.owl#Adjective"},
{"label":"Adverb (AV)","uri":"http://purl.org/olia/Sumerian.owl#Adverb"},
{"label":"Number (NU)","uri":"http://purl.org/olia/Sumerian.owl#Number"},
{"label":"Preposition (PRP)","uri":"http://purl.org/olia/Sumerian.owl#Preposition"},
{"label":"Demonstrative Pronoun (DP)","uri":"http://purl.org/olia/Sumerian.owl#DemonstrativePronoun"},
{"label":"Independent Pronoun (IP)","uri":"http://purl.org/olia/Sumerian.owl#IndependentPronoun"},
{"label":"Possessive Pronoun (IP)","uri":"http://purl.org/olia/Sumerian.owl#PossessivePronoun"},
{"label":"Interrogative Pronoun (QP)","uri":"http://purl.org/olia/Sumerian.owl#InterrogativePronoun"},
{"label":"Reflexive Pronoun (RP)","uri":"http://purl.org/olia/Sumerian.owl#ReflexivePronoun"},
{"label":"Indefinite Pronoun (XP)","uri":"http://purl.org/olia/Sumerian.owl#IndefinitePronoun"},
{"label":"Relative Pronoun (RP)","uri":"http://purl.org/olia/Sumerian.owl#RelativePronoun"},
{"label":"Determinative Pronoun (DET)","uri":"http://purl.org/olia/Sumerian.owl#DeterminativePronoun"},
{"label":"Conjunction (CNJ)","uri":"http://purl.org/olia/Sumerian.owl#Conjunction"},
{"label":"Interjection (J)","uri":"http://purl.org/olia/Sumerian.owl#Interjection"},
{"label":"Modal (MOD)","uri":"http://purl.org/olia/Sumerian.owl#ModalParticle"},
{"label":"Subjunction (SBJ)","uri":"http://purl.org/olia/Sumerian.owl#Subjunction"},
{"label":"Named Entity (NE)","uri":"http://purl.org/olia/Sumerian.owl#NamedEntity"},
{"label":"Agricultural Name (AG)","uri":"http://purl.org/olia/Sumerian.owl#AgriculturalName"},
{"label":"Celestial Name (CN)","uri":"http://purl.org/olia/Sumerian.owl#CelestialName"},
{"label":"Divine Name (DN)","uri":"http://purl.org/olia/Sumerian.owl#DivineName"},
{"label":"Ethnos Name (EN)","uri":"http://purl.org/olia/Sumerian.owl#EthnosName"},
{"label":"Field Name (FN)","uri":"http://purl.org/olia/Sumerian.owl#FieldName"},
{"label":"Geographical Name (GN)","uri":"http://purl.org/olia/Sumerian.owl#GeographicalName"},
{"label":"Line Name (LN)","uri":"http://purl.org/olia/Sumerian.owl#LineName"},
{"label":"Month Name (MN)","uri":"http://purl.org/olia/Sumerian.owl#MonthName"},
{"label":"Object Name (ON)","uri":"http://purl.org/olia/Sumerian.owl#ObjectName"},
{"label":"Person Name (PN)","uri":"http://purl.org/olia/Sumerian.owl#PersonName"},
{"label":"Quarter Name (QN)","uri":"http://purl.org/olia/Sumerian.owl#QuarterName"},
{"label":"Royal Name (RN)","uri":"http://purl.org/olia/Sumerian.owl#RoyalName"},
{"label":"Settlement Name (SN)","uri":"http://purl.org/olia/Sumerian.owl#SettlementName"},
{"label":"Temple Name (TN)","uri":"http://purl.org/olia/Sumerian.owl#TempleName"},
{"label":"Watercourse Name (WN)","uri":"http://purl.org/olia/Sumerian.owl#WatercourseName"},
{"label":"Year Name (YN)","uri":"http://purl.org/olia/Sumerian.owl#YearName"}
]

var dataformatkey="ply_url"

var mlVocabulary=[{"label":"Broken","uri":curnamespace+"Broken"},{"label":"Character","uri":curnamespace+"Character"},{"label":"Line","uri":curnamespace+"Line"},{"label":"Image","uri":curnamespace+"Image"},{"label":"Word","uri":curnamespace+"Word"},{"label":"Seal","uri":curnamespace+"Seal"},{"label":"Phrase","uri":curnamespace+"Phrase"},{"label":"Erased","uri":curnamespace+"Erased"},{"label":"StrikeOut","uri":curnamespace+"StrikeOut"},{"label":"Wordstart","uri":curnamespace+"Wordstart"},{"label":"Wordend","uri":curnamespace+"Wordend"},{"label":"InWord","uri":curnamespace+"InWord"},{"label":"Wedge","uri":curnamespace+"Wedge"},{"label":"UnknownIfWord","uri":curnamespace+"UnknownIfWord"}]

var gitlabhost="https://gitlab.com"
const redirecturi="https://fcgl.pages.gitlab.com/cuneur-template/annotator.html"
const clientsecret="YOUR CLIENT SECRET HERE"
const authclientid="YOUR CLIENT AUTH ID HERE"
var repositoryid=45605029
var branch="main"
var readOnlyVar=false
const gitlabtoken="YOUR GITLAB COMMIT TOKEN HERE" 
const { Gitlab } = gitbeaker;
const api = new Gitlab({
  token: gitlabtoken, 
  host: 'https://gitlab.com',
  version: 4
});

 function authenticator(){
      if(!isAuthenticated()){
        authenticate();
      }else{
        logout();
      }
    }

	function authenticate(calledwithcode=false,hash=null,menustring="",logoutstring="Logout",baseurl="",welcome="Welcome ") {
		if(hash==null)
			hash=window.location.href
		if(hash.includes('code')){
			console.log("Got auth code, now requesting access code!")
			var querystring=hash.substring(hash.indexOf('#')+1)
			var authcode=querystring.substring(querystring.indexOf('=')+1,querystring.indexOf('&'))
			$.post('https://gitlab.rlp.net/oauth/token', {grant_type:'authorization_code', code:authcode,client_id:authclientid,redirect_uri:redirecturi,client_secret:clientsecret}).done(function(response){
				Cookies.set('cuneianno-token',response["access_token"])
					getCurrentUser().then(function(user){
					$('#rightmenucol').append('<a href="'+baseurl+'/editTablet/" class="hover-item" style="color:black;">'+menustring+'</a>')
					var userstring=welcome+" &nbsp;"+user["username"]+"! ";
					console.log(user)
					$('#loginmessage').html(userstring)
					$('#loginbutton').html(logoutstring);
				});
			});
			return true;
		}
		else if(hash.includes('access_token')){
			var querystring=hash.substring(hash.indexOf('#')+1)
			var accesstoken=querystring.substring(querystring.indexOf('=')+1,querystring.indexOf('&'))
			Cookies.set('cuneianno-token',accesstoken)
			reinitOSD()
			return true;
		}
		else if (Cookies.get('cuneianno-token')) {
			reinitOSD()
			return true;
		} else {

			$(document.body).append($.parseHTML(`<div id="githubAuthenticateModal" class="modal fade">
					<div class="modal-dialog modal-lg">
						<div class="modal-content">
							<div id="menu" class="modal-body">
								<div style="margin-bottom:2em">
									<button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
									<h4 id="gh-modal-title' class="modal-title" style="text-align:center;color:black"><img src="cuneiform_annotator_logo_200px.png" alt="Cuneiform Annotator" width="25" height="25">Cuneur Login</h4>
								</div>
								<div style="margin-top:1em">
									<div id="cwrc-message" style="text-align:center;margin-top:1em;color:black" >
										You must first authenticate through your Git provider to edit content.<br/>
										Without logging in you may only view content presented on this homepage.
									</div>
								</div>
								<div style="text-align:center;margin-top:3em;margin-bottom:3em" id="git-oath-btn-grp">
									<div class="input-group" >
										<div class="input-group-btn" style="color:white">
											<button type="button" id="git-oauth-btn" class="btn btn-default">Authenticate with your Git provider</button>
										</div>
									</div> <!--input group -->
								</div>
							</div><!-- /.modal-body --> 
						</div><!-- /.modal-content -->
					</div><!-- /.modal-dialog -->
				</div><!-- /.modal -->`));
		   
		   $('#loginbutton').click(function (event) {
			    authenticate();
			});
			
			$('#git-oauth-btn').click(function (event) {
				window.location.href = "https://gitlab.rlp.net/oauth/authorize?client_id="+authclientid+"&redirect_uri="+redirecturi+"&response_type=code&state=12345678&scope=api+read_api+read_user+read_repository+write_repository+profile";
			});
			
			$('#githubAuthenticateModal').modal('show').on('shown.bs.modal', function () {
				$(".modal").css('display', 'block');
			}).on('hidden.bs.modal', function () {
				$(this).remove();
			});

			return false;
		}
	}


function logout() {
	Cookies.remove('cuneianno-token')
}

function isAuthenticated() {
	var hash=window.location.href
	if(hash.includes('access_token')){
		var querystring=hash.substring(hash.indexOf('#')+1)
		var  token=querystring.substring(querystring.indexOf('=')+1,querystring.indexOf('&'))
		//alert(token)
		Cookies.set('cuneianno-token',token)
		//alert(listCookies())
	}
	console.log("Authmessage: "+Cookies.get('cuneianno-token'))
    if(Cookies.get('cuneianno-token') !== undefined){
		console.log(Cookies.get('cuneianno-token'))
		api.token=Cookies.get('cuneianno-token')
        return true;
    }else{
        return false;
    }
}

function getCurrentUser(){
	console.log(gitlabhost+"/api/v4/user?access_token="+Cookies.get('cuneianno-token'))
	return $.ajax({ url: gitlabhost+"/api/v4/user?access_token="+Cookies.get('cuneianno-token')})
} 


var threedimageToIndex={};
var indexedcharids=[]
var indexedhiglighted=false
var indexedchars=0
var presenter = null;

var annos3d={};

// Some catalog layouts do not load the optional local-photo module.
function catalogSaveAllowed() {
  return typeof LocalAnnotations === 'undefined' || LocalAnnotations.canSaveCatalog();
}

function guardCatalogSave() {
  if (catalogSaveAllowed()) return true;
  LocalAnnotations.catalogSaveBlocked();
  return false;
}

async function saveTransliteration(translitid,translits){
    if (!guardCatalogSave()) return false;
    var users= await api.RepositoryFiles.edit(repositoryid, "js/data/transliterations.js",branch,"var transliterations="+JSON.stringify(translits,null,2),"Committed Transliteration "+translitid)
}

async function getAnnotation(path){
  var users= await api.RepositoryFiles.show(repositoryid, "result/"+$('#imageside option:selected').text()+".json",branch);
  console.log(users)
  console.log(atob(users["content"]))
  return JSON.parse(atob(users["content"]))
}

async function getTextAnnotation(path){
  var users= await api.RepositoryFiles.show(repositoryid, "resulttextanno/"+$('#images option:selected').val()+".json",branch);
  console.log(users)
  console.log(atob(users["content"]))
  return JSON.parse(atob(users["content"]))
}

async function commitData(filename,annotations){
    if (!guardCatalogSave()) return false;
    var content = JSON.stringify(annotations,null,2);
    try{
    var users= await api.RepositoryFiles.create(repositoryid, "result/"+filename+".json",branch,content,"Committed "+filename+".json")
      $('#saveannotationsmessage').html("Annotations for "+filename+" have been saved in Git!")
    }catch (e) {
    if (!guardCatalogSave()) return false;
    var users= await api.RepositoryFiles.edit(repositoryid, "result/"+filename+".json",branch,content,"Committed "+filename+".json")
      $('#saveannotationsmessage').html("Annotations for "+filename+" have been saved in Git!")
    }
    //reinit(null) 
    console.log(users)
}

async function commitData(){
    if (!guardCatalogSave()) return false;
    var filename = $('#imageside option:selected').text();
    var content = JSON.stringify(curanno,null,2);
    console.log(curanno)
	$('#saveInGit').prop("disabled",true);
	if(curanno!={} && curanno!=[]){
		try{
			var users= await api.RepositoryFiles.create(repositoryid, "result/"+filename+".json",branch,content,"Committed "+filename+".json")
			$('#saveannotationsmessage').html("Annotations for "+$('#imageside option:selected').text()+" have been saved in Git!")
		}catch (e) {
			if (!guardCatalogSave()) return false;
			var users= await api.RepositoryFiles.edit(repositoryid, "result/"+filename+".json",branch,content,"Committed "+filename+".json")
			$('#saveannotationsmessage').html("Annotations for "+$('#imageside option:selected').text()+" have been saved in Git!")
		}finally{
			if (typeof LocalAnnotations !== 'undefined') LocalAnnotations.catalogSaveFinished();
			else $('#saveInGit').prop("disabled",false);
		}
		//reinit(null) 
		console.log(users)
	}
}

async function commitTextAnnotationData(){
    if (!guardCatalogSave()) return false;
    var filename = $('#images option:selected').val();
    var content = JSON.stringify(curanno,null,2);
    try{
    var users= await api.RepositoryFiles.create(repositoryid, "resulttextanno/"+filename+".json",branch,content,"Committed "+filename+".json")
      $('#saveannotationsmessage').html("Text Annotations for "+$('#images option:selected').val()+" have been saved in Git!")
    }catch (e) {
    if (!guardCatalogSave()) return false;
    var users= await api.RepositoryFiles.edit(repositoryid, "resulttextanno/"+annotationFileFromImageName(filename)+".json",branch,content,"Committed "+filename+".json")
      $('#saveannotationsmessage').html("Text Annotations for "+$('#images option:selected').val()+" have been saved in Git!")
    } 
    console.log(users)
}

async function commit3DBBOX(){
    if (!guardCatalogSave()) return false;
	var users= await api.RepositoryFiles.edit(repositoryid, "js/data/3dmodels.js",branch,"var models3D="+JSON.stringify(models3D,null,2),"Committed js/3dmodels.js")
}

async function saveApprovals(){
    if (!guardCatalogSave()) return false;
    tabletnumber=$('#images option:selected').val()
    side=$('#imageside option:selected').text().replace(".png","").replace(tabletnumber+"_","")
    if(!(tabletnumber in approvals)){
      approvals[tabletnumber]={}
    }
    if(!(side in approvals[tabletnumber])){
      approvals[tabletnumber][side]={}
    }
    approvals[tabletnumber][side]["tags"]=$('#tags').val()
    approvals[tabletnumber][side]["positioningcorrect"]=$('#positioningcorrect').val()
    approvals[tabletnumber][side]["transliterationcorrect"]=$('#transliterationcorrect').val()
    approvals[tabletnumber][side]["indexingcorrect"]=$('#indexingcorrect').val()
    approvals[tabletnumber][side]["annotationscorrect"]=$('#annotationscorrect').val()
    approvals[tabletnumber][side]["annotationscomplete"]=$('#annotationscomplete').val()
    var users= await api.RepositoryFiles.edit(repositoryid, "js/approvals.js",branch,"var approvals="+JSON.stringify(approvals,null,2),"Committed approvals for "+$('#imageside option:selected').text()+".json");
}
