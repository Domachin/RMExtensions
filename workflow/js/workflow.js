var stati = ["Esito","State (Workflow Contromisura)","State (Workflow Requisito sistema)","State (Workflow Requisito sottosistema)","State (Workflow Requisito software)","State (Workflow Requisito hardware)"];
var initialize = true;

function version()
{
	window.alert("prova 35");
	initialize=false;
}

function println(string,element) {
	var p = document.createElement("p");
	p.innerHTML = string;
	$(p).appendTo("#"+element);
};

function indexArtifact(/*RM.ArtifactRef[]*/ refs, /*RM.ArtifactRef*/ ref) {
	// Summary: Maintains a non-duplicating array of RM.ArtifactRef objects.
	var refPresent = false;
	for (var i = 0; i < refs.length; i++) {
		if (refs[i].equals(ref)) {
			refPresent = true;
		}
	}
	if (!refPresent) {
		refs.push(ref);
	}
};

var equal = "";
var toSave = [];
var numChanged = 0;
var idChanged = [];
var urlChanged = [];
var reqdone = false;
var cmdone = false;
var hzdone = false;
var type = "";

function isequal(string)
{
	return string == equal;
}

function updateStatus(item,string)
{
	if (item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"] != string)
	{
		item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"] = string;
		numChanged++;
		idChanged.push(parseInt(item.values[RM.Data.Attributes.IDENTIFIER]));
		uriChanged.push(item.ref.toUri());
		toSave.push(item);
	}
}
function updateReqStatus(item)
{
	$("#result").empty();
	println("Aggiornamento status requisiti...","result");
	var linkedStat = [];
	RM.Data.getLinkedArtifacts(item.ref, function(linksResult) {
		var artifactIndex = [];
		linksResult.data.artifactLinks.forEach(function(linkDefinition) {
		linkDefinition.targets.forEach(function(ref) {
			indexArtifact(artifactIndex, ref);
			});
		});
		window.alert("link number: " + artifactIndex.length);
		RM.Data.getAttributes(artifactIndex, [RM.Data.Attributes.IDENTIFIER, RM.Data.Attributes.ARTIFACT_TYPE,"Esito"] , function(attrResult) {
			window.alert("length: " + attrResult.data.length);
			attrResult.data.forEach(function(item2){
				var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				window.alert("Linked type: " + linkedtype);
				if (linkedtype == "Test")
				{
					window.alert("Req : " + item2.values["Esito"]);
					linkedStat.push(item2.values["Esito"]);
				}
			});
			equal = "Passato";
			if(linkedStat.length > 0 && linkedStat.every(isequal))
			{
				window.alert("modified ");
				updateStatus(item,"Validato");
			}
			println("Completato","result");
			reqdone = true;
		});
	});
}

async function updateCmStatus(item)
{
	var linkedStat = [];
	RM.Data.getLinkedArtifacts(item.ref, function(linksResult) {
		var artifactIndex = [];
		linksResult.data.artifactLinks.forEach(function(linkDefinition) {
		linkDefinition.targets.forEach(function(ref) {
			indexArtifact(artifactIndex, ref);
			});
		});
		RM.Data.getAttributes(artifactIndex, [RM.Data.Attributes.IDENTIFIER, RM.Data.Attributes.ARTIFACT_TYPE,"State (Workflow Requisito sistema)","State (Workflow Requisito sottosistema)","State (Workflow Requisito software)","State (Workflow Requisito hardware)"], function(attrResult) {
			attrResult.data.forEach(function(item2){
				var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				if (linkedtype.startsWith("Requisito ") && linkedtype != "Requisito input")
				{
					updateReqStatus(item2);
					while(true)
					{
						if (reqdone == true) break;
						await null;
					}
					$("#result").empty();
					println("Aggiornamento status contromisure...","result");
					linkedStat.push(item2.values["State (Workflow " + linkedtype + ")"]);
				}
			});
			equal = "Validato";
			if(linkedStat.length > 0 && linkedStat.every(isequal))
			{
				updateStatus(item,"Chiuso");
			}
			else if(linkedStat.length > 0)
			{
				updateStatus(item,"Coperto");
			}
			println("Completato","result");
			cmdone = true;
		});
	});
}

async function updateHzStatus(item)
{
	var linkedStat = [];
	RM.Data.getLinkedArtifacts(item.ref, function(linksResult) {
		var artifactIndex = [];
		linksResult.data.artifactLinks.forEach(function(linkDefinition) {
		linkDefinition.targets.forEach(function(ref) {
			indexArtifact(artifactIndex, ref);
			});
		});
		RM.Data.getAttributes(artifactIndex, [RM.Data.Attributes.IDENTIFIER, RM.Data.Attributes.ARTIFACT_TYPE, "State (Workflow Contromisura)"], function(attrResult) {
			attrResult.data.forEach(function(item2){
				var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				if (linkedtype == "Contromisura")
				{
					updateCmStatus(item2);
					while(true)
					{
						if (cmdone == true) break;
						await null;
					}
					$("#result").empty();
					println("Aggiornamento status hazard...","result");
					linkedStat.push(item2.values["State (Workflow Contromisura)"]);
				}
			});
			equal = "Chiuso";
			if(linkedStat.length > 0 && linkedStat.every(isequal))
			{
				updateStatus(item,"Chiuso");
			}
			else if(linkedStat.length > 0)
			{
				updateStatus(item,"Risolto");
			}
			println("Completato","result");
			hzdone = true;
		});
	});
}

async function saveResults()
{
	while(true)
	{
		if ((type.startsWith("Requisito ") && reqdone == true) || (type == "Contromisura" && cmdone == true) || (type == "Hazard" && hzdone == true)) break;
		await null;
	}
	println("Salvataggio in corso...","result");
	window.alert(toSave.length);
	RM.Data.setAttributes(toSave, function(result2){
		if(result2.code !== RM.OperationResult.OPERATION_OK)
		{
			window.alert("Error: " + result2.code);
		}
		var modified = "";
		var i;
		window.alert("salva");
		for(i=0;i<idChanged.length;i++)
		{
			modified = modified + "</br><a href=\"" + urlChanged[i] + "\">" + idChanged[i] + "</a>";
		}
		$("#result").empty();
		println("I seguenti " + numChanged + " artefatti sono stati aggiornati:" + modified,"result");
	});
}

$(function()
{
	if (initialize==true) version();
	
	var selection = [];
	var docName = "";
	println("Entrare in un modulo per aggiornare gli status","intro");
	RM.Event.subscribe(RM.Event.ARTIFACT_OPENED, function(selected) {
		$("#result").empty();
		selection = selected;
		RM.Data.getAttributes(selection, [RM.Data.Attributes.NAME,RM.Data.Attributes.FORMAT], function(result){			
			result.data.forEach(function(item){
				if (item.values[RM.Data.Attributes.FORMAT] === RM.Data.Formats.MODULE)
				{
					$("#intro").empty();
					println("Modulo: <b>"+item.values[RM.Data.Attributes.NAME]+"</b><br/><br/>Se si effettuano modifiche, uscire e rientrare nel modulo prima di ricalcolare.","intro");
					docName=item.values[RM.Data.Attributes.NAME]+"_";
				}
			});
		});
	});
	
	$("#SetStatus").on("click", function() {
		RM.Data.getContentsAttributes(selection, stati.concat([RM.Data.Attributes.ARTIFACT_TYPE,RM.Data.Attributes.IDENTIFIER]), function(result1){
			window.alert(result1.data.length);
			result1.data.forEach(function(item1){
				type = item1.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				//window.alert(type);
				if (type.startsWith("Requisito ") && type != "Requisito input")
				{
					updateReqStatus(item1);
				}
				else if (type == "Contromisura")
				{
					updateCmStatus(item1);
				}
				else if (type == "Hazard")
				{
					updateHzStatus(item1);
				}
			});
			saveResults();
		});
	});
});
